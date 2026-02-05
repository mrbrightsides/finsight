
import React, { useState } from 'react';
import { runTimeMachine } from '../services/geminiService';
import { UserProfile } from '../types';

interface TimeMachineProps {
  profile: UserProfile;
}

const ERAS = [
  { id: '1929', label: 'Great Depression', year: '1929', icon: 'fa-cloud-meatball', color: 'from-slate-700 to-slate-900', desc: 'Global market collapse and extreme deflation.' },
  { id: '1973', label: 'Oil Crisis', year: '1973', icon: 'fa-gas-pump', color: 'from-amber-600 to-amber-800', desc: 'Stagflation and massive energy price hikes.' },
  { id: '1999', label: 'Dot Com Bubble', year: '1999', icon: 'fa-microchip', color: 'from-blue-500 to-indigo-700', desc: 'Irrational exuberance in tech valuations.' },
  { id: '2008', label: 'Subprime Crash', year: '2008', icon: 'fa-house-crack', color: 'from-rose-600 to-rose-900', desc: 'Systemic banking failure and real estate burst.' },
  { id: '1637', label: 'Tulip Mania', year: '1637', icon: 'fa-flower-tulip', color: 'from-emerald-600 to-emerald-800', desc: 'The world\'s first major speculative bubble.' },
];

export const TimeMachine: React.FC<TimeMachineProps> = ({ profile }) => {
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunch = async (eraId: string) => {
    setActiveEra(eraId);
    setIsLoading(true);
    setResult(null);
    const era = ERAS.find(e => e.id === eraId);
    if (!era) return;
    
    try {
      const output = await runTimeMachine(profile, era.label);
      setResult(output || "Simulation failed.");
    } catch (e) {
      setResult("Temporal anomaly detected. Could not process history.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
          <i className="fas fa-clock-rotate-left"></i> Chronos Engine v2.0
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Economic Time Machine</h2>
        <p className="text-slate-500 mt-2 text-lg font-medium">Stress-test your 2026 portfolio against history's greatest crashes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Target Era</h3>
             {ERAS.map((era) => (
               <button
                 key={era.id}
                 onClick={() => handleLaunch(era.id)}
                 disabled={isLoading}
                 className={`w-full p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                   activeEra === era.id ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-50 hover:border-slate-200'
                 }`}
               >
                 <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${era.color} opacity-5 -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-125`}></div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 bg-gradient-to-br ${era.color} text-white rounded-2xl flex items-center justify-center text-xl`}>
                      <i className={`fas ${era.icon}`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{era.label}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{era.year} AD</div>
                    </div>
                 </div>
                 <p className="mt-4 text-[11px] font-medium text-slate-500 leading-relaxed relative z-10">{era.desc}</p>
               </button>
             ))}
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className={`bg-slate-900 rounded-[3rem] min-h-[600px] p-10 text-white shadow-2xl flex flex-col transition-all duration-700 ${isLoading ? 'opacity-80 scale-[0.98]' : 'opacity-100'}`}>
              {!activeEra && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-12">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-5xl text-slate-700">
                     <i className="fas fa-shuttle-space"></i>
                   </div>
                   <div className="max-w-xs">
                     <h4 className="text-xl font-black">Temporal Link Ready</h4>
                     <p className="text-slate-500 text-sm mt-2">Select an era on the left to begin the stress-test simulation of your current assets.</p>
                   </div>
                </div>
              )}

              {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                   <div className="relative">
                      <div className="w-32 h-32 border-4 border-white/5 rounded-full"></div>
                      <div className="w-32 h-32 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                      <i className="fas fa-bolt-lightning text-3xl text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></i>
                   </div>
                   <div className="text-center">
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Initializing Temporal Fold</p>
                     <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase">Decrypting 20th Century Financial Records...</p>
                   </div>
                </div>
              )}

              {result && !isLoading && (
                <div className="animate-fadeIn h-full flex flex-col">
                   <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                          <i className="fas fa-file-invoice"></i>
                        </div>
                        <div>
                          <h4 className="font-black text-lg">Simulation Report</h4>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chronos Result ID: {Math.random().toString(36).substr(2,9)}</p>
                        </div>
                      </div>
                      <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white transition-colors">
                        <i className="fas fa-rotate-left"></i>
                      </button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide prose prose-invert prose-sm max-w-none leading-relaxed">
                      <div className="text-slate-300 font-medium">
                        {result.split('\n').map((line, i) => (
                          <p key={i} className="mb-4">{line}</p>
                        ))}
                      </div>
                   </div>

                   <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6">
                      <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-brain"></i>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hackonomics Takeaway</div>
                        <p className="text-xs font-bold leading-relaxed">Diversification isn't just a buzzword; in periods like the 1970s, it's the difference between wealth and total erosion.</p>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
