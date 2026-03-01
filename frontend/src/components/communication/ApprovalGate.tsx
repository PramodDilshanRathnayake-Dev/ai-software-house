import React, { useState } from 'react';
import { AgentAvatar } from '../ui/AgentAvatar';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface ApprovalGateProps {
    title: string;
    version: string;
    complexity?: 'Low' | 'Medium' | 'High';
    feasibility?: number;
    resources?: 'Optimal' | 'Constrained' | 'Excessive';
    onApprove: () => void;
    onRequestRevision: (notes: string) => void;
}

export const ApprovalGate: React.FC<ApprovalGateProps> = ({
    title,
    version,
    complexity = 'Medium',
    feasibility = 94,
    resources = 'Optimal',
    onApprove,
    onRequestRevision,
}) => {
    const [revisionMode, setRevisionMode] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');

    const handleRevisionSubmit = () => {
        if (revisionNotes.trim()) {
            onRequestRevision(revisionNotes);
            setRevisionMode(false);
            setRevisionNotes('');
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto relative group">
            {/* Subtle outer glow */}
            <div className="absolute -inset-px bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm opacity-50"></div>

            {/* Main Floating Card */}
            <div className="relative bg-slate-950/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl ring-1 ring-white/10 flex flex-col gap-4">

                {/* Header Styling */}
                <div className="flex flex-col items-start gap-1 mb-4">
                    <span className="text-white font-bold text-sm tracking-[0.15em] uppercase">
                        Strategist Agent Review
                    </span>
                </div>

                {/* Metrics Section */}
                <div className="flex flex-col space-y-4">
                    {/* Complexity */}
                    <div className="flex justify-between items-center py-1.5 group/row cursor-pointer">
                        <span className="text-slate-400 text-sm">Complexity:</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${complexity === 'High' ? 'text-red-500' : 'text-emerald-400'}`}>
                                {complexity}
                            </span>
                            <ChevronRightIcon sx={{ fontSize: 16 }} className="text-slate-600 group-hover/row:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Feasibility */}
                    <div className="flex flex-col gap-1.5 cursor-pointer group/row py-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Feasibility:</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${feasibility > 80 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                                    {feasibility}%
                                </span>
                                <ChevronRightIcon sx={{ fontSize: 16 }} className="text-slate-600 group-hover/row:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${feasibility > 80 ? 'bg-emerald-400' : 'bg-yellow-500'}`} style={{ width: `${feasibility}%` }}></div>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="flex justify-between items-center group/row cursor-pointer py-1.5">
                        <span className="text-slate-400 text-sm">Resources:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-emerald-400">{resources}</span>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex justify-between items-center group/row cursor-pointer py-1.5">
                        <span className="text-slate-400 text-sm">Date:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-300">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <EventAvailableIcon sx={{ fontSize: 14 }} className="text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* Action Buttons OR Revision Input */}
                {revisionMode ? (
                    <div className="flex flex-col gap-3 mt-2">
                        <textarea
                            rows={3}
                            placeholder="Define changes required..."
                            value={revisionNotes}
                            onChange={(e) => setRevisionNotes(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRevisionMode(false)}
                                className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                disabled={!revisionNotes.trim()}
                                onClick={handleRevisionSubmit}
                                className="flex-1 py-2 rounded-xl text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                            >
                                SUBMIT
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 mt-2">
                        <button
                            onClick={() => setRevisionMode(true)}
                            className="w-full bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 rounded-xl p-4 flex items-center gap-3 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                                <EditIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-white text-xs font-bold tracking-wider">REQUEST REVISION</span>
                                <span className="text-[10px] text-slate-400">Click to define changes</span>
                            </div>
                        </button>

                        <button
                            onClick={onApprove}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <RocketLaunchIcon sx={{ fontSize: 16 }} className="text-white" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-white text-xs font-bold tracking-wider">APPROVE & EXECUTE</span>
                                <span className="text-[10px] text-blue-200">Deploy to Staging</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Footer Section: Avatar & Agent Info */}
                <div className="mt-2 pt-4 border-t border-slate-800/50 flex items-start gap-3">
                    <div className="relative">
                        <AgentAvatar role="strategist" size={32} />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-300 text-[11px] font-bold mb-1 tracking-wider uppercase">Strategist</span>
                        <span className="text-slate-400 text-[11px] leading-snug">
                            "Architecture flows logically, scalability addressed, and not overly complex software project... Pending final sign-off."
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};
