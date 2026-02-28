/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import { Box, Container, Typography, Card, CardContent, Chip, Button, CircularProgress, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function MissionControlPage() {
    const params = useParams();
    const router = useRouter();
    const missionId = params.id as string;

    const [mission, setMission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sprintLoading, setSprintLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMission = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/strategist/missions');
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
            // Poll every 5s for task status changes
            const interval = setInterval(fetchMission, 5000);
            return () => clearInterval(interval);
        }
    }, [missionId]);

    const handleStartSprint = async () => {
        setSprintLoading(true);
        try {
            await fetch(`http://localhost:4000/api/builder/start/${missionId}`, {
                method: 'POST',
            });
            // Await next poll to update UI
        } catch (err: any) {
            console.error(err);
        } finally {
            setSprintLoading(false);
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CodeIcon fontSize="small" color={task.assignee === 'BUILDER' ? 'secondary' : 'disabled'} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Assignee: {task.assignee}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}
