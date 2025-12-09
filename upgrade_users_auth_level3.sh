#!/usr/bin/env bash
set -e

echo "🔥 Upgrading users-service to Level 3 production auth..."

SERVICE_DIR="services/users-service"

if [ ! -d "$SERVICE_DIR" ]; then
  echo "❌ $SERVICE_DIR not found. Run this from the lumariq project root."
  exit 1
fi

cd "$SERVICE_DIR"

mkdir -p prisma src/lib src/types src/middleware src/controllers src/routes src/utils

echo "🧬 Updating prisma/schema.prisma..."
cat > prisma/schema.prisma <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  sessions      Session[]
  refreshTokens RefreshToken[]
}

model Session {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  userAgent  String?
  ipAddress  String?
  valid      Boolean  @default(true)
  createdAt  DateTime @default(now())
  expiresAt  DateTime
}

model RefreshToken {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  session    Session? @relation(fields: [sessionId], references: [id])
  sessionId  String?
  revoked    Boolean  @default(false)
  createdAt  DateTime @default(now())
  expiresAt  DateTime
}
EOF

echo "📦 Ensuring Prisma + bcrypt/jsonwebtoken/date-fns installed..."
npm install @prisma/client prisma bcryptjs jsonwebtoken date-fns

echo "📦 Ensuring needed @types installed..."
npm install -D @types/bcryptjs @types/jsonwebtoken @types/express @types/cors @types/morgan

echo "📚 Writing src/lib/prisma.ts..."
cat > src/lib/prisma.ts <<'EOF'
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});
EOF

echo "📚 Writing src/types/auth.ts..."
cat > src/types/auth.ts <<'EOF'
export type Role = 'USER' | 'ADMIN';

export interface AccessPayload {
  sub: string;      // user id
  role: Role;
  type: 'access';
}

export interface RefreshPayload {
  sub: string;      // user id
  tokenId: string;  // refresh token row id
  type: 'refresh';
}

export interface AuthContext {
  userId: string;
  role: Role;
}
EOF

echo "🔐 Writing src/utils/hash.ts..."
cat > src/utils/hash.ts <<'EOF'
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
EOF

echo "🔑 Writing src/utils/jwt.ts..."
cat > src/utils/jwt.ts <<'EOF'
import jwt from 'jsonwebtoken';
import { AccessPayload, RefreshPayload, Role } from '../types/auth';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me';

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '30d';

export function signAccessToken(userId: string, role: Role): string {
  const payload: AccessPayload = {
    sub: userId,
    role,
    type: 'access',
  };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(userId: string, tokenId: string): string {
  const payload: RefreshPayload = {
    sub: userId,
    tokenId,
    type: 'refresh',
  };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;

  if (typeof decoded !== 'object' || decoded.type !== 'access') {
    throw new Error('Invalid access token type');
  }

  return {
    sub: String(decoded.sub),
    role: decoded.role as Role,
    type: 'access',
  };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;

  if (typeof decoded !== 'object' || decoded.type !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }
  if (!decoded.tokenId) {
    throw new Error('Missing tokenId in refresh token');
  }

  return {
    sub: String(decoded.sub),
    tokenId: String(decoded.tokenId),
    type: 'refresh',
  };
}
EOF

echo "🛡️ Writing src/middleware/auth.middleware.ts..."
cat > src/middleware/auth.middleware.ts <<'EOF'
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthContext, Role } from '../types/auth';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_authorization_header' });
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    const ctx: AuthContext = { userId: payload.sub, role: payload.role };
    res.locals.auth = ctx;
    return next();
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(401).json({ error: 'invalid_or_expired_token' });
  }
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = res.locals.auth as AuthContext | undefined;
    if (!ctx) {
      return res.status(401).json({ error: 'not_authenticated' });
    }
    if (ctx.role !== role) {
      return res.status(403).json({ error: 'forbidden' });
    }
    return next();
  };
}
EOF

echo "🎮 Writing src/controllers/auth.controller.ts..."
cat > src/controllers/auth.controller.ts <<'EOF'
import { Request, Response } from 'express';
import { add } from 'date-fns';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthContext } from '../types/auth';

const SESSION_TTL_DAYS = 30;
const REFRESH_TTL_DAYS = 30;

function getClientInfo(req: Request) {
  const ip =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    null;

  const ua = req.headers['user-agent'] || null;

  return { ipAddress: ip, userAgent: ua };
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'email_and_password_required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'email_already_exists' });
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'USER',
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'email_and_password_required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'invalid_credentials' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'invalid_credentials' });
    }

    const { ipAddress, userAgent } = getClientInfo(req);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        expiresAt: add(new Date(), { days: SESSION_TTL_DAYS }),
      },
    });

    const refreshRow = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        expiresAt: add(new Date(), { days: REFRESH_TTL_DAYS }),
      },
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, refreshRow.id);

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      session: {
        id: session.id,
        ipAddress,
        userAgent,
        expiresAt: session.expiresAt,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export async function me(req: Request, res: Response) {
  const ctx = res.locals.auth as AuthContext | undefined;
  if (!ctx) {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  return res.json({ user });
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      return res.status(400).json({ error: 'refresh_token_required' });
    }

    const payload = verifyRefreshToken(token);

    const existing = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });

    if (!existing || existing.revoked || existing.expiresAt < new Date()) {
      return res.status(401).json({ error: 'refresh_token_invalid' });
    }

    // rotate
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revoked: true },
    });

    const newRow = await prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        sessionId: existing.sessionId,
        expiresAt: add(new Date(), { days: REFRESH_TTL_DAYS }),
      },
    });

    const accessToken = signAccessToken(existing.user.id, existing.user.role);
    const newRefreshToken = signRefreshToken(existing.user.id, newRow.id);

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const ctx = res.locals.auth as AuthContext | undefined;
    const { token } = req.body as { token?: string };

    if (!ctx) {
      return res.status(401).json({ error: 'not_authenticated' });
    }

    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await prisma.refreshToken.updateMany({
          where: { id: payload.tokenId, userId: ctx.userId },
          data: { revoked: true },
        });
      } catch (err) {
        console.warn('logout: invalid refresh token in body, ignoring');
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export async function logoutAllSessions(req: Request, res: Response) {
  const ctx = res.locals.auth as AuthContext | undefined;
  if (!ctx) {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  await prisma.refreshToken.updateMany({
    where: { userId: ctx.userId, revoked: false },
    data: { revoked: true },
  });

  await prisma.session.updateMany({
    where: { userId: ctx.userId, valid: true },
    data: { valid: false },
  });

  return res.json({ success: true });
}
EOF

echo "🧭 Writing src/routes/auth.routes.ts..."
cat > src/routes/auth.routes.ts <<'EOF'
import express from 'express';
import {
  register,
  login,
  me,
  refreshToken,
  logout,
  logoutAllSessions,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);
router.post('/logout-all', requireAuth, logoutAllSessions);

router.get('/health', (_req, res) => {
  res.json({ status: 'users-service ok' });
});

export default router;
EOF

echo "✅ Level 3 auth files written for users-service."
echo "Next steps:"
echo "  1) Ensure .env has DATABASE_URL and ACCESS/REFRESH secrets."
echo "  2) Run:  cd services/users-service"
echo "           npx prisma migrate dev --name auth_level3"
echo "           npm run dev"