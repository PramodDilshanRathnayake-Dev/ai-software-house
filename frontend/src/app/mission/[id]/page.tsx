/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import { Box, Container, Typography, Card, CardContent, Chip, Button, CircularProgress, Divider, TextField, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { io, Socket } from 'socket.io-client';

export default function MissionControlPage() {
    const params = useParams();
    const router = useRouter();
    const missionId = params.id as string;

    const [mission, setMission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sprintLoading, setSprintLoading] = useState(false);
    const [discussInput, setDiscussInput] = useState('');
    const [discussLoading, setDiscussLoading] = useState(false);
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [commentingId, setCommentingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchMission = async () => {
        try {
            const response = await fetchWithAuth('http://localhost:8000/api/strategist/missions');
            const data = await response.json();
            const current = data.find((m: any) => m.projectId === missionId);
            if (current) setMission(current);
            else setError('Mission not found');
        } catch (err: any) {
            setError('Failed to fetch mission details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (missionId) {
            fetchMission();

            // Connect to WebSocket Server
            const socket: Socket = io('http://localhost:8000');

            // Join specific mission room
            socket.emit('join_mission', missionId);

            // Listen for AI Agents updating task statuses
            socket.on('task_updated', (data: { taskId: string, status: string }) => {
                console.log('[WebSocket] Task Updated Received:', data);
                setMission((prevMission: any) => {
                    if (!prevMission) return prevMission;
                    const updatedBacklog = prevMission.backlog.map((task: any) =>
                        task.id === data.taskId ? { ...task, status: data.status } : task
                    );
                    return { ...prevMission, backlog: updatedBacklog };
                });
            });

            // Listen for overall mission status (e.g. SRE deployed)
            socket.on('mission_updated', (data: { status: string }) => {
                setMission((prevMission: any) => {
                    if (!prevMission) return prevMission;
                    return { ...prevMission, status: data.status };
                });
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [missionId]);

    const handleStartSprint = async () => {
        setSprintLoading(true);
        try {
            await fetchWithAuth(`http://localhost:8000/api/builder/start/${missionId}`, {
                method: 'POST',
            });
            // Await next poll to update UI
        } catch (err: any) {
            console.error(err);
        } finally {
            setSprintLoading(false);
        }
    };

    const handleDiscussSubmit = async () => {
        if (!discussInput.trim()) return;

        setDiscussLoading(true);
        try {
            const res = await fetchWithAuth(`http://localhost:8000/api/scrum/${missionId}/refine-backlog`, {
                method: 'POST',
                body: JSON.stringify({ additionalRequirements: discussInput }),
            });
            const data = await res.json();
            if (res.ok) {
                // Poll instantly
                fetchMission();
                setDiscussInput('');
            } else {
                console.error(data.error);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setDiscussLoading(false);
        }
    };

    const handlePostComment = async (taskId: string) => {
        const text = commentInputs[taskId];
        if (!text?.trim()) return;

        setCommentingId(taskId);
        try {
            const res = await fetchWithAuth(`http://localhost:8000/api/scrum/${missionId}/tasks/${taskId}/comment`, {
                method: 'POST',
                body: JSON.stringify({ text }),
            });
            if (res.ok) {
                setCommentInputs(prev => ({ ...prev, [taskId]: '' }));
                fetchMission(); // Poll to update UI
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCommentingId(null);
        }
    };

    if (loading) return <Container sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error || !mission) return <Container sx={{ mt: 8 }}><Typography color="error">{error}</Typography></Container>;

    const builderTasks = mission.backlog.filter((t: any) => t.assignee === 'BUILDER');

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/')}
                sx={{ mb: 3 }}
            >
                Back to Dashboard
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                        Mission {missionId.substring(0, 8)}...
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Project: {mission.sharedState?.projectName}
                    </Typography>
                </Box>
                <Chip label={`Status: ${mission.status}`} color="secondary" size="medium" />
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
                gap: 4
            }}>
                {/* Left Column: PRD */}
                <Box>
                    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                        <CardContent>
                            <Typography variant="h5" color="primary.light" gutterBottom>
                                Product Requirement Document
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{
                                whiteSpace: 'pre-wrap', fontFamily: 'var(--font-inter)',
                                maxHeight: '600px', overflowY: 'auto', p: 1
                            }}>
                                {mission.prd}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Right Column: Dev Backlog & Sprint Controls */}
                <Box>
                    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" color="secondary.light">
                                    Scrum Backlog
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={sprintLoading ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
                                    onClick={handleStartSprint}
                                    disabled={sprintLoading}
                                >
                                    Start Builder Sprint
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ maxHeight: '600px', overflowY: 'auto', p: 1 }}>
                                {mission.backlog.map((task: any) => (
                                    <Card key={task.id} sx={{
                                        mb: 2, bgcolor: 'background.default', borderLeft: `4px solid ${task.status === 'DONE' ? '#4caf50'
                                            : task.status === 'REVIEW' ? '#ff9800'
                                                : task.status === 'IN_PROGRESS' ? '#03a9f4'
                                                    : '#757575'
                                            }`
                                    }}>
                                        <CardContent sx={{ pb: '16px !important' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {task.id} - {task.title}
                                                </Typography>
                                                <Chip
                                                    label={task.status}
                                                    size="small"
                                                    color={
                                                        task.status === 'DONE' ? 'success'
                                                            : task.status === 'REVIEW' ? 'warning'
                                                                : task.status === 'IN_PROGRESS' ? 'info'
                                                                    : 'default'
                                                    }
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {task.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CodeIcon fontSize="small" color={task.assignee === 'BUILDER' ? 'secondary' : 'disabled'} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Assignee: {task.assignee}
                                                </Typography>
                                                {task.storyPoints > 0 && (
                                                    <Chip label={`${task.storyPoints} pts`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                                                )}
                                            </Box>

                                            {/* Comments Section */}
                                            {task.comments && task.comments.length > 0 && (
                                                <Box sx={{ mt: 2, mb: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                                                    {task.comments.map((c: any, i: number) => (
                                                        <Box key={i} sx={{ mb: 1 }}>
                                                            <Typography variant="caption" fontWeight="bold" color="primary">{c.author}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                                {new Date(c.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mt: 0.5 }}>{c.text}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <TextField
                                                    size="small"
                                                    placeholder="Add a comment..."
                                                    fullWidth
                                                    value={commentInputs[task.id] || ''}
                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={commentingId === task.id || !commentInputs[task.id]?.trim()}
                                                    onClick={() => handlePostComment(task.id)}
                                                >
                                                    {commentingId === task.id ? <CircularProgress size={16} /> : 'Post'}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Mid-Sprint Discussion Box */}
                    <Card sx={{ mt: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'primary.main', boxShadow: '0 0 15px rgba(2, 132, 199, 0.15)' }}>
                        <CardContent>
                            <Typography variant="h6" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AutoAwesomeIcon fontSize="small" /> Discuss with Strategist
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Need to add a new requirement mid-sprint? Ask the Strategist to analyze it and append to the active backlog.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="e.g., We need to add social login via Google..."
                                    variant="outlined"
                                    value={discussInput}
                                    onChange={(e) => setDiscussInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleDiscussSubmit();
                                        }
                                    }}
                                    disabled={discussLoading}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleDiscussSubmit}
                                    disabled={!discussInput.trim() || discussLoading}
                                    sx={{ borderRadius: 2, minWidth: '48px' }}
                                >
                                    {discussLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}
