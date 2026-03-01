'use client';

import { createTheme, PaletteMode } from '@mui/material/styles';

const AETHELRED_GOLD = '#D4AF37';
const DEEP_CHARCOAL = '#121212';
const SLATE_BLUE = '#334155';
const LIGHT_SLATE = '#94A3B8';

export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        primary: {
            // Force dark mode presentation for the premium feel, even in light mode
            main: mode === 'light' ? SLATE_BLUE : '#94A3B8',
            light: '#CBD5E1',
            dark: '#1E293B',
        },
        secondary: {
            main: AETHELRED_GOLD,
            light: '#F3E5AB',
            dark: '#AA8825',
        },
        background: {
            default: mode === 'light' ? '#F8FAFC' : DEEP_CHARCOAL,
            paper: mode === 'light' ? '#FFFFFF' : '#1E293B',
        },
        text: {
            primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
            secondary: mode === 'light' ? '#475569' : LIGHT_SLATE,
        }
    },
    typography: {
        fontFamily: 'var(--font-inter), sans-serif',
        h1: { fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontWeight: 600 },
        h6: { fontWeight: 600, letterSpacing: '0.01em' },
        button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.02em' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
                    }
                },
                containedSecondary: {
                    background: `linear-gradient(135deg, ${AETHELRED_GOLD} 0%, #AA8825 100%)`,
                    color: '#000',
                    '&:hover': {
                        background: `linear-gradient(135deg, #F3E5AB 0%, ${AETHELRED_GOLD} 100%)`,
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16, // Professional subtle curve, not overly pill-shaped
                    backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: mode === 'light' ? 'none' : 'blur(12px)',
                    border: `1px solid ${mode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
                    backgroundImage: 'none', // Remove MUI default gradient overlay on paper
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                }
            }
        }
    },
});

const theme = createTheme(getDesignTokens('dark'));
export default theme;

