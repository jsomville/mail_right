export type Role = "USER" | "ADMIN";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role?: Role;
}
