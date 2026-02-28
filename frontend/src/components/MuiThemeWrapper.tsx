'use client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme } from 'next-themes';
import React, { useMemo, useState, useEffect } from 'react';
import { getDesignTokens } from '@/theme';

export function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const theme = useMemo(() => {
        // Default to dark before mounted to match most initial states, or light if system prefers
        const mode = mounted && resolvedTheme === 'light' ? 'light' : 'dark';
        return createTheme(getDesignTokens(mode));
    }, [resolvedTheme, mounted]);

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
