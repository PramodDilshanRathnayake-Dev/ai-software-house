'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { Box, Button, Container, TextField, Typography, Card, CardContent, Link as MuiLink, Divider } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const ssoProcessed = useRef(false);

    // Handle SSO callback — extract token from URL params
    useEffect(() => {
        if (ssoProcessed.current) return;

        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const ssoError = searchParams.get('error');

        if (ssoError) {
            setError('Single Sign-On failed. Please try again.');
            router.replace('/login');
        } else if (token && userStr) {
            ssoProcessed.current = true;
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                console.log('[SSO] Token received, logging in user:', user.email);
                login(token, user);
            } catch (e) {
                console.error('[SSO] Failed to parse user from query', e);
                setError('Failed to process login. Please try again.');
            }
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <RocketLaunchIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">
                    Antigravity AI
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Welcome back Founder
                </Typography>
            </Box>

            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`}
                        sx={{
                            mb: 3,
                            color: 'text.primary',
                            borderColor: 'divider',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            display: 'flex',
                            gap: 1.5
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </Button>

                    <Divider sx={{ mb: 3, color: 'text.secondary', fontSize: '0.875rem' }}>OR</Divider>

                    <form onSubmit={handleLogin}>
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ mt: 4, mb: 2 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <MuiLink component={Link} href="/register" underline="hover">
                                    Register here
                                </MuiLink>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Box sx={{ mt: 10, textAlign: 'center' }}><Typography>Loading...</Typography></Box>}>
            <LoginForm />
        </Suspense>
    );
}
