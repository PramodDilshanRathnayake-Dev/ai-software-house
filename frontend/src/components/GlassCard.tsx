import React from 'react';
import { Card, CardContent, Typography, Box, BoxProps, CardProps } from '@mui/material';

interface GlassCardProps extends CardProps {
    children: React.ReactNode;
    interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    interactive = false,
    className = '',
    sx = {},
    ...props
}) => {
    return (
        <Card
            className={`${interactive ? 'glass-card' : 'glass-panel'} ${className}`}
            sx={{
                backgroundColor: 'transparent', // Let CSS handle the background
                backgroundImage: 'none',
                ...sx
            }}
            {...props}
        >
            {children}
        </Card>
    );
};
