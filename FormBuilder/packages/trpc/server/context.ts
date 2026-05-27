import { verifyToken } from "@repo/services/auth";
import { getUserById } from "@repo/services/user";

export interface RawRequest {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
  socket: { remoteAddress?: string };
}

export interface RawResponse {
  cookie?: (name: string, value: string, options?: Record<string, unknown>) => void;
  clearCookie?: (name: string, options?: Record<string, unknown>) => void;
}

export async function createContext({ req, res }: { req: RawRequest; res: RawResponse }) {
  const authHeader = (req.headers["authorization"] as string | undefined) ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let currentUser = null;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      currentUser = await getUserById(payload.userId);
    }
  }

  return { req, res, currentUser };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
