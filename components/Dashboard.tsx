
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { calculateFinancialHealth } from '../services/geminiService';

interface DashboardProps {
  profile: UserProfile;
  onTabChange: (tab: any) => void;
}

interface ResilienceMetrics {
  emergencyFund: number;
  debtRatio: number;
  diversification: number;
}

interface HealthData {
  score: number;
  verdict: string;
  metrics: ResilienceMetrics;
  insights: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onTabChange }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoadingHealth(true);
    setRateLimitError(false);
    try {
      await new Promise(r => setTimeout(r, 200));
      const data = await calculateFinancialHealth(profile);
      setHealthData(data as HealthData);
    } catch (e: any) {
      console.error("Health Audit Error:", e);
      if (e?.message?.includes('429') || e?.status === 429) {
        setRateLimitError(true);
      }
    } finally {
      setLoadingHealth(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const stats = useMemo(() => {
    const totalAssets = profile.assets.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
    const totalDebt = Math.abs(profile.assets.reduce((sum, a) => sum + (a.balance < 0 ? a.balance : 0), 0));
    const netWorth = totalAssets - totalDebt;
    const freeCashFlow = profile.monthlyIncome - profile.monthlyExpenses;

    return [
      { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, icon: 'fa-chart-pie', color: 'bg-indigo-600', sub: `${profile.assets.length} Assets` },
      { label: 'Free Cash Flow', value: `$${freeCashFlow.toLocaleString()}`, icon: 'fa-money-bill-trend-up', color: 'bg-emerald-500', sub: 'Monthly Surplus' },
      { label: 'Debt Ratio', value: `${((totalDebt / (totalAssets || 1)) * 100).toFixed(1)}%`, icon: 'fa-scale-unbalanced', color: 'bg-rose-500', sub: 'Leverage' },
      { label: 'Burn Rate', value: `${((profile.monthlyExpenses / (profile.monthlyIncome || 1)) * 100).toFixed(1)}%`, icon: 'fa-fire', color: 'bg-amber-500', sub: 'Utilization' },
    ];
  }, [profile]);

  const getHealthTheme = (score: number) => {
    if (score < 40) return { color: 'text-rose-500', stroke: 'stroke-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20', label: 'Critical' };
    if (score < 60) return { color: 'text-amber-500', stroke: 'stroke-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20', label: 'Fragile' };
    if (score < 80) return { color: 'text-emerald-500', stroke: 'stroke-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20', label: 'Stable' };
    return { color: 'text-indigo-400', stroke: 'stroke-indigo-400', bg: 'bg-indigo-400/10', glow: 'shadow-indigo-400/20', label: 'Resilient' };
  };

  const theme = getHealthTheme(healthData?.score || 0);
  const circumference = 565.48;

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full">Executive Pulse</span>
              <span>Hackonomics 2026 Engine</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome back, <span className="text-indigo-600">{profile.name}</span>. <br/>
              Your financial blueprint is <span className="text-emerald-500 italic">Optimized</span>.
            </h1>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-50">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-xl font-black text-slate-900">{stat.value}</div>
                <div className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 to-indigo-600"></div>
          
          {loadingHealth ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
               <div className="relative flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-slate-800 animate-pulse"></div>
                  <i className="fas fa-brain text-4xl text-indigo-400 absolute animate-pulse"></i>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Processing Fiscal DNA...</div>
            </div>
          ) : rateLimitError ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-12 animate-fadeIn">
               <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-2xl"><i className="fas fa-hourglass-half"></i></div>
               <div>
                  <h4 className="font-black text-lg">AI Node Busy</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Rate limit exceeded</p>
               </div>
               <button onClick={fetchHealth} className="px-6 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all">Retry Audit</button>
            </div>
          ) : (
            <div className="w-full animate-fadeIn flex flex-col items-center">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Financial Resilience Metric</h3>
              
              <div className="relative w-64 h-64 flex items-center justify-center">
                 <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${theme.bg}`}></div>
                 
                 <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 224 224">
                    <circle cx="112" cy="112" r="90" className="stroke-slate-800" strokeWidth="18" fill="none" />
                    <circle 
                      cx="112" cy="112" r="90" 
                      className={`${theme.stroke} transition-all duration-1000 ease-in-out`} 
                      strokeWidth="18" 
                      fill="none" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={circumference - (circumference * (healthData?.score || 0)) / 100} 
                      strokeLinecap="round" 
                    />
                 </svg>

                 <div className="relative z-10 flex flex-col items-center">
                    <div className={`text-7xl font-black tracking-tighter ${theme.color}`}>
                      {healthData?.score || 0}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full ${theme.bg} ${theme.color} text-[10px] font-black uppercase tracking-widest mt-2 border border-white/5`}>
                      {theme.label}
                    </div>
                 </div>
              </div>

              {healthData?.metrics && (
                <div className="w-full mt-10 grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                   <div className="text-center">
                      <div className="text-[8px] font-black text-slate-500 uppercase mb-1">E-Fund</div>
                      <div className="text-sm font-black text-indigo-400">{healthData.metrics.emergencyFund}%</div>
                   </div>
                   <div className="text-center border-x border-white/5">
                      <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Debt-Ratio</div>
                      <div className="text-sm font-black text-emerald-400">{healthData.metrics.debtRatio}%</div>
                   </div>
                   <div className="text-center">
                      <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Diversify</div>
                      <div className="text-sm font-black text-amber-400">{healthData.metrics.diversification}%</div>
                   </div>
                </div>
              )}

              <div className="mt-8 text-center space-y-2">
                <h4 className="text-2xl font-black text-white leading-tight">{healthData?.verdict || "Analyzing Data..."}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Recommendations</span>
                </div>
              </div>
              
              <div className="mt-8 space-y-4 w-full">
                {healthData?.insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                    <div className={`w-10 h-10 rounded-2xl ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 border border-white/5`}>
                      <i className={`fas ${idx === 0 ? 'fa-bolt-lightning' : idx === 1 ? 'fa-bullseye' : 'fa-chart-network'} text-sm`}></i>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                      {insight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-indigo-600 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <i className="fas fa-chess-king text-[12rem]"></i>
            </div>
            <div className="relative z-10 max-w-lg">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4 flex items-center gap-2">
                <i className="fas fa-compass-drafting"></i> Wealth Projection Lab
              </div>
              <h3 className="text-4xl font-black mb-10 leading-tight">Master the long game. <br/> Deploy your capital.</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onTabChange('simulator')} className="bg-white text-indigo-900 p-6 rounded-3xl flex flex-col gap-3 hover:bg-indigo-50 transition-all text-left shadow-lg group">
                  <i className="fas fa-rocket text-xl text-indigo-600 group-hover:translate-y-[-2px] transition-transform"></i>
                  <div>
                    <span className="font-black text-xs uppercase tracking-widest block">Trajectory</span>
                    <span className="text-[10px] font-bold opacity-50">30-Year Wealth Forecast</span>
                  </div>
                </button>
                <button onClick={() => onTabChange('advisor')} className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-3xl flex flex-col gap-3 hover:bg-white/20 transition-all text-left group">
                  <i className="fas fa-messages text-xl text-white"></i>
                  <div>
                    <span className="font-black text-xs uppercase tracking-widest block">Finny AI</span>
                    <span className="text-[10px] font-bold text-indigo-100">Direct Financial Guidance</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onTabChange('tax')}>
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  <i className="fas fa-landmark-flag"></i>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Efficiency</h4>
                   <p className="text-xs text-slate-600 font-bold leading-relaxed">Optimization algorithms identified 2 new tax deductions and a potential harvesting candidate.</p>
                </div>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onTabChange('portfolio')}>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  <i className="fas fa-leaf"></i>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Signal</h4>
                   <p className="text-xs text-slate-600 font-bold leading-relaxed">System identified tax-advantaged contribution room. Target extra $250/mo for long-term compounding.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 h-full flex flex-col">
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-10 flex justify-between items-center">
            Economic Intelligence
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
          </h3>
          
          <div className="space-y-12 flex-1">
             <div className="relative pl-8 border-l-2 border-slate-50">
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Liquidity Priority</div>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed">Maintain high liquidity for tactical opportunities but minimize long-term cash holding.</p>
             </div>
             <div className="relative pl-8 border-l-2 border-slate-50">
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Compounding Streak</div>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed">Consistency more than Quantity. Your current streak of monthly deposits is accelerating your wealth path.</p>
             </div>
             <div className="relative pl-8 border-l-2 border-slate-50">
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-200"></div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Macro Hedge</div>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed">Watch global rate trends. Adjust bond exposure if yielding becomes less competitive.</p>
             </div>
          </div>

          <div className="mt-auto pt-10">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">
                  "Wealth is what you don't see. It's the cars not purchased, the diamonds not bought, the watches not worn."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
