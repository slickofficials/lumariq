export type RoleName = "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  role: RoleName;
}

export interface AccessPayload {
  userId: string; // stringified user id
  role: RoleName;
  type: "access";
}

export interface RefreshPayload {
  userId: string; // stringified user id
  token: string;  // DB token string
  type: "refresh";
}