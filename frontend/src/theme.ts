'use client';

import { createTheme, PaletteMode } from '@mui/material/styles';

export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        primary: mode === 'light' ? {
            main: '#0284c7', // light blue
            light: '#7dd3fc',
            dark: '#0369a1',
        } : {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
        },
        secondary: mode === 'light' ? {
            main: '#9333ea', // purple
            light: '#d8b4fe',
            dark: '#7e22ce',
        } : {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
        },
        background: mode === 'light' ? {
            default: '#f8fafc', // slate-50
            paper: '#ffffff',
        } : {
            default: '#0f172a', // Clean dark slate
            paper: '#1e293b',
        },
    },
    typography: {
        fontFamily: 'var(--font-inter), sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

const theme = createTheme(getDesignTokens('dark'));
export default theme;
