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
        const storedToken = Cookies.get('token');
        const storedUser = Cookies.get('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Basic route protection
        const publicPaths = ['/login', '/register'];
        const isPublicPath = publicPaths.includes(pathname);

        if (!loading && !user && !isPublicPath) {
            router.push('/login');
        } else if (!loading && user && isPublicPath) {
            router.push('/');
        }
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
        router.push('/login');
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
