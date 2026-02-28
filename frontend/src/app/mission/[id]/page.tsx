'use client';

import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    CircularProgress,
    Divider,
    TextField,
    Tooltip,
    Grid,
    Avatar,
    IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HubIcon from '@mui/icons-material/Hub';
import ProtectedRoute from '@/components/ProtectedRoute';
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
            const response = await fetchWithAuth(`http://localhost:8000/api/strategist/missions`);
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

            const socket: Socket = io('http://localhost:8000');
            socket.emit('join_mission', missionId);

            socket.on('task_updated', (data: { taskId: string, status: string }) => {
                setMission((prevMission: any) => {
                    if (!prevMission) return prevMission;
                    const updatedBacklog = prevMission.backlog.map((task: any) =>
                        task.id === data.taskId ? { ...task, status: data.status } : task
                    );
                    return { ...prevMission, backlog: updatedBacklog };
                });
            });

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
            if (res.ok) {
                fetchMission();
                setDiscussInput('');
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
                fetchMission();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCommentingId(null);
        }
    };

    if (loading) return <Container sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error || !mission) return <Container sx={{ mt: 8 }}><Typography color="error">{error}</Typography></Container>;

    return (
        <ProtectedRoute>
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_380px] pt-16">
                {/* Left side - Dynamic Mind map & Progress */}
                <div className="p-6 overflow-y-auto">
                    {/* Mission Header */}
                    <Box mb={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => router.push('/')}
                                size="small"
                                variant="text"
                            >
                                Dashboard
                            </Button>
                            <Typography variant="overline" color="primary" fontWeight="bold">Active Project</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>{mission.projectId}</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
                            {mission.prd.substring(0, 250)}...
                        </Typography>
                    </Box>

                    {/* Simulation Visualization Area */}
                    <Box
                        sx={{
                            height: 400,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                            border: '2px dashed',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 6,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <HubIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                        <Typography color="text.secondary">
                            Live Agent Interaction Mind Map
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            (Visualizing real-time agent coordination)
                        </Typography>

                        <Chip
                            label={mission.status}
                            color={mission.status === 'DONE' ? 'success' : 'primary'}
                            sx={{ position: 'absolute', top: 24, right: 24, fontWeight: 'bold' }}
                        />
                    </Box>

                    {/* Agent Status Grid */}
                    <Grid container spacing={3} mb={6}>
                        {['STRATEGIST', 'BUILDER', 'AUDITOR', 'SRE'].map((role) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={role}>
                                <Tooltip title={`${role} Agent Status`}>
                                    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: role === 'STRATEGIST' ? 'purple' : 'blue' }}>
                                                {role[0]}
                                            </Avatar>
                                            <Typography variant="subtitle2" fontWeight="bold">{role}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {mission.backlog.some((t: any) => t.assignee === role && t.status === 'IN_PROGRESS') ? 'Working...' : 'Idle'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Tooltip>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Scrum Backlog in Mission View */}
                    <Box mb={4}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold">Backlog & Sprint</Typography>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={sprintLoading ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
                                onClick={handleStartSprint}
                                disabled={sprintLoading || mission.status === 'DEVELOPMENT'}
                                sx={{ borderRadius: 2 }}
                            >
                                {mission.status === 'DEVELOPMENT' ? 'Sprint In Progress' : 'Start Builder Sprint'}
                            </Button>
                        </Box>

                        <div className="space-y-4">
                            {mission.backlog.map((task: any) => (
                                <Card key={task.id} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{task.title}</Typography>
                                            <Chip label={task.status} size="small" color={task.status === 'DONE' ? 'success' : 'primary'} variant="outlined" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" mb={2}>{task.description}</Typography>

                                        {/* Comments */}
                                        {task.comments && task.comments.length > 0 && (
                                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2, mb: 2 }}>
                                                {task.comments.map((c: any, i: number) => (
                                                    <Box key={i} mb={1}>
                                                        <Typography variant="caption" fontWeight="bold">{c.author}</Typography>
                                                        <Typography variant="body2">{c.text}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Comment..."
                                                value={commentInputs[task.id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                            />
                                            <IconButton color="primary" onClick={() => handlePostComment(task.id)} disabled={!commentInputs[task.id]?.trim()}>
                                                <SendIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </Box>

                    {/* Mid-Sprint Discussion */}
                    <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 4 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <AutoAwesomeIcon />
                                <Typography variant="h6" fontWeight="bold">Refine Requirements Mid-Sprint</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                                Need to add a new requirement? Describe it here and the Strategist will analyze its impact and update the backlog.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="e.g., We need to add social login support..."
                                    value={discussInput}
                                    onChange={(e) => setDiscussInput(e.target.value)}
                                    sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleDiscussSubmit}
                                    disabled={discussLoading || !discussInput.trim()}
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    {discussLoading ? <CircularProgress size={24} /> : 'Analyze'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </div>

                {/* Right side - Mission Feed / Artifacts */}
                <aside className="border-l border-divider bg-slate-50/30 dark:bg-slate-900/10 backdrop-blur-sm p-6 overflow-y-auto">
                    <Typography variant="h6" fontWeight="bold" gutterBottom mb={3}>Mission Artifacts</Typography>

                    <div className="space-y-4">
                        {mission.artifacts.logs.map((log: string, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-divider shadow-sm">
                                <Typography variant="caption" display="block" color="primary" fontWeight="bold">AGENT LOG</Typography>
                                <Typography variant="body2">{log}</Typography>
                            </div>
                        ))}

                        {mission.artifacts.codeRepositoryUrl && (
                            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                <Typography variant="subtitle2" color="cyan.700" fontWeight="bold">Repository Created</Typography>
                                <Typography variant="body2" className="break-all mt-1">{mission.artifacts.codeRepositoryUrl}</Typography>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </ProtectedRoute>
    );
}
