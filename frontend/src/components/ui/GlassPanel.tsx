import React from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';

export interface GlassPanelProps extends BoxProps {
    blur?: number;
    opacity?: number;
    gradientBorder?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
    children,
    blur = 10,
    opacity = 0.5,
    gradientBorder = true,
    sx,
    ...props
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // The frosted aesthetic: dark translucent background with an inner glow or border
    const baseBackgroundColor = isDark ? `rgba(20, 25, 35, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;

    return (
        <Box
            sx={{
                position: 'relative',
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                backgroundColor: baseBackgroundColor,
                borderRadius: '16px',
                border: gradientBorder ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                boxShadow: isDark
                    ? '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                    : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                padding: '24px',
                overflow: 'hidden',
                ...sx,
            }}
            {...props}
        >
            {/* Optional inner subtle gradient overlay to match the premium dark UI */}
            {gradientBorder && isDark && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
            )}
            <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                {children}
            </Box>
        </Box>
    );
};
