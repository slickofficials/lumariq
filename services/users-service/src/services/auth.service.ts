import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";

export async function createUser(email: string, password: string) {
  const hashed = await hashPassword(password);

  return prisma.user.create({
    data: {
      email,
      passwordHash: hashed,
      role: "USER",
    },
  });
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return null;

  return user;
}

export async function createRefreshToken(userId: number) {
  const token = randomBytes(40).toString("hex");

  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt: addHours(new Date(), 72),
    },
  });
}

// Rotate old refresh token -> new one.
// Schema assumption:
// model RefreshToken {
//   id             Int      @id @default(autoincrement())
//   userId         Int
//   token          String   @unique
//   expiresAt      DateTime
//   isRevoked      Boolean  @default(false)
//   replacedByToken String?
//   user           User     @relation(fields: [userId], references: [id])
// }
export async function rotateRefreshToken(oldTokenId: number, userId: number) {
  const newTokenStr = randomBytes(40).toString("hex");

  // 1) Create new token row
  const newRecord = await prisma.refreshToken.create({
    data: {
      userId,
      token: newTokenStr,
      expiresAt: addHours(new Date(), 72),
    },
  });

  // 2) Mark old token as revoked and link by string
  await prisma.refreshToken.update({
    where: { id: oldTokenId },
    data: {
      isRevoked: true,
      replacedByToken: newRecord.token,
    },
  });

  // 3) Return the new token
  return newRecord;
}
