'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createTokenStore, AuthUser, TokenStore } from '@/lib/auth/tokenStore';

type AuthContextValue = {
    user: AuthUser | null;
    isLoading: boolean;
    store: TokenStore;
    setSession: (token: string, user: AuthUser) => void;
    clearSession: () => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const store = createTokenStore();

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const initialized = useRef(false);

    const setSession = useCallback((token: string, authUser: AuthUser) => {
        store.setAccessToken(token);
        store.setUser(authUser);
        setUser(authUser);
    }, []);

    const clearSession = useCallback(() => {
        store.clearAccessToken();
        store.clearUser();
        setUser(null);
    }, []);

    const logout = useCallback(async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        clearSession();
    }, [clearSession]);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function tryRefresh() {
            try {
                const res = await fetch('/api/auth/refresh', { method: 'POST' });
                if (!res.ok) { setIsLoading(false); return; }

                const data = await res.json();
                store.setAccessToken(data.token);

                const meRes = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${data.token}` },
                });
                if (!meRes.ok) { setIsLoading(false); return; }

                const meData = await meRes.json();
                store.setUser(meData.user);
                setUser(meData.user);
            } catch {
            } finally {
                setIsLoading(false);
            }
        }

        tryRefresh();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, store, setSession, clearSession, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
