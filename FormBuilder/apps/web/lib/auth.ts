let accessToken: string | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string) {
  accessToken = token;
}

export function clearToken() {
  accessToken = null;
}

export function isLoggedIn(): boolean {
  return !!accessToken;
}
