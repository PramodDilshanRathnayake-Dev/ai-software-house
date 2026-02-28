'use client';

import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

const steps = [
    { id: 1, label: 'Project Overview', active: true },
    { id: 2, label: 'Features', active: false },
    { id: 3, label: 'Budget', active: false },
    { id: 4, label: 'Timeline', active: false },
    { id: 5, label: 'Review', active: false },
];
export function IntakeChat() {
    const router = useRouter();
    const [messages, setMessages] = useState([
        {
            role: 'agent',
            name: 'Strategist',
            content: "Hello! 👋 I'm Strategist. To get started, what is the name of your new project?",
        },
    ]);
    const [input, setInput] = useState('');
    const [setupPhase, setSetupPhase] = useState<'name' | 'requirements' | 'submitting'>('name');
    const [projectName, setProjectName] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        setMessages((prev) => [...prev, { role: 'user', name: 'You', content: text }]);
        setInput('');

        if (setupPhase === 'name') {
            setProjectName(text);
            setSetupPhase('requirements');
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'agent',
                        name: 'Strategist',
                        content: `Got it. "${text}" sounds great. Now, please describe your vision and the core requirements for the system.`
                    }
                ]);
            }, 600);
        } else if (setupPhase === 'requirements') {
            setSetupPhase('submitting');
            setMessages((prev) => [
                ...prev,
                {
                    role: 'agent',
                    name: 'Strategist',
                    content: "Processing your requirements... Generating PRD and Scrum Backlog... This will take a moment."
                }
            ]);

            try {
                const response = await fetch('http://localhost:8000/api/strategist/intake', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectName: projectName || 'New Project', clientRequest: text })
                });

                const data = await response.json();
                if (response.ok && data.missionId) {
                    router.push(`/mission/${data.missionId}`);
                } else {
                    setMessages((prev) => [
                        ...prev,
                        { role: 'agent', name: 'Strategist', content: `Error creating mission: ${data.error || 'Unknown error'}` }
                    ]);
                    setSetupPhase('requirements'); // Allow retry
                }
            } catch (err: any) {
                console.error(err);
                setMessages((prev) => [
                    ...prev,
                    { role: 'agent', name: 'Strategist', content: `Connection error: ${err.message}. Ensure backend is running.` }
                ]);
                setSetupPhase('requirements'); // Allow retry
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-start justify-center mt-12 pb-12">
            {/* Main Chat Container */}
            <div className="flex-1 w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden">
                <div className="p-8 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Project Intake: Meet Your AI Strategist
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Let&apos;s build your next software masterpiece. Tell us about your vision.
                    </p>
                </div>

                <div className="p-8 space-y-6 min-h-[400px] flex flex-col">
                    <div className="flex-1 space-y-6 overflow-y-auto">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'agent' && (
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg pointer-events-none">
                                        <Bot size={20} />
                                    </div>
                                )}

                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role === 'agent' && (
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">{msg.name}</span>
                                    )}
                                    <div className={`p-4 rounded-2xl max-w-[85%] text-slate-800 dark:text-slate-200 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 dark:from-cyan-400/10 dark:to-indigo-500/10 border border-cyan-500/30'
                                        : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="mt-auto relative rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 focus-within:ring-2 ring-indigo-500/50 transition-all flex items-end">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your requirements here..."
                            className="w-full bg-transparent border-none outline-none resize-none p-3 text-slate-900 dark:text-slate-100 min-h-[60px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || setupPhase === 'submitting'}
                            className="mb-1 mr-1 px-4 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-white font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {setupPhase === 'submitting' ? <CircularProgress size={16} color="inherit" /> : 'Send'} <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Side Stepper */}
            <div className="w-full md:w-64 shrink-0 mt-8 md:mt-24 pl-8 md:border-l border-slate-200 dark:border-slate-800">
                <div className="space-y-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex items-center gap-4 group">
                            {idx !== steps.length - 1 && (
                                <div className="absolute top-8 left-3 w-[2px] h-full -ml-[1px] bg-slate-200 dark:bg-slate-800" />
                            )}
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-xs font-bold transition-all ${step.active
                                    ? 'bg-cyan-400 text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                {step.id}
                            </div>
                            <span
                                className={`font-medium ${step.active ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
