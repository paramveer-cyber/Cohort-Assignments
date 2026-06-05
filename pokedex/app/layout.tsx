import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/auth/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata = { title: 'Pokédex', description: 'Pokédex Database' };
export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${geist.variable} h-full`}>
            <body
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#eef0f4',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 0,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '5%',
                            right: '-5%',
                            width: '55%',
                            height: '70%',
                            background:
                                'linear-gradient(135deg, rgba(220,228,240,0.6) 0%, rgba(200,215,235,0.4) 100%)',
                            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                            transform: 'rotate(-15deg)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '-8%',
                            width: '45%',
                            height: '60%',
                            background:
                                'linear-gradient(135deg, rgba(215,225,238,0.5) 0%, rgba(200,212,230,0.3) 100%)',
                            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                            transform: 'rotate(10deg)',
                        }}
                    />
                </div>
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100vh',
                    }}
                >
                    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                        <AuthProvider>
                            <Navbar />
                            <main style={{ flex: 1 }}>{children}</main>
                            <Footer />
                        </AuthProvider>
                    </GoogleOAuthProvider>
                </div>
            </body>
        </html>
    );
}