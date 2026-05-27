export interface CookieResponse {
  cookie?: (name: string, value: string, options?: Record<string, unknown>) => void;
  clearCookie?: (name: string, options?: Record<string, unknown>) => void;
}

export interface CookieRequest {
  cookies?: Record<string, string | undefined>;
}

const makeSetter = (name: string, opts: Record<string, unknown>) =>
  (res: CookieResponse, value: string) =>
    res.cookie?.(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      ...opts,
    });

const makeGetter = (name: string) =>
  (req: CookieRequest): string | undefined =>
    req.cookies?.[name];

const makeClearer = (name: string) =>
  (res: CookieResponse) =>
    res.clearCookie?.(name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

const REFRESH_COOKIE = "refresh_token";

export const setRefreshTokenCookie = makeSetter(REFRESH_COOKIE, {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

export const getRefreshTokenCookie = makeGetter(REFRESH_COOKIE);

export const clearRefreshTokenCookie = makeClearer(REFRESH_COOKIE);
