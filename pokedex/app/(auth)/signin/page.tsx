'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/auth/AuthContext';
import { signIn } from '@/actions/auth';

export default function SigninPage() {
    const router = useRouter();
    const { setSession } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await signIn(form);

        if (!result.success) {
            setError(result.message);
            setIsLoading(false);
            return;
        }

        setSession(result.token, result.user);
        router.push('/');
    }

    const handleGoogleSignin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            setError('');
            try {
                const userInfoRes = await fetch(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`,
                        },
                    }
                );
                const userInfo = await userInfoRes.json();

                const res = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accessToken: tokenResponse.access_token,
                        userInfo,
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    setError(data.message ?? 'Google sign-in failed');
                    return;
                }

                setSession(data.token, data.user);
                router.push('/');
            } catch {
                setError('Google sign-in failed. Try again.');
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: () => setError('Google sign-in was cancelled or failed.'),
    });

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <div style={logoRowStyle}>
                    <svg width="28" height="28" viewBox="0 0 20 20">
                        <rect width="20" height="20" rx="3" fill="#c0392b" />
                        <rect
                            x="2"
                            y="2"
                            width="7"
                            height="7"
                            rx="1"
                            fill="white"
                        />
                    </svg>
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: 22,
                            color: '#c0392b',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Pokédex
                    </span>
                </div>

                <h1 style={headingStyle}>Welcome back</h1>
                <p style={subheadingStyle}>Sign in to your account</p>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                    }}
                >
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Email</label>
                        <input
                            style={inputStyle}
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    email: e.target.value,
                                }))
                            }
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    password: e.target.value,
                                }))
                            }
                            placeholder="Your password"
                            required
                        />
                    </div>

                    {error && <p style={errorStyle}>{error}</p>}

                    <button
                        style={
                            isLoading
                                ? { ...buttonStyle, opacity: 0.7 }
                                : buttonStyle
                        }
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div style={dividerStyle}>
                    <span style={dividerLineStyle} />
                    <span style={dividerTextStyle}>or</span>
                    <span style={dividerLineStyle} />
                </div>

                <button
                    style={
                        isGoogleLoading
                            ? { ...googleButtonStyle, opacity: 0.7 }
                            : googleButtonStyle
                    }
                    onClick={() => handleGoogleSignin()}
                    disabled={isGoogleLoading}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path
                            fill="#4285F4"
                            d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
                        />
                        <path
                            fill="#34A853"
                            d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.14z"
                        />
                        <path
                            fill="#EA4335"
                            d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8 8 0 0 0 1.83 5.43L4.5 7.5a4.77 4.77 0 0 1 4.48-3.92z"
                        />
                    </svg>
                    {isGoogleLoading ? 'Signing in…' : 'Continue with Google'}
                </button>

                <p style={footerTextStyle}>
                    No account?{' '}
                    <Link href="/signup" style={linkStyle}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
};

const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
};

const logoRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
};

const headingStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 4px',
};

const subheadingStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#6b7280',
    margin: '0 0 28px',
};

const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
};

const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
};

const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    background: '#fafafa',
};

const buttonStyle: React.CSSProperties = {
    marginTop: 6,
    padding: '11px',
    borderRadius: 8,
    background: '#c0392b',
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
};

const dividerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '20px 0',
};

const dividerLineStyle: React.CSSProperties = {
    flex: 1,
    height: 1,
    background: '#e5e7eb',
};

const dividerTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#9ca3af',
};

const googleButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '11px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: 'white',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#c0392b',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '8px 12px',
    margin: 0,
};

const footerTextStyle: React.CSSProperties = {
    marginTop: 20,
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
};

const linkStyle: React.CSSProperties = {
    color: '#c0392b',
    fontWeight: 500,
    textDecoration: 'none',
};
