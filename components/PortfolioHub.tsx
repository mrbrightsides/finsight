
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getFinancialAdvice, getRebalanceSuggestions } from '../services/geminiService';
import { UserProfile, Asset } from '../types';

interface PortfolioHubProps {
  profile: UserProfile;
}

const CATEGORY_COLORS: Record<string, string> = {
  savings: '#f59e0b',
  stock: '#10b981',
  bond: '#3b82f6',
  real_estate: '#6366f1',
  crypto: '#8b5cf6',
  commodity: '#ec4899',
  debt: '#f43f5e',
};

interface RebalanceResult {
  rationale: string;
  suggestions: {
    from: string;
    to: string;
    amount: number;
    reason: string;
  }[];
}

export const PortfolioHub: React.FC<PortfolioHubProps> = ({ profile }) => {
  const [advice, setAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [rebalanceData, setRebalanceData] = useState<RebalanceResult | null>(null);
  const [isLoadingRebalance, setIsLoadingRebalance] = useState(false);

  const totalWorth = useMemo(() => {
    return profile.assets.reduce((acc, asset) => acc + asset.balance, 0);
  }, [profile.assets]);

  const allocationData = useMemo(() => {
    const groups: Record<string, number> = {};
    profile.assets.forEach(asset => {
      const val = Math.abs(asset.balance);
      if (val === 0) return;
      groups[asset.type] = (groups[asset.type] || 0) + val;
    });
    return Object.entries(groups).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value,
      type
    })).sort((a, b) => b.value - a.value);
  }, [profile.assets]);

  const handleGetAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const assetString = profile.assets.map(a => `${a.name}: $${a.balance} (${a.type})`).join(', ');
      const userContext = `Portfolio: ${assetString}. Worth: $${totalWorth}. Income: $${profile.monthlyIncome}. Provide a risk assessment and rebalancing strategy for 2026.`;
      const res = await getFinancialAdvice(userContext);
      setAdvice(res || "Advice unavailable.");
    } catch (err) {
      setAdvice("Failed to connect to financial AI.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const handleGetRebalance = async () => {
    setIsLoadingRebalance(true);
    setRebalanceData(null);
    try {
      const res = await getRebalanceSuggestions(profile);
      setRebalanceData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRebalance(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="flex-1 space-y-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aggregate Market Value</span>
                <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full">REAL-TIME</span>
              </div>
              <div className="text-6xl font-black text-slate-900 tracking-tight">${totalWorth.toLocaleString()}</div>
            </div>
            
            <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
              Your capital is deployed across <span className="text-slate-900 font-black">{profile.assets.length} institutional categories</span> with a projected yield of <span className="text-indigo-600 font-black">{profile.expectedReturn}%</span>.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button 
                onClick={handleGetAdvice}
                disabled={isLoadingAdvice}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3"
              >
                {isLoadingAdvice ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-microchip"></i>}
                Risk Assessment
              </button>
              <button 
                onClick={handleGetRebalance}
                disabled={isLoadingRebalance}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3"
              >
                {isLoadingRebalance ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-scale-balanced"></i>}
                AI Rebalance Suggestions
              </button>
            </div>
          </div>
          
          <div className="w-64 h-64 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.type] || '#cbd5e1'} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip 
                   formatter={(val: number) => `$${val.toLocaleString()}`}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Diversified</div>
                <div className="text-2xl font-black text-slate-800">{allocationData.length}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Sectors</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-indigo-700 p-10 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <i className="fas fa-bullseye text-9xl"></i>
           </div>
           <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <i className="fas fa-chess-knight"></i>
              Strategic Goals
           </h3>
           <div className="space-y-6 relative z-10">
              {profile.goals.length > 0 ? profile.goals.map((goal) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="truncate pr-2">{goal.name}</span>
                      <span className={progress >= 80 ? 'text-emerald-300' : 'text-indigo-200'}>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${progress >= 80 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {progress >= 80 && (
                      <div className="text-[8px] font-bold text-emerald-300 uppercase tracking-tighter flex items-center gap-1">
                        <i className="fas fa-shield-check"></i> Near Completion - Rebalancing Trigger Active
                      </div>
                    )}
                  </div>
                );
              }) : (
                <p className="text-xs opacity-50 italic">No goals defined in account.</p>
              )}
           </div>
        </div>
      </div>

      {advice && (
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-indigo-50 shadow-sm animate-fadeIn relative">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
                <i className="fas fa-shield-halved"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-900">CFO Risk Assessment Report</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis generated by Gemini Executive</p>
              </div>
            </div>
            <button onClick={() => setAdvice('')} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 hover:text-rose-500 transition-colors">
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
          <div className="prose prose-indigo max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium italic">
              {advice}
            </div>
          </div>
        </div>
      )}

      {rebalanceData && (
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <i className="fas fa-robot text-9xl"></i>
          </div>
          
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl">
                <i className="fas fa-wand-magic-sparkles"></i>
              </div>
              <div>
                <h4 className="font-black text-lg">AI Rebalance Strategy</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Tactical Realignment</p>
              </div>
            </div>
            <button onClick={() => setRebalanceData(null)} className="text-slate-500 hover:text-white transition-colors">
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-4">
               <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Strategic Rationale</h5>
               <p className="text-sm font-medium leading-relaxed italic opacity-80 border-l-2 border-indigo-500/30 pl-4">
                 "{rebalanceData.rationale}"
               </p>
            </div>
            <div className="lg:col-span-8 space-y-4">
               <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Actions</h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rebalanceData.suggestions.map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase">Move</span>
                             <span className="text-xs font-black">${s.amount.toLocaleString()}</span>
                          </div>
                          <i className="fas fa-arrow-right-long text-indigo-400 opacity-50"></i>
                       </div>
                       <div className="flex items-center gap-2 text-sm font-bold mb-3">
                          <span className="text-slate-400 line-clamp-1">{s.from}</span>
                          <i className="fas fa-chevron-right text-[10px] opacity-30"></i>
                          <span className="text-white line-clamp-1">{s.to}</span>
                       </div>
                       <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic group-hover:text-slate-300 transition-colors">
                         "{s.reason}"
                       </p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-8">
        <h3 className="text-2xl font-black text-slate-900 px-2 flex items-center gap-3">
          <i className="fas fa-vault text-indigo-600"></i>
          Asset Master List
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profile.assets.map((asset) => {
            const weight = ((Math.abs(asset.balance) / (totalWorth || 1)) * 100).toFixed(1);
            return (
              <div key={asset.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${asset.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform`}></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-16 h-16 ${asset.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${asset.icon}`}></i>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight</div>
                    <div className="text-xl font-black text-indigo-600">{weight}%</div>
                  </div>
                </div>

                <div className="space-y-1 mb-8 relative z-10">
                  <h5 className="font-black text-lg text-slate-900 truncate">{asset.name}</h5>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                      {asset.type.replace('_', ' ')}
                    </span>
                    {asset.ticker && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        {asset.ticker}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-slate-50 pt-6 relative z-10">
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valuation</div>
                    <div className={`text-3xl font-black ${asset.balance < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                      ${Math.abs(asset.balance).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                     {asset.type === 'stock' ? (
                        <div className="text-xs font-bold text-slate-500">{asset.quantity} Units</div>
                     ) : asset.interestRate ? (
                        <div className="text-xs font-black text-emerald-500">{asset.interestRate}% APY</div>
                     ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
