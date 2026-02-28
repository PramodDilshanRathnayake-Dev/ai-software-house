'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { Button, Avatar, Menu, MenuItem, IconButton, Typography, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '@/context/AuthContext';
import { NotificationMenu } from './NotificationMenu';

export function Navbar() {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        setAnchorEl(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/">
                        <BrandLogo />
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/intake" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors hidden sm:block">
                            Intake
                        </Link>
                        <Link href="/scrum" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors hidden sm:block">
                            Scrum Board
                        </Link>
                        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
                        <ThemeToggle />

                        {mounted && (
                            <Box ml={1} display="flex" alignItems="center">
                                {user ? (
                                    <>
                                        <NotificationMenu />
                                        <IconButton
                                            onClick={handleMenuOpen}
                                            size="small"
                                            edge="end"
                                            aria-controls={anchorEl ? 'profile-menu' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={anchorEl ? 'true' : undefined}
                                        >
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                <PersonIcon fontSize="small" />
                                            </Avatar>
                                        </IconButton>
                                        <Menu
                                            id="profile-menu"
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleMenuClose}
                                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                            PaperProps={{
                                                elevation: 3,
                                                sx: { mt: 1.5, minWidth: 200, borderRadius: 3 }
                                            }}
                                        >
                                            <Box px={2} py={1.5} borderBottom={1} borderColor="divider">
                                                <Typography variant="subtitle2" fontWeight="bold">{user?.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                                            </Box>
                                            <MenuItem onClick={handleMenuClose} sx={{ mt: 1 }}>Profile Settings</MenuItem>
                                            <MenuItem onClick={handleMenuClose}>Client Projects</MenuItem>
                                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Sign Out</MenuItem>
                                        </Menu>
                                    </>
                                ) : (
                                    <Link href="/login" passHref>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ borderRadius: 6, px: 3 }}
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                )}
                            </Box>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
