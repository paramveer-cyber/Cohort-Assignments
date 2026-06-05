'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth/AuthContext';
import { signUp } from '@/actions/auth';

export default function SignupPage() {
    const router = useRouter();
    const { setSession } = useAuth();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await signUp(form);

        if (!result.success) {
            setError(result.message);
            setIsLoading(false);
            return;
        }

        setSession(result.token, result.user);
        router.push('/');
    }

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

                <h1 style={headingStyle}>Create account</h1>
                <p style={subheadingStyle}>Start building your team</p>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                    }}
                >
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Username</label>
                        <input
                            style={inputStyle}
                            type="text"
                            value={form.username}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    username: e.target.value,
                                }))
                            }
                            placeholder="Trainer name"
                            required
                        />
                    </div>
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
                            placeholder="At least 8 characters"
                            minLength={8}
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
                        {isLoading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p style={footerTextStyle}>
                    Already have an account?{' '}
                    <Link href="/signin" style={linkStyle}>
                        Sign in
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
