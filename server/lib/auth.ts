import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "session";

export interface JwtUser {
  id: number;
  email: string;
}

export function signSession(user: JwtUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function setSessionCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? "lax" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function verifyJwt(req: Request, _res: Response, next: NextFunction) {
  const token = (req as any).cookies?.[COOKIE_NAME] || req.headers["authorization"]?.toString().replace(/^Bearer\s+/i, "");
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtUser;
    (req as any).user = payload;
  } catch {}
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) return res.status(401).json({ error: "Unauthorized" });
  next();
}
