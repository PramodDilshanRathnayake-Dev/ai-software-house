'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = Cookies.get('token');
            if (storedToken) {
                try {
                    const res = await fetch('http://localhost:8000/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (res.ok) {
                        const userData = await res.json();
                        setToken(storedToken);
                        setUser(userData);
                    } else {
                        // Token invalid or expired
                        logout();
                    }
                } catch (error) {
                    console.error('Auth check failed', error);
                    // On network error, we might want to keep the local state 
                    // or clear it depending on security preference.
                    // For now, let's just clear if we can't verify.
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    useEffect(() => {
        // Redirect logic moved to ProtectedRoute component for better control
    }, [user, loading, pathname, router]);

    const login = (newToken: string, newUser: User) => {
        Cookies.set('token', newToken, { expires: 7 }); // 7 days
        Cookies.set('user', JSON.stringify(newUser), { expires: 7 });
        setToken(newToken);
        setUser(newUser);
        router.push('/');
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setToken(null);
        setUser(null);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
