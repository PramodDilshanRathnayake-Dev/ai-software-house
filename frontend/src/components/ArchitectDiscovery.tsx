'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography, TextField, MenuItem, Slider } from '@mui/material';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const steps = [
    { id: 1, label: 'Discovery' },
    { id: 2, label: 'Objectives' },
    { id: 3, label: 'Technical' },
    { id: 4, label: 'Consultation' },
];

export function ArchitectDiscovery() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');

    // Step 2
    const [objectives, setObjectives] = useState<string[]>([]);
    const [goalsDetails, setGoalsDetails] = useState('');

    // Step 3
    const [cloudProvider, setCloudProvider] = useState('AWS');
    const [techStack, setTechStack] = useState('Modern, Legacy Integration');
    const [complexity, setComplexity] = useState(50);

    // Step 4
    const [archetype, setArchetype] = useState('Strategy Lead');

    const handleNext = () => {
        if (activeStep < steps.length) {
            setActiveStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
        }
    };

    const toggleObjective = (obj: string) => {
        setObjectives(prev =>
            prev.includes(obj) ? prev.filter(o => o !== obj) : [...prev, obj]
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const compiledRequest = `Company: ${companyName} (${industry}). Objectives: ${objectives.join(', ')}. Details: ${goalsDetails}. Infra: ${cloudProvider} / ${techStack} (Complexity: ${complexity}). Archetype: ${archetype}`;

        try {
            const response = await fetch('http://localhost:8000/api/strategist/intake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: companyName || 'New Aethelred Project',
                    clientRequest: compiledRequest
                })
            });

            const data = await response.json();
            if (response.ok && data.missionId) {
                router.push(`/mission/${data.missionId}`);
            } else {
                console.error("Submission failed", data);
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Connection error", err);
            setIsSubmitting(false);
        }
    };

    const GlassInputProps = {
        style: { color: 'white', fontWeight: 500, letterSpacing: '0.02em' },
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8, px: 2,
            background: 'radial-gradient(circle at center, #0B0F19 0%, #05070A 100%)',
        }}>
            {/* Ambient Environment Glows */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 transition-all duration-500">
                {/* Main Glass Card matching the mockup proportions */}
                <div className="bg-[#0d1218]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 pb-12 shadow-2xl overflow-hidden relative">

                    {/* Header Logo */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl border border-amber-500/30 flex items-center justify-center bg-white/5 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-shadow duration-500 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-amber-300 to-amber-600 relative z-10"></div>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-white text-base font-extrabold tracking-[0.15em] leading-tight uppercase">Aethelred</span>
                                <span className="text-[#d4af37] text-base font-extrabold tracking-[0.15em] leading-tight uppercase">Labs</span>
                            </div>
                        </div>

                        {/* Stepper Node Graph */}
                        <div className="w-full flex items-center justify-between relative px-2 mb-4 mt-2">
                            <div className="absolute left-6 right-6 h-[2px] bg-white/5 top-1/2 -translate-y-1/2 z-0 rounded-full"></div>
                            {/* Active line progress */}
                            <div className="absolute left-6 h-[2px] bg-gradient-to-r from-amber-500/50 via-amber-400 to-white top-1/2 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}>
                            </div>

                            {steps.map((step) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => step.id < activeStep && setActiveStep(step.id)}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${activeStep === step.id ? 'bg-gradient-to-br from-white to-gray-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110' :
                                        activeStep > step.id ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' :
                                            'bg-[#111620] text-gray-600 border border-white/10 group-hover:border-white/30 group-hover:bg-white/5'
                                        }`}>
                                        {activeStep > step.id ? '✓' : step.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-6 mt-2 relative w-full flex justify-center items-center">
                            <Typography variant="overline" sx={{ color: '#d4af37', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em' }} className="absolute transition-all duration-300">
                                {steps[activeStep - 1].label}
                            </Typography>
                        </div>
                    </div>

                    {/* Content Views */}
                    <div className="min-h-[400px] flex flex-col justify-between">
                        {activeStep === 1 && (
                            <div className="animate-fade-in flex flex-col h-full">
                                <Typography variant="h4" fontWeight="800" sx={{ mb: 6, lineHeight: 1.2, color: 'white', letterSpacing: '-0.02em' }}>
                                    Initiate Project<br /><span className="text-gray-500 font-medium">Discovery Phase</span>
                                </Typography>

                                <div className="flex flex-col gap-6 flex-1">
                                    <TextField
                                        fullWidth
                                        label="Organization Name"
                                        variant="outlined"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        InputLabelProps={{ style: { color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em' } }}
                                        InputProps={GlassInputProps}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                borderRadius: '1rem',
                                                transition: 'all 0.3s',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#d4af37', borderWidth: '1px' },
                                                '&.Mui-focused': { backgroundColor: 'rgba(212,175,55,0.03)', boxShadow: '0 0 20px rgba(212,175,55,0.05)' }
                                            }
                                        }}
                                    />
                                    <TextField
                                        select
                                        fullWidth
                                        label="Primary Sector"
                                        variant="outlined"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        InputLabelProps={{ style: { color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em' } }}
                                        InputProps={GlassInputProps}
                                        SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#111620', border: '1px solid rgba(255,255,255,0.1)', '& .MuiMenuItem-root': { color: 'white', '&:hover': { bgcolor: 'rgba(212,175,55,0.2)' } } } } } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                borderRadius: '1rem',
                                                transition: 'all 0.3s',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#d4af37', borderWidth: '1px' },
                                                '&.Mui-focused': { backgroundColor: 'rgba(212,175,55,0.03)', boxShadow: '0 0 20px rgba(212,175,55,0.05)' }
                                            }
                                        }}
                                    >
                                        <MenuItem value="Software/Tech">Enterprise Technology</MenuItem>
                                        <MenuItem value="Finance">Financial Services</MenuItem>
                                        <MenuItem value="Healthcare">Healthcare & Biotech</MenuItem>
                                        <MenuItem value="Retail">Retail & E-commerce</MenuItem>
                                        <MenuItem value="Other">Other Sector</MenuItem>
                                    </TextField>
                                </div>
                                <div className="flex justify-between items-center mt-8 gap-4">
                                    {activeStep > 1 && (
                                        <button onClick={handleBack} className="text-gray-500 font-bold hover:text-white transition-colors duration-300 uppercase tracking-widest text-xs px-4">Back</button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        disabled={!companyName || !industry}
                                        className="w-full py-4 rounded-xl font-black text-black bg-gradient-to-r from-gray-100 to-white hover:from-white hover:to-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                                    >
                                        Architect Flow →
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="animate-fade-in flex flex-col h-full">
                                <Typography variant="h5" fontWeight="800" sx={{ mb: 4, color: 'white' }}>
                                    Strategic Objectives
                                </Typography>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { id: 'digital', icon: <SwapHorizIcon sx={{ fontSize: 24 }} />, label: 'Digital Transformation' },
                                        { id: 'cloud', icon: <CloudQueueIcon sx={{ fontSize: 24 }} />, label: 'Cloud Optimization' },
                                        { id: 'security', icon: <LockOutlinedIcon sx={{ fontSize: 24 }} />, label: 'Enterprise Security' },
                                        { id: 'scale', icon: <LanguageIcon sx={{ fontSize: 24 }} />, label: 'Global Scaling' },
                                    ].map((obj) => (
                                        <button
                                            key={obj.id}
                                            onClick={() => toggleObjective(obj.id)}
                                            className={`relative group overflow-hidden flex flex-col items-center text-center justify-center p-4 rounded-2xl border transition-all duration-300 ${objectives.includes(obj.id)
                                                ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="mb-3 relative z-10">{obj.icon}</div>
                                            <span className="text-xs font-bold tracking-wide relative z-10">{obj.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <TextField
                                    fullWidth
                                    label="Elaborate Requirements"
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    value={goalsDetails}
                                    onChange={(e) => setGoalsDetails(e.target.value)}
                                    placeholder="Describe your vision..."
                                    InputLabelProps={{ style: { color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em' } }}
                                    InputProps={{ ...GlassInputProps, sx: { pt: 2 } }}
                                    sx={{
                                        flexGrow: 1,
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            borderRadius: '1rem',
                                            transition: 'all 0.3s',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&.Mui-focused fieldset': { borderColor: '#d4af37', borderWidth: '1px' },
                                        }
                                    }}
                                />

                                <div className="flex justify-between items-center mt-8 gap-4">
                                    <button onClick={handleBack} className="text-gray-500 font-bold hover:text-white transition-colors duration-300 uppercase tracking-widest text-xs px-4">Back</button>
                                    <button
                                        onClick={handleNext}
                                        disabled={objectives.length === 0}
                                        className="flex-1 py-4 rounded-xl font-black text-black bg-gradient-to-r from-gray-100 to-white hover:from-white hover:to-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                                    >
                                        Architecture →
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="animate-fade-in flex flex-col h-full">
                                <Typography variant="h5" fontWeight="800" sx={{ mb: 6, color: 'white' }}>
                                    Infrastructure Definition
                                </Typography>

                                <Typography variant="overline" sx={{ color: '#d4af37', mb: 2, display: 'block', fontWeight: 800, letterSpacing: '0.15em' }}>Deploy Target</Typography>
                                <div className="flex gap-3 mb-8">
                                    {['AWS', 'Azure', 'GCP', 'Hybrid'].map(provider => (
                                        <button
                                            key={provider}
                                            onClick={() => setCloudProvider(provider)}
                                            className={`flex-1 flex flex-col items-center justify-center rounded-xl py-4 text-xs font-bold transition-all duration-300 relative overflow-hidden group border ${cloudProvider === provider ? 'border-white text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'border-white/5 text-gray-500 bg-white/5 hover:border-white/20 hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <div className="relative z-10">
                                                {provider === 'AWS' && <CloudQueueIcon sx={{ fontSize: 24, mb: 1 }} />}
                                                {provider === 'Azure' && <AutoAwesomeIcon sx={{ fontSize: 24, mb: 1 }} />}
                                                {provider === 'GCP' && <CloudQueueIcon sx={{ fontSize: 24, mb: 1 }} />}
                                                {provider === 'Hybrid' && <span className="mb-1 text-[18px]">⚡️</span>}
                                                <div className="tracking-wide">{provider}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <Typography variant="overline" sx={{ color: '#d4af37', mb: 2, display: 'block', fontWeight: 800, letterSpacing: '0.15em' }}>Architecture Pattern</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    variant="outlined"
                                    value={techStack}
                                    onChange={(e) => setTechStack(e.target.value)}
                                    InputProps={GlassInputProps}
                                    SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#111620', border: '1px solid rgba(255,255,255,0.1)', '& .MuiMenuItem-root': { color: 'white', '&:hover': { bgcolor: 'rgba(212,175,55,0.2)' } } } } } }}
                                    sx={{
                                        mb: 8,
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            borderRadius: '1rem',
                                            transition: 'all 0.3s',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&.Mui-focused fieldset': { borderColor: '#d4af37', borderWidth: '1px' },
                                        }
                                    }}
                                >
                                    <MenuItem value="Modern, Legacy Integration">Service Match: Legacy Integration</MenuItem>
                                    <MenuItem value="Cloud Native">Cloud-Native Microservices</MenuItem>
                                    <MenuItem value="Serverless">Serverless Edge Architecture</MenuItem>
                                </TextField>

                                <Typography variant="overline" sx={{ color: '#d4af37', mb: 2, display: 'block', fontWeight: 800, letterSpacing: '0.15em' }}>System Complexity Profiler</Typography>
                                <Box sx={{ px: 2, pb: 4 }}>
                                    <Slider
                                        value={complexity}
                                        onChange={(e, val) => setComplexity(val as number)}
                                        sx={{
                                            color: '#d4af37',
                                            height: 6,
                                            '& .MuiSlider-thumb': {
                                                width: 20,
                                                height: 20,
                                                backgroundColor: '#fff',
                                                border: '2px solid #d4af37',
                                                boxShadow: '0 0 15px rgba(212,175,55,0.5)',
                                                '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 20px rgba(212,175,55,0.8)' },
                                            },
                                            '& .MuiSlider-track': {
                                                background: 'linear-gradient(90deg, rgba(212,175,55,0.2), #d4af37)',
                                                border: 'none',
                                            },
                                            '& .MuiSlider-rail': {
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                            }
                                        }}
                                    />
                                </Box>

                                <div className="flex justify-between items-center mt-auto gap-4">
                                    <button onClick={handleBack} className="text-gray-500 font-bold hover:text-white transition-colors duration-300 uppercase tracking-widest text-xs px-4">Back</button>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 py-4 rounded-xl font-black text-black bg-gradient-to-r from-gray-100 to-white hover:from-white hover:to-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 uppercase tracking-widest text-sm"
                                    >
                                        Assign Team →
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 4 && (
                            <div className="animate-fade-in flex flex-col h-full">
                                <Typography variant="h5" fontWeight="800" sx={{ mb: 6, color: 'white' }}>
                                    Lead Architect Selection
                                </Typography>

                                <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar flex-1 items-center px-2">
                                    {[
                                        { id: 'Strategy Lead', icon: <CloudUploadIcon sx={{ fontSize: 36 }} />, desc: 'Enterprise Systems\nHigh Scalability\nData Strategy' },
                                        { id: 'SecOps Principal', icon: <SecurityIcon sx={{ fontSize: 36 }} />, desc: 'Zero-Trust\nCompliance\nThreat Prevention' },
                                        { id: 'Systems Architect', icon: <ManageAccountsIcon sx={{ fontSize: 36 }} />, desc: 'Legacy Migration\nAPI Gateway\nService Mesh' },
                                    ].map((arch) => (
                                        <div
                                            key={arch.id}
                                            onClick={() => setArchetype(arch.id)}
                                            className={`min-w-[180px] h-[220px] snap-center flex flex-col items-center justify-center text-center p-6 rounded-2xl border transition-all duration-500 cursor-pointer relative group overflow-hidden ${archetype === arch.id
                                                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(212,175,55,0.15)] scale-105 z-10'
                                                : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                            <div className={`mb-4 transition-transform duration-500 ${archetype === arch.id ? 'text-[#d4af37] scale-110 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'text-gray-500'}`}>
                                                {arch.icon}
                                            </div>
                                            <Typography variant="subtitle2" fontWeight="800" sx={{ color: archetype === arch.id ? 'white' : 'gray', mb: 1.5, letterSpacing: '0.02em', zIndex: 10 }}>
                                                {arch.id}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', whiteSpace: 'pre-line', fontWeight: 600, zIndex: 10 }}>
                                                {arch.desc}
                                            </Typography>

                                            {/* Selection Indicator */}
                                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${archetype === arch.id ? 'border-[#d4af37] bg-black/50' : 'border-white/10'}`}>
                                                <div className={`w-2 h-2 rounded-full bg-[#d4af37] transition-all transform ${archetype === arch.id ? 'scale-100' : 'scale-0'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mt-6 gap-4">
                                    <button onClick={handleBack} disabled={isSubmitting} className="text-gray-500 font-bold hover:text-white transition-colors duration-300 uppercase tracking-widest text-xs px-4 disabled:opacity-30">Back</button>
                                    <button
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className="flex-1 flex justify-center items-center py-4 rounded-xl font-black text-black bg-gradient-to-r from-[#e5c15e] to-[#d4af37] hover:from-[#f5cd60] hover:to-[#e5c15e] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 disabled:opacity-50 uppercase tracking-widest text-sm"
                                    >
                                        {isSubmitting ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'Initialize Team'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </Box>
    );
}
