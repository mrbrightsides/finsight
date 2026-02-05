
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { analyzeDeFiStrategy } from '../services/geminiService';

interface DeFiExplorerProps {
  profile: UserProfile;
}

interface DeFiAnalysis {
  strategies: { name: string; apyRange: string; complexity: string; desc: string }[];
  conceptName: string;
  conceptExplanation: string;
  safetyTips: string[];
  riskVerdict: string;
}

const DEFI_PROTOCOLS = [
  { id: 'lending', name: 'Lending Markets', icon: 'fa-hand-holding-dollar', desc: 'Supply assets to earn interest from borrowers.' },
  { id: 'amm', name: 'DEX / AMMs', icon: 'fa-right-left', desc: 'Provide liquidity to trading pairs and earn swap fees.' },
  { id: 'staking', name: 'Liquid Staking', icon: 'fa-layer-group', desc: 'Secure the network and earn rewards while keeping assets liquid.' },
  { id: 'yield', name: 'Yield Aggregators', icon: 'fa-wheat-awn', desc: 'Automated strategies that auto-compound your earnings.' },
];

export const DeFiExplorer: React.FC<DeFiExplorerProps> = ({ profile }) => {
  const [analysis, setAnalysis] = useState<DeFiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setRateLimitError(false);
    try {
      const res = await analyzeDeFiStrategy(profile);
      if (res) setAnalysis(res);
    } catch (e: any) {
      console.error("DeFi AI Analysis error:", e);
      if (e?.message?.includes('429') || e?.status === 429) {
        setRateLimitError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchAnalysis();
  }, [profile.id, fetchAnalysis]);

  const cryptoAssets = profile.assets.filter(a => a.type === 'crypto');
  const totalCryptoValue = cryptoAssets.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Educational Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-indigo-100">
            <i className="fas fa-microchip"></i> Decentralized Intelligence
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">DeFi Learning Lab</h2>
          <p className="text-slate-500 mt-4 text-lg font-medium">Explore yield-generating protocols and on-chain logic based on your current capital structure.</p>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 shrink-0 group">
           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
             <i className="fas fa-vault"></i>
           </div>
           <div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Portfolio Exposure</div>
             <div className="text-lg font-black text-slate-900">${totalCryptoValue.toLocaleString()} <span className="text-[10px] text-slate-400">Crypto</span></div>
           </div>
        </div>
      </header>

      {/* Protocol Quick Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEFI_PROTOCOLS.map((proto) => (
          <div key={proto.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <i className={`fas ${proto.icon}`}></i>
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">{proto.name}</h4>
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{proto.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Strategy Column */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden min-h-[500px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 opacity-30 pointer-events-none"></div>
              
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-12 flex items-center gap-4 relative z-10">
                <span className="w-2 h-10 bg-indigo-600 rounded-full"></span>
                AI Protocol Simulations
              </h3>

              {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-8 relative z-10">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synthesizing Yield Architectures...</p>
                </div>
              ) : rateLimitError ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-6 text-center relative z-10">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-2xl shadow-inner shadow-amber-200/50"><i className="fas fa-hourglass-half"></i></div>
                  <div className="space-y-2 max-w-xs">
                    <h4 className="font-black text-slate-900 text-lg">Neural Congestion</h4>
                    <p className="text-xs text-slate-500 font-medium">The simulation node is over-capacity. Let's try regenerating your strategy.</p>
                  </div>
                  <button onClick={fetchAnalysis} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                    <i className="fas fa-rotate"></i> Retry Lab Analysis
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                   {analysis?.strategies.map((strat, i) => (
                     <div key={i} className="group p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-indigo-600 transition-all hover:-translate-y-2 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                           <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${strat.complexity === 'Low' ? 'bg-emerald-100 text-emerald-600' : strat.complexity === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} group-hover:bg-white transition-colors`}>{strat.complexity} Intensity</div>
                           <div className="text-3xl font-black text-indigo-600 group-hover:text-white transition-colors">{strat.apyRange}</div>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-4">{strat.name}</h4>
                        <p className="text-xs font-medium text-slate-500 group-hover:text-indigo-50 leading-relaxed line-clamp-3">{strat.desc}</p>
                     </div>
                   ))}
                </div>
              )}
           </div>

           <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
              <div className="absolute bottom-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-125 transition-transform">
                <i className="fas fa-atom text-[12rem]"></i>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                 <div className="shrink-0 w-28 h-28 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-5xl text-indigo-400 shadow-2xl">
                    <i className="fas fa-dna"></i>
                 </div>
                 <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-black text-indigo-400">{analysis?.conceptName || "Protocol Concept Lab"}</h3>
                    <p className="text-xl font-medium leading-relaxed italic text-slate-300">"{analysis?.conceptExplanation || "Analyze your portfolio structure to reveal underlying DeFi analogies..."}"</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Audit Column */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-30"></div>
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em] mb-10 flex justify-between items-center relative z-10">
                Risk Literacy Audit
                <i className="fas fa-shield-virus text-indigo-600"></i>
              </h3>

              <div className="flex-1 space-y-10 relative z-10">
                 <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase mb-3">Protocol Safety Verdict</h4>
                    <p className="text-base font-black text-rose-900 leading-tight">
                      {totalCryptoValue === 0 ? "Entry Level: Low Exposure detected." : analysis?.riskVerdict || "Evaluating strategy risks..."}
                    </p>
                 </div>

                 <div className="space-y-6">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Red Flags</h5>
                    <div className="space-y-4">
                      {(analysis?.safetyTips || ["Calculating potential vulnerabilities..."]).map((tip, i) => (
                        <div key={i} className="flex gap-4 items-start group">
                           <div className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[11px] shrink-0 font-black group-hover:bg-indigo-600 transition-colors">!</div>
                           <p className="text-[13px] font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">{tip}</p>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-50 relative z-10">
                 <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-600 italic leading-relaxed">
                      "Education-first DeFi. Strategies above are simulated based on your profile assets. Always perform independent research (DYOR) before committing capital."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
