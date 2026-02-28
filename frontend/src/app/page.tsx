'use client';
import { Box, Container, Typography, Card, CardContent, Chip, Button, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Link from 'next/link';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/strategist/missions')
      .then(res => res.json())
      .then(data => setMissions(data))
      .catch(err => console.error('Failed to fetch missions:', err));
  }, []);

  const agents = [
    { name: 'The Strategist', role: 'PM / Architect', icon: <DashboardIcon color="primary" fontSize="large" />, status: 'IDLE' },
    { name: 'The Builder', role: 'Dev Agent', icon: <CodeIcon color="secondary" fontSize="large" />, status: 'READY' },
    { name: 'The Auditor', role: 'QA Agent', icon: <BugReportIcon color="error" fontSize="large" />, status: 'IDLE' },
    { name: 'The SRE', role: 'Ops Agent', icon: <CloudUploadIcon color="success" fontSize="large" />, status: 'IDLE' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary.light">
          Antigravity AI Software House
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Founder Dashboard &bull; Mission Control
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Active Agents
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 4
      }}>
        {agents.map((agent) => (
          <Box key={agent.name}>
            <Card sx={{
              height: '100%', display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>{agent.icon}</Box>
                <Typography gutterBottom variant="h6" component="h2">
                  {agent.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {agent.role}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={agent.status}
                    color={agent.status === 'READY' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Link href="/intake" passHref legacyBehavior>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ py: 1.5, px: 4, borderRadius: 2, fontSize: '1.1rem' }}
          >
            New Client Intake
          </Button>
        </Link>
      </Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 8, mb: 3 }}>
        Recent Missions
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3
      }}>
        {missions.length === 0 ? (
          <Box>
            <Typography color="text.secondary">No missions found. Start one above!</Typography>
          </Box>
        ) : (
          missions.map((mission) => (
            <Box key={mission.projectId}>
              <Card sx={{ bgcolor: 'background.paper', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" color="primary">
                      {mission.sharedState?.projectName || 'Unnamed Project'}
                    </Typography>
                    <Chip label={mission.status} size="small" color={mission.status === 'INTAKE' ? 'info' : 'secondary'} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    ID: {mission.projectId}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                    {mission.sharedState?.originalRequest || 'No description available'}
                  </Typography>
                  <Link href={`/mission/${mission.projectId}`} passHref legacyBehavior>
                    <Button variant="outlined" size="small" fullWidth>
                      Open Mission Control
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
}
