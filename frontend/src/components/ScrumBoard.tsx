'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';

const columns = [
    { id: 'backlog', title: 'BACKLOG', count: 14, color: 'from-cyan-400 to-blue-500', shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]' },
    { id: 'inprogress', title: 'IN PROGRESS', count: 5, color: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]' },
    { id: 'review', title: 'REVIEW', count: 7, color: 'from-orange-400 to-amber-500', shadow: 'shadow-[0_0_15px_rgba(251,146,60,0.3)]' },
    { id: 'done', title: 'DONE', count: 19, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
];

const mockTasks = [
    { id: 'AI-450', title: 'Refactor NLU Logic', agent: 'Builder', column: 'backlog', priority: 'HIGH', progress: 10, time: '10:50 ms' },
    { id: 'AI-451', title: 'Refactor CI/CD Logic', agent: 'Builder', column: 'backlog', priority: 'MED', progress: 30, time: '10:59 ms' },
    { id: 'AI-452', title: 'Implement Natural Language Model', agent: 'Builder', column: 'inprogress', priority: 'HIGH', progress: 45, time: '10:53 ms' },
    { id: 'AI-453', title: 'Develop Microservices API', agent: 'Auditor', column: 'inprogress', priority: 'HIGH', progress: 60, time: '10:59 ms' },
    { id: 'AI-448', title: 'Validate Model Security', agent: 'Auditor', column: 'review', priority: 'HIGH', progress: 100, time: '19:30 ms', status: 'Reviewing' },
    { id: 'AI-432', title: 'Deploy QA Environment', agent: 'SRE', column: 'done', priority: 'HIGH', progress: 100, time: '10:30 ms', status: 'Completed' },
];

export function ScrumBoard() {
    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Aethelred AI Labs - Kanban Board: Sprint 14
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Active Agents: Builder, Auditor, SRE</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4">
                        {/* Column Header */}
                        <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group`}>
                            {/* Neon top border effect */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${col.color} ${col.shadow}`} />

                            <div className="flex justify-between items-center">
                                <h3 className="font-bold tracking-wider text-sm text-slate-700 dark:text-slate-300">
                                    {col.title}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {col.count}
                                </span>
                            </div>
                        </div>

                        {/* Task Cards Container */}
                        <div className="flex-1 min-h-[500px] space-y-4 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/20 border border-transparent dark:border-slate-800/50">
                            {mockTasks
                                .filter((t) => t.column === col.id)
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${task.agent === 'Builder' ? 'from-cyan-400 to-blue-500' :
                                                    task.agent === 'Auditor' ? 'from-orange-400 to-amber-500' :
                                                        'from-emerald-400 to-teal-500'
                                                    }`}>
                                                    {task.agent.charAt(0)}
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    {task.agent}
                                                </span>
                                            </div>

                                            {task.status && (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${task.status === 'Completed' ? 'text-emerald-500' : 'text-orange-400'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            )}
                                            {!task.status && (
                                                <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] mb-1 leading-tight">
                                            {task.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4 font-mono">
                                            {task.id}
                                        </p>

                                        <div className="flex items-center gap-2 mb-4">
                                            {task.priority === 'HIGH' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                                    HIGH
                                                </span>
                                            )}
                                            {task.priority === 'MED' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                                                    MED
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                                <span>Progress</span>
                                                <span className="font-mono">{task.time}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${col.color}`}
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
