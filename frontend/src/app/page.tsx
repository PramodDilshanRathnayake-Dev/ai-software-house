'use client';
import { Box, Typography, Avatar, Badge, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { io } from 'socket.io-client';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExploreIcon from '@mui/icons-material/Explore';
import BuildIcon from '@mui/icons-material/Build';
import PolicyIcon from '@mui/icons-material/Policy';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [missions, setMissions] = useState<any[]>([]);

  const fetchMissions = () => {
    fetchWithAuth('http://localhost:8000/api/strategist/missions')
      .then(res => res.json())
      .then(data => setMissions(data))
      .catch(err => console.error('Failed to fetch missions:', err));
  };

  useEffect(() => {
    fetchMissions();
    const socket = io('http://localhost:8000');
    socket.on('mission_updated', () => {
      fetchMissions();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const agents = [
    { name: 'Strategist', role: 'Architect & PM', desc: 'Requirements, System Design', icon: <ExploreIcon sx={{ fontSize: 40, color: '#3b82f6' }} />, status: 'Deliberating', statusColor: 'text-blue-400' },
    { name: 'Builder', role: 'Lead Developer', desc: 'Code Generation, API Integration', icon: <BuildIcon sx={{ fontSize: 40, color: '#d4af37' }} />, status: 'Executing • 820 WPM', statusColor: 'text-green-400' },
    { name: 'Auditor', role: 'QA & Security', desc: 'E2E Testing, UI Verification', icon: <PolicyIcon sx={{ fontSize: 40, color: '#94a3b8' }} />, status: 'Awaiting Build', statusColor: 'text-gray-400' },
    { name: 'SRE', role: 'DevOps & Infra', desc: 'Deployment, Self-Healing', icon: <SettingsSuggestIcon sx={{ fontSize: 40, color: '#f59e0b' }} />, status: 'Monitoring 99.99%', statusColor: 'text-amber-400' },
  ];

  const tasks = [
    { id: 1, name: 'Auth Module', agent: 'Builder', progress: 100, status: 'Done' },
    { id: 2, name: 'Database Migrations', agent: 'SRE', progress: 80, status: 'In Progress' },
    { id: 3, name: 'Payment Gateway', agent: 'Builder', progress: 30, status: 'In Progress' },
    { id: 4, name: 'UI Components', agent: 'Auditor', progress: 0, status: 'To Do' },
  ];

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 4, background: 'radial-gradient(circle at center, #0B0F19 0%, #05070A 100%)' }}>

        {/* Main Glass Container */}
        <div className="w-full max-w-7xl relative">

          {/* Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 via-amber-500/5 to-transparent rounded-[2rem] blur-2xl opacity-70 pointer-events-none"></div>

          <div className="relative bg-[#0d1218]/90 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-8">

            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center border-b border-white/10 pb-5">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-amber-500/40 flex items-center justify-center bg-white/5 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-amber-300 to-amber-600"></div>
                </div>
                <Typography variant="h5" sx={{ letterSpacing: '0.15em', fontWeight: 800 }}>
                  <span className="text-white">AETHELRED</span> <span className="text-[#d4af37]">LABS</span>
                </Typography>
              </div>

              {/* Nav Links */}
              <div className="hidden md:flex gap-10 text-sm font-bold tracking-widest uppercase">
                <span className="text-[#d4af37] border-b-2 border-[#d4af37] pb-1 cursor-pointer">Mission Control</span>
                <span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Projects</span>
                <span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Team Data</span>
                <span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Settings</span>
              </div>

              {/* Profile / Notifications */}
              <div className="flex items-center gap-5">
                <IconButton size="small">
                  <Badge variant="dot" color="error">
                    <NotificationsIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
                  </Badge>
                </IconButton>
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#d4af37', fontSize: '0.875rem', color: 'black', fontWeight: 'bold' }}>C</Avatar>
                  <span className="text-sm font-semibold text-white pr-2">CEO View</span>
                </div>
              </div>
            </div>

            {/* Top Row: Metrics & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* Left Column: Burn Rate & Savings */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-5 flex-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Burn Rate Analysis</Typography>
                    <AttachMoneyIcon sx={{ color: '#d4af37', fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-semibold mb-1">AI Tokens Cost</span>
                        <span className="text-2xl font-bold text-white">$42.50</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 font-semibold mb-1">Human Eqv.</span>
                        <span className="text-lg font-bold text-gray-400 line-through decoration-red-500/50">$3,200</span>
                      </div>
                    </div>
                    <div className="h-px w-full bg-white/10 my-1"></div>
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-400">
                      <span>Total Savings</span>
                      <span>98.6%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mission Progress</Typography>
                    <span className="text-gray-500 text-xs tracking-widest">v2.4.1</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset="45" className="transition-all duration-1000" />
                      </svg>
                      <span className="absolute text-sm font-bold text-white">74%</span>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex justify-between text-xs font-semibold"><span className="text-gray-400">Design</span><span className="text-white">100%</span></div>
                      <div className="flex justify-between text-xs font-semibold"><span className="text-gray-400">Backend</span><span className="text-white">85%</span></div>
                      <div className="flex justify-between text-xs font-semibold"><span className="text-[#3b82f6]">Frontend</span><span className="text-white">40%</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Visual Progress / Gantt */}
              <div className="col-span-1 lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="subtitle2" fontWeight="700" sx={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Agent Task Orchestration</Typography>
                  <div className="text-xs font-bold text-[#d4af37] bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">LIVE</div>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white">{task.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-semibold">{task.agent}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400' : task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${task.progress === 100 ? 'bg-emerald-500' : task.progress > 0 ? 'bg-blue-500' : 'bg-transparent'}`} style={{ width: `${Math.max(task.progress, 5)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Status & Alerts */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Infrastructure Health</Typography>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-emerald-400">99.98<span className="text-sm text-emerald-400/50">%</span></span>
                      <span className="text-xs text-gray-500 font-semibold mt-1">AWS Staging Cluster</span>
                    </div>
                    <MapIcon sx={{ fontSize: 50, color: 'rgba(255,255,255,0.05)' }} className="absolute right-4 bottom-4" />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>System Interventions</Typography>
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">2</span>
                  </div>
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                    <div className="flex items-start gap-3 bg-black/20 p-2 rounded-lg border border-red-500/10">
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#f87171', mt: 0.5 }} />
                      <div className="flex flex-col">
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>Approval Required</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>DB Schema migration pending.</Typography>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/20 p-2 rounded-lg border border-amber-500/10">
                      <WarningAmberIcon sx={{ fontSize: 16, color: '#fb923c', mt: 0.5 }} />
                      <div className="flex flex-col">
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>UI Review Ready</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Auth flow components generated.</Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Agent Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
              {agents.map((agent, i) => (
                <div key={agent.name} className="relative group p-[1px] rounded-[1.5rem] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2">
                  {/* Hover Border Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent group-hover:from-white/40 opacity-50 transition-opacity"></div>

                  {/* Card Content */}
                  <div className="relative bg-[#111620] h-full rounded-[1.4rem] p-6 flex flex-col border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                        {/* Icon Glow */}
                        <div className={`absolute inset-0 blur-xl rounded-full scale-150 ${agent.name === 'Builder' ? 'bg-amber-500/10' : agent.name === 'Strategist' ? 'bg-blue-500/10' : 'bg-white/5'}`}></div>
                        <div className="relative z-10 w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 shadow-inner">
                          {agent.icon}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">ID: AGT-{101 + i}</span>
                        <div className={`flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded text-[10px] font-bold ${agent.statusColor}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${agent.statusColor.replace('text-', 'bg-')}`}></div>
                          {agent.status}
                        </div>
                      </div>
                    </div>

                    <Typography variant="h6" fontWeight="800" sx={{ color: '#fff', mb: 0.5, letterSpacing: '0.02em' }}>{agent.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#d4af37', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{agent.role}</Typography>

                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 4, lineHeight: 1.6, flexGrow: 1 }}>
                      {agent.desc}
                    </Typography>

                    <div className="mt-auto border-t border-white/10 pt-4 flex justify-between items-center group-hover:border-white/20 transition-colors">
                      <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">View Logs</span>
                      <CheckCircleIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }} className="group-hover:text-amber-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Box>
    </ProtectedRoute>
  );
}
