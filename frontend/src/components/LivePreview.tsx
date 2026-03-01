'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress, Divider } from '@mui/material';
import { Refresh as RefreshIcon, OpenInNew as OpenInNewIcon, Terminal as TerminalIcon } from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';

interface LivePreviewProps {
    missionId: string;
}

interface LogEntry {
    level: 'info' | 'error';
    message: string;
    timestamp: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ missionId }) => {
    const [status, setStatus] = useState<'STOPPED' | 'STARTING' | 'RUNNING' | 'ERROR'>('STOPPED');
    const [port, setPort] = useState<number | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    useEffect(() => {
        if (!missionId) return;

        // Fetch initial status immediately
        fetch(`http://localhost:4000/api/sre/sandbox/${missionId}/status`)
            .then(res => res.json())
            .then(data => {
                if (data.status) setStatus(data.status);
                if (data.port) setPort(data.port);
            })
            .catch(err => console.error("Failed to fetch initial sandbox status", err));

        const socket = io('http://localhost:4000');

        socket.on('connect', () => {
            socket.emit('authenticate', 'placeholder_token');
            socket.emit('join_mission', missionId);
        });

        socket.on('sandbox_status', (data) => {
            setStatus(data.status);
            if (data.port) {
                setPort(data.port);
            }
        });

        socket.on('sandbox_log', (log: LogEntry) => {
            setLogs((prev) => [...prev, log]);
        });

        // Cleanup
        return () => {
            socket.disconnect();
        };
    }, [missionId]);

    const handleRefresh = () => {
        // A trick to reload the iframe by toggling the key or src slightly
        if (port) {
            const iframe = document.getElementById('sandbox-iframe') as HTMLIFrameElement;
            if (iframe) {
                iframe.src = iframe.src;
            }
        }
    };

    const handleOpenInNewTab = () => {
        if (port) {
            window.open(`http://localhost:${port}`, '_blank');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            {/* Header / Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TerminalIcon color="primary" /> Sandbox Preview
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color={status === 'RUNNING' ? 'success.main' : 'warning.main'}>
                        Status: {status}
                    </Typography>
                    {status === 'RUNNING' && port && (
                        <Typography variant="body2" color="text.secondary">
                            (Port: {port})
                        </Typography>
                    )}

                    <IconButton onClick={handleRefresh} disabled={status !== 'RUNNING'} title="Refresh Preview">
                        <RefreshIcon />
                    </IconButton>
                    <IconButton onClick={handleOpenInNewTab} disabled={status !== 'RUNNING'} title="Open in New Tab">
                        <OpenInNewIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Main Content Area (Split between Preview and Terminal) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2, height: 'calc(100vh - 200px)' }}>

                {/* Top Half: Browser Iframe */}
                <Paper
                    elevation={3}
                    sx={{
                        flexGrow: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        bgcolor: '#ffffff', // Browsers are mostly white background
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative'
                    }}
                >
                    {status === 'RUNNING' && port ? (
                        <iframe
                            id="sandbox-iframe"
                            src={`http://localhost:${port}`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="Live Preview"
                        />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.secondary', p: 4 }}>
                            {status === 'STARTING' ? <CircularProgress sx={{ mb: 2 }} /> : <TerminalIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />}
                            <Typography variant="h6">
                                {status === 'STARTING' ? 'Booting Sandbox Environment...' : 'Sandbox Offline'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', maxWidth: 400 }}>
                                {status === 'ERROR' ? 'The process failed to start. Check the logs below.' : 'The live preview will appear here once the Builder Agent successfully compiles and deploys the project.'}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Bottom Half: Terminal Logs */}
                <Paper
                    elevation={3}
                    sx={{
                        flexGrow: 1,
                        maxHeight: '30%',
                        bgcolor: '#1e1e1e', // Dark terminal background
                        color: '#d4d4d4', // Light text
                        p: 2,
                        fontFamily: 'monospace',
                        overflowY: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Server Logs
                    </Typography>
                    <Divider sx={{ borderColor: '#333', mb: 1 }} />

                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {logs.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                                Waiting for logs...
                            </Typography>
                        ) : (
                            logs.map((log, index) => (
                                <Box key={index} sx={{ mb: 0.5, display: 'flex', wordBreak: 'break-all' }}>
                                    <Typography variant="body2" component="span" sx={{ color: '#666', mr: 2, minWidth: '80px' }}>
                                        [{new Date(log.timestamp).toLocaleTimeString()}]
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        sx={{ color: log.level === 'error' ? '#f44336' : '#d4d4d4', whiteSpace: 'pre-wrap' }}
                                    >
                                        {log.message}
                                    </Typography>
                                </Box>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default LivePreview;
