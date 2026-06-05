'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';
import { useEffect, useState } from 'react';

export function dispatchXpToast(delta: number) {
    window.dispatchEvent(new CustomEvent('xp-toast', { detail: { delta } }));
}

export default function Navbar() {
    const path = usePathname();
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [xpToast, setXpToast] = useState<{ delta: number; key: number } | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        function onXpToast(e: Event) {
            const { delta } = (e as CustomEvent<{ delta: number }>).detail;
            setXpToast({ delta, key: Date.now() });
        }
        window.addEventListener('xp-toast', onXpToast);
        return () => window.removeEventListener('xp-toast', onXpToast);
    }, []);

    useEffect(() => {
        if (!xpToast) return;
        const timer = setTimeout(() => setXpToast(null), 2200);
        return () => clearTimeout(timer);
    }, [xpToast?.key]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [path]);

    const navLink = (href: string, label: string) => (
        <Link
            href={href}
            style={{
                color: path === href ? '#1a6b7c' : '#374151',
                fontWeight: path === href ? 600 : 400,
                textDecoration: path === href ? 'underline' : 'none',
                textUnderlineOffset: 4,
                fontSize: 15,
            }}
        >
            {label}
        </Link>
    );

    return (
        <>
            <header
                style={{
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 32px',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <rect width="20" height="20" rx="3" fill="#c0392b" />
                        <rect x="2" y="2" width="7" height="7" rx="1" fill="white" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: 20, color: '#c0392b', letterSpacing: '-0.5px' }}>
                        Pokédex
                    </span>
                </Link>

                <nav className="navbar-nav" style={{ gap: 28, alignItems: 'center' }}>
                    {navLink('/', 'Home')}
                    {navLink('/explore', 'Explore')}
                    {navLink('/my-team', 'My Team')}
                    {navLink('/quiz', 'Quiz')}
                </nav>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {!isLoading && (
                        user ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => router.push('/profile')}
                                    style={avatarButtonStyle}
                                    title={user.username}
                                >
                                    <div style={avatarCircleStyle}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="navbar-username" style={usernameStyle}>{user.username}</span>
                                </button>
                                {xpToast && (
                                    <div
                                        key={xpToast.key}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: 6,
                                            background: xpToast.delta > 0 ? '#dcfce7' : '#fee2e2',
                                            color: xpToast.delta > 0 ? '#16a34a' : '#dc2626',
                                            border: `1.5px solid ${xpToast.delta > 0 ? '#86efac' : '#fca5a5'}`,
                                            borderRadius: 8,
                                            padding: '4px 10px',
                                            fontSize: 13,
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            zIndex: 100,
                                            pointerEvents: 'none',
                                            animation: 'xpToastIn 0.2s ease',
                                        }}
                                    >
                                        {xpToast.delta > 0 ? `+${xpToast.delta} XP` : `${xpToast.delta} XP`}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="navbar-nav" style={{ gap: 8, alignItems: 'center' }}>
                                <Link href="/signin" style={signInStyle}>Sign in</Link>
                                <Link href="/signup" style={signUpStyle}>Sign up</Link>
                            </div>
                        )
                    )}
                    <button
                        className="navbar-mobile-menu"
                        onClick={() => setMobileMenuOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                        <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
                        <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                    </button>
                </div>
            </header>

            <div className={`navbar-drawer${mobileMenuOpen ? ' open' : ''}`}>
                {navLink('/', 'Home')}
                {navLink('/explore', 'Explore')}
                {navLink('/my-team', 'My Team')}
                {navLink('/quiz', 'Quiz')}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4 }}>
                    {!isLoading && (
                        user ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={avatarCircleStyle}>{user.username.charAt(0).toUpperCase()}</div>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{user.username}</span>
                                </div>
                                <Link href="/profile" style={{ fontSize: 13, color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Profile</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Link href="/signin" style={{ ...signInStyle, flex: 1, textAlign: 'center' }}>Sign in</Link>
                                <Link href="/signup" style={{ ...signUpStyle, flex: 1, textAlign: 'center' }}>Sign up</Link>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}

const avatarButtonStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s',
};

const avatarCircleStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: '50%',
    background: '#c0392b', color: 'white',
    fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
};

const usernameStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 500, color: '#374151',
    maxWidth: 120, overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

const signInStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 500, color: '#374151',
    textDecoration: 'none', padding: '6px 12px',
    borderRadius: 8, border: '1px solid #e5e7eb',
};

const signUpStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 600, color: 'white',
    textDecoration: 'none', padding: '6px 12px',
    borderRadius: 8, background: '#c0392b', border: '1px solid #c0392b',
};