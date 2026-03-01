'use client';

import React, { useState, useEffect } from 'react';
import { MoreVertical, AlertTriangle } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Chip, Divider, Button, IconButton, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import { io } from 'socket.io-client';

const columns = [
    { id: 'TODO', title: 'BACKLOG', color: 'from-cyan-400 to-blue-500', shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]' },
    { id: 'REVIEW', title: 'REVIEW', color: 'from-orange-400 to-amber-500', shadow: 'shadow-[0_0_15px_rgba(251,146,60,0.3)]' },
    { id: 'DONE', title: 'DONE', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
];

export function ScrumBoard({ tasks = [], projectId = 'All Projects' }: { tasks: any[], projectId?: string }) {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [notification, setNotification] = useState<{ show: boolean, message: string, severity: 'info' | 'warning' | 'error' | 'success' }>({ show: false, message: '', severity: 'info' });

    useEffect(() => {
        if (!projectId || projectId === 'All Projects') return;

        // Connect to WebSocket Server for Real-Time SRE/Builder Updates
        const socket = io('http://localhost:3001');

        socket.on('connect', () => {
            socket.emit('join_project', projectId);
        });

        socket.on('mission_updated', (data: { status: string, message?: string }) => {
            if (data.status === 'HEALING' && data.message) {
                setNotification({
                    show: true,
                    message: data.message,
                    severity: 'warning'
                });
            } else if (data.status === 'DEPLOYED' && data.message) {
                setNotification({
                    show: true,
                    message: data.message,
                    severity: 'success'
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [projectId]);

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
    };

    const handleClose = () => {
        setSelectedTask(null);
    };

    const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, show: false });
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            <Snackbar
                open={notification.show}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    icon={notification.severity === 'warning' ? <AlertTriangle className="animate-pulse" /> : undefined}
                    sx={{
                        width: '100%',
                        mt: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        border: '1px solid',
                        borderColor: notification.severity === 'warning' ? 'warning.main' : 'success.main',
                        backgroundColor: notification.severity === 'warning' ? '#4338ca' : '#059669', // Deep indigo for SRE Ops feel
                        color: 'white',
                        '& .MuiAlert-icon': {
                            color: 'white'
                        }
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Aethelred AI Labs - Kanban Board
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Project: {projectId}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Active Agents: Builder, Auditor, SRE</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4">
                        {/* Column Header */}
                        <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group`}>
                            {/* Neon top border effect */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${col.color} ${col.shadow}`} />

                            <div className="flex justify-between items-center">
                                <h3 className="font-bold tracking-wider text-sm text-slate-700 dark:text-slate-300">
                                    {col.title}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {tasks.filter((t: any) => t.status === col.id).length}
                                </span>
                            </div>
                        </div>

                        {/* Task Cards Container */}
                        <div className="flex-1 min-h-[500px] space-y-4 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/20 border border-transparent dark:border-slate-800/50">
                            {tasks
                                .filter((t: any) => t.status === col.id)
                                .map((task: any) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group cursor-pointer active:cursor-grabbing"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${task.assignee === 'BUILDER' ? 'from-cyan-400 to-blue-500' :
                                                    task.assignee === 'AUDITOR' ? 'from-orange-400 to-amber-500' :
                                                        task.assignee === 'SRE' ? 'from-emerald-400 to-teal-500' :
                                                            'from-slate-400 to-slate-500'
                                                    }`}>
                                                    {task.assignee ? task.assignee.charAt(0) : '?'}
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    {task.assignee || 'Unassigned'}
                                                </span>
                                            </div>

                                            {task.status === 'DONE' && (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${task.status === 'Completed' ? 'text-emerald-500' : 'text-orange-400'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            )}
                                            {!task.status && (
                                                <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] mb-1 leading-tight">
                                            {task.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4 font-mono">
                                            {task.id}
                                        </p>

                                        <div className="flex items-center gap-2 mb-4">
                                            {task.storyPoints && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20" title={`${task.storyPoints} Story Points`}>
                                                    {task.storyPoints} SP
                                                </span>
                                            )}
                                            {task.priority === 'HIGH' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                                    HIGH
                                                </span>
                                            )}
                                            {task.priority === 'MED' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                                                    MED
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                                <span>Progress</span>
                                                <span className="font-mono">{task.status === 'DONE' ? '100' : task.status === 'REVIEW' ? '80' : task.status === 'IN_PROGRESS' ? '40' : '0'}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${col.color}`}
                                                    style={{ width: `${task.status === 'DONE' ? 100 : task.status === 'REVIEW' ? 80 : task.status === 'IN_PROGRESS' ? 40 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Details & Artifacts Modal */}
            <Dialog
                open={Boolean(selectedTask)}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }
                }}
            >
                {selectedTask && (
                    <>
                        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {selectedTask.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                    {selectedTask.id}
                                </Typography>
                            </Box>
                            <IconButton onClick={handleClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: 3 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" color="primary.light" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedTask.description || "No detailed description provided."}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 4 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Assignee</Typography>
                                    <Chip size="small" label={selectedTask.assignee || 'Unassigned'} color="secondary" variant="outlined" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Status</Typography>
                                    <Chip size="small" label={selectedTask.status} color="info" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Story Points</Typography>
                                    <Chip size="small" label={selectedTask.storyPoints ? `${selectedTask.storyPoints} SP` : 'Unestimated'} color="default" />
                                </Box>
                            </Box>

                            {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="subtitle2" color="primary.light" gutterBottom>
                                        Subtasks
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {selectedTask.subtasks.map((sub: any, i: number) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <input type="checkbox" checked={sub.done} readOnly className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500" />
                                                <Typography variant="body2" sx={{ textDecoration: sub.done ? 'line-through' : 'none', color: sub.done ? 'text.secondary' : 'text.primary' }}>
                                                    {sub.title}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CodeIcon fontSize="small" /> Artifacts & Deliverables
                            </Typography>

                            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                {selectedTask.status === 'DONE' || selectedTask.status === 'REVIEW' ? (
                                    <Box>
                                        <Typography variant="body2" color="success.main" gutterBottom>
                                            ✓ Code Diff Generated
                                        </Typography>
                                        <Button variant="text" size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>
                                            View Commit: <Typography variant="caption" fontFamily="monospace" ml={1}>a1b2c3d</Typography>
                                        </Button>
                                        <br />
                                        <Button variant="text" size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto', mt: 1 }}>
                                            Playback QA Video Proof
                                        </Button>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No artifacts available yet. Task is currently in {selectedTask.status}.
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </div>
    );
}
