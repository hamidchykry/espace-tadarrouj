import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "boujdour-training-center-secret-key-2026"
);

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  workshopId?: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

const ADMIN_ROLES = ["ADMIN", "TEACHER", "COORDINATOR"];

export async function getStaffSession(): Promise<JWTPayload | null> {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) return null;
  return session;
}
