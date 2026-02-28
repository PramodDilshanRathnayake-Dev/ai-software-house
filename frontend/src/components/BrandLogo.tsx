import React from 'react';

export function BrandLogo() {
    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 group-hover:from-indigo-400 group-hover:to-cyan-300 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <span className="text-white font-bold text-lg tracking-tighter leading-none">AI</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Aethelred Labs
            </span>
        </div>
    );
}
