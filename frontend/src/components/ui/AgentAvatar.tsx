import React from 'react';
import { Avatar, Box, Typography, AvatarProps } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BuildIcon from '@mui/icons-material/Build';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BugReportIcon from '@mui/icons-material/BugReport';

export type AgentRole = 'strategist' | 'builder' | 'auditor' | 'sre';

export interface AgentAvatarProps extends AvatarProps {
    role: AgentRole;
    name?: string;
    showLabel?: boolean;
    size?: number;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
    role,
    name,
    showLabel = false,
    size = 40,
    sx,
    ...props
}) => {
    // Map roles to colors and icons to build consistent identity
    const roleConfig = {
        strategist: {
            color: '#1a237e', // Indigo
            icon: <AutoFixHighIcon sx={{ fontSize: size * 0.6 }} />,
            defaultName: 'Strategist',
        },
        builder: {
            color: '#004d40', // Teal
            icon: <BuildIcon sx={{ fontSize: size * 0.6 }} />,
            defaultName: 'Builder',
        },
        auditor: {
            color: '#b71c1c', // Red
            icon: <BugReportIcon sx={{ fontSize: size * 0.6 }} />,
            defaultName: 'Auditor',
        },
        sre: {
            color: '#e65100', // Orange
            icon: <SupportAgentIcon sx={{ fontSize: size * 0.6 }} />,
            defaultName: 'SRE',
        },
    };

    const config = roleConfig[role] || roleConfig.strategist;
    const displayName = name || config.defaultName;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
                sx={{
                    bgcolor: config.color,
                    width: size,
                    height: size,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    ...sx
                }}
                {...props}
            >
                {config.icon}
            </Avatar>
            {showLabel && (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {displayName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        AI Agent
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
