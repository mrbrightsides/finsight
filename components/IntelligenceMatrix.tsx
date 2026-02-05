
import React, { useState, useEffect } from 'react';
import { getMarketVitals } from '../services/geminiService';
import { AppTab } from '../types';

interface IntelligenceMatrixProps {
  onStartWithTab: (tab: AppTab) => void;
}

const LOG_MESSAGES = [
  "Initializing Chronos Engine v2.0...",
  "Syncing DeFi Protocol nodes...",
  "Decrypting 2026 Yield Curves...",
  "Scanning global market news...",
  "Neural Advisor online...",
  "Authenticating Hackonomics credentials...",
  "Calibrating Tax-Loss algorithms...",
  "Establishing Secure Temporal Link...",
  "Grounding intelligence in real-time search...",
];

export const IntelligenceMatrix: React.FC<IntelligenceMatrixProps> = ({ onStartWithTab }) => {
  const [headline, setHeadline] = useState<string>("Initializing Market Grounding...");
  const [logs, setLogs] = useState<string[]>(["[0.00s] SYSTEM START"]);
  const [vitals, setVitals] = useState({ yield: 4.25, heat: 68, liquidity: 92 });

  useEffect(() => {
    // Fetch live market headline
    const loadVitals = async () => {
      try {
        const h = await getMarketVitals();
        setHeadline(h);
      } catch (e) {
        setHeadline("Market connection restricted. Simulation mode active.");
      }
    };
    loadVitals();

    // Log rotation
    const logInterval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, `[${(Math.random() * 10).toFixed(2)}s] ${LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]}`];
        return next.slice(-4);
      });
    }, 2000);

    // Vital ticking
    const vitalInterval = setInterval(() => {
      setVitals(v => ({
        yield: Number((v.yield + (Math.random() - 0.5) * 0.1).toFixed(2)),
        heat: Math.min(100, Math.max(0, Math.round(v.heat + (Math.random() - 0.5) * 5))),
        liquidity: Math.min(100, Math.max(0, Math.round(v.liquidity + (Math.random() - 0.5) * 2))),
      }));
    }, 3000);

    return () => {
      clearInterval(logInterval);
      clearInterval(vitalInterval);
    };
  }, []);

  return (
    <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-slate-800 p-2 rounded-[2.5rem] shadow-2xl overflow-hidden group">
      <div className="bg-slate-950 rounded-[2rem] overflow-hidden flex flex-col min-h-[450px]">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-6 py-4 bg-slate-900/80 border-b border-slate-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div className="mx-auto text-[10px] font-black text-slate-600 uppercase tracking-widest">
            FinSight Intelligence Matrix v4.0.1
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </div>
        </div>

        {/* Live News Bar */}
        <div className="px-8 py-3 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-4">
          <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest shrink-0">
            <i className="fas fa-rss mr-2"></i> Global Pulse
          </div>
          <div className="text-[11px] font-medium text-slate-300 italic truncate animate-fadeIn">
            "{headline}"
          </div>
        </div>

        {/* Main Interface */}
        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Functional Zone 1: Trajectory */}
          <button 
            onClick={() => onStartWithTab(AppTab.SIMULATOR)}
            className="group/node space-y-4 text-left p-6 rounded-[2rem] border border-transparent hover:bg-white/5 hover:border-white/10 transition-all"
          >
            <div className="h-4 bg-indigo-500/10 rounded-full w-2/3 group-hover/node:w-full transition-all duration-700"></div>
            <div className="h-24 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-center justify-center relative overflow-hidden">
               <i className="fas fa-chart-line text-4xl text-indigo-500/40 group-hover/node:scale-125 group-hover/node:text-indigo-400 transition-all duration-500"></i>
               <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Wealth Path Studio</div>
            <div className="text-[8px] font-bold text-indigo-400 uppercase opacity-0 group-hover/node:opacity-100 transition-opacity">Launch Engine <i className="fas fa-arrow-right ml-1"></i></div>
          </button>

          {/* Functional Zone 2: Risk Audit */}
          <button 
            onClick={() => onStartWithTab(AppTab.TAX)}
            className="group/node space-y-4 text-left p-6 rounded-[2rem] border border-transparent hover:bg-white/5 hover:border-white/10 transition-all"
          >
            <div className="h-4 bg-emerald-500/10 rounded-full w-1/2 group-hover/node:w-3/4 transition-all duration-700"></div>
            <div className="h-24 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-center justify-center relative overflow-hidden">
               <i className="fas fa-shield-halved text-4xl text-emerald-500/40 group-hover/node:scale-125 group-hover/node:text-emerald-400 transition-all duration-500"></i>
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Fiscal Integrity Unit</div>
            <div className="text-[8px] font-bold text-emerald-400 uppercase opacity-0 group-hover/node:opacity-100 transition-opacity">Launch Audit <i className="fas fa-arrow-right ml-1"></i></div>
          </button>

          {/* Functional Zone 3: Protocol explorer */}
          <button 
            onClick={() => onStartWithTab(AppTab.DEFI)}
            className="group/node space-y-4 text-left p-6 rounded-[2rem] border border-transparent hover:bg-white/5 hover:border-white/10 transition-all"
          >
            <div className="h-4 bg-purple-500/10 rounded-full w-3/4 group-hover/node:w-full transition-all duration-700"></div>
            <div className="h-24 bg-purple-500/5 rounded-3xl border border-purple-500/10 flex items-center justify-center relative overflow-hidden">
               <i className="fas fa-microchip text-4xl text-purple-500/40 group-hover/node:scale-125 group-hover/node:text-purple-400 transition-all duration-500"></i>
               <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">DeFi Explorer</div>
            <div className="text-[8px] font-bold text-purple-400 uppercase opacity-0 group-hover/node:opacity-100 transition-opacity">Launch Simulation <i className="fas fa-arrow-right ml-1"></i></div>
          </button>
        </div>

        {/* Real-time Ticker Vitals */}
        <div className="px-8 pb-4 flex gap-6 border-t border-white/5 pt-4">
           <div>
              <div className="text-[7px] font-black text-slate-600 uppercase">Avg Yield</div>
              <div className="text-xs font-black text-slate-300 tabular-nums">{vitals.yield}%</div>
           </div>
           <div>
              <div className="text-[7px] font-black text-slate-600 uppercase">Market Heat</div>
              <div className="text-xs font-black text-slate-300 tabular-nums">{vitals.heat}%</div>
           </div>
           <div>
              <div className="text-[7px] font-black text-slate-600 uppercase">Liquidity</div>
              <div className="text-xs font-black text-slate-300 tabular-nums">{vitals.liquidity}%</div>
           </div>
        </div>

        {/* System Logs */}
        <div className="bg-black/40 p-6 font-mono text-[9px] space-y-1.5 border-t border-white/5">
           {logs.map((log, i) => (
             <div key={i} className={`flex gap-3 ${i === logs.length - 1 ? 'text-indigo-400' : 'text-slate-600'}`}>
                <span className="opacity-50 shrink-0">{log.split(' ')[0]}</span>
                <span className="uppercase tracking-widest">{log.split(' ').slice(1).join(' ')}</span>
             </div>
           ))}
        </div>
      </div>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none"></div>
    </div>
  );
};
