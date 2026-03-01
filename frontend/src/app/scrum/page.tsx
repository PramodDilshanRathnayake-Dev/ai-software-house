'use client';

import { ScrumBoard } from '@/components/ScrumBoard';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

function ScrumBoardContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId') || undefined;

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/strategist/missions`);
                const data = await response.json();

                if (projectId) {
                    const project = data.find((m: any) => m.projectId === projectId);
                    if (project) {
                        setTasks(project.backlog || []);
                    } else {
                        setError('Project not found');
                    }
                } else {
                    // Collect all tasks from all projects if no id specified
                    const allTasks = data.flatMap((m: any) => m.backlog || []);
                    setTasks(allTasks);
                }
            } catch (err: any) {
                setError('Failed to fetch tasks.');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [projectId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4} textAlign="center">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <div className="w-full h-full min-h-screen">
            <ScrumBoard tasks={tasks} projectId={projectId || 'All Projects'} />
        </div>
    );
}

export default function ScrumPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<CircularProgress />}>
                <ScrumBoardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
