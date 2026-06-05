'use client';

export type AuthUser = {
    id: string;
    username: string;
    email: string;
    provider: string;
    createdAt: Date;
};

export type TokenStore = {
    getAccessToken: () => string | null;
    setAccessToken: (token: string) => void;
    clearAccessToken: () => void;
    getUser: () => AuthUser | null;
    setUser: (user: AuthUser) => void;
    clearUser: () => void;
};

export function createTokenStore(): TokenStore {
    let accessToken: string | null = null;
    let currentUser: AuthUser | null = null;

    return {
        getAccessToken: () => accessToken,
        setAccessToken: (token) => {
            accessToken = token;
        },
        clearAccessToken: () => {
            accessToken = null;
        },
        getUser: () => currentUser,
        setUser: (user) => {
            currentUser = user;
        },
        clearUser: () => {
            currentUser = null;
        },
    };
}
