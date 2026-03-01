'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ApprovalGate } from '@/components/communication/ApprovalGate';
import { UIReviewGate } from '@/components/communication/UIReviewGate';

export default function PreviewGatesPage() {
    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            py: 6,
            px: 2,
        }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, letterSpacing: 1 }}>
                Client-Agent Communication Gates Preview
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', alignItems: 'flex-start' }}>
                {/* Strategist Approval Gate */}
                <Box>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Strategist Review Gate
                    </Typography>
                    <ApprovalGate
                        title="Aethelred Core Architecture"
                        version="1.4"
                        complexity="High"
                        feasibility={94}
                        resources="Optimal"
                        onApprove={() => alert('✅ Architecture Approved! Builder Agent starting.')}
                        onRequestRevision={(notes) => alert(`📝 Revision Requested: ${notes}`)}
                    />
                </Box>

                {/* Builder UI Review Gate */}
                <Box>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Builder UI Review Gate
                    </Typography>
                    <UIReviewGate
                        projectName="Project Cygnus v1.3"
                        version="2A"
                        onApprove={() => alert('✅ UI Approved & Deploying!')}
                        onRequestChanges={(feedback) => alert(`📝 Design Changes Requested: ${feedback}`)}
                    />
                </Box>
            </Box>
        </Box>
    );
}
