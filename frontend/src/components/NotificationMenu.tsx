'use client';

import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, CircularProgress, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuth } from '@/context/AuthContext';

export function NotificationMenu() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth('http://localhost:8000/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds as fallback, WebSockets are meant for missions
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        if (notifications.length === 0) fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkRead = async (id: string) => {
        try {
            await fetchWithAuth(`http://localhost:8000/api/notifications/${id}/read`, {
                method: 'PUT'
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box ml={1} mr={1}>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon sx={{ color: 'text.secondary' }} />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: { mt: 1.5, minWidth: 320, maxWidth: 360, maxHeight: 400, borderRadius: 3 }
                }}
            >
                <Box px={2} py={1.5}>
                    <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                </Box>
                <Divider />

                {loading && notifications.length === 0 ? (
                    <Box p={3} display="flex" justifyContent="center">
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography variant="body2" color="text.secondary">You have no notifications.</Typography>
                    </Box>
                ) : (
                    notifications.map((n) => (
                        <MenuItem
                            key={n._id}
                            onClick={() => !n.read && handleMarkRead(n._id)}
                            sx={{
                                whiteSpace: 'normal',
                                py: 1.5,
                                bgcolor: n.read ? 'transparent' : 'action.hover',
                                borderLeft: n.type === 'ACTION_REQUIRED' ? '4px solid #ef4444' : '4px solid transparent'
                            }}
                        >
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="primary">{n.sender}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: n.read ? 'normal' : 'medium' }}>
                                    {n.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(n.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    );
}
