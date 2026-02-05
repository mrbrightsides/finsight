
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, Asset } from '../types';
import { analyzeTaxImpact } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface TaxArchitectProps {
  profile: UserProfile;
}

interface TaxAnalysis {
  score: number;
  verdict: string;
  tips: string[];
  bucketAllocation: {
    taxable: number;
    deferred: number;
    exempt: number;
  };
  deductions: { name: string; reason: string }[];
  harvestingStrategy: string;
  locationOptimization: string;
  conceptExplanation: string;
  conceptName: string;
}

export const TaxArchitect: React.FC<TaxArchitectProps> = ({ profile }) => {
  const [analysis, setAnalysis] = useState<TaxAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setRateLimitError(false);
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await analyzeTaxImpact(profile);
      if (res) setAnalysis(res);
    } catch (e: any) {
      console.error("Tax Analysis AI Error:", e);
      if (e?.message?.includes('429') || e?.status === 429) {
        setRateLimitError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const annualIncome = profile.monthlyIncome * 12;
  
  const estimatedTax = useMemo(() => {
    if (annualIncome < 11000) return annualIncome * 0.10;
    if (annualIncome < 44725) return 1100 + (annualIncome - 11000) * 0.12;
    if (annualIncome < 95375) return 5147 + (annualIncome - 44725) * 0.22;
    return 16290 + (annualIncome - 95375) * 0.24;
  }, [annualIncome]);

  const bucketData = useMemo(() => {
    if (!analysis) return [];
    return [
      { name: 'Taxable', value: analysis.bucketAllocation.taxable, color: '#f43f5e', icon: 'fa-box' },
      { name: 'Deferred', value: analysis.bucketAllocation.deferred, color: '#6366f1', icon: 'fa-clock' },
      { name: 'Exempt', value: analysis.bucketAllocation.exempt, color: '#10b981', icon: 'fa-shield-halved' },
    ];
  }, [analysis]);

  const harvestingCandidates = useMemo(() => {
    return profile.assets.filter(a => 
      a.type === 'stock' && a.purchasePrice && a.balance < (a.purchasePrice * (a.quantity || 1))
    ).map(a => {
      const totalCost = (a.purchasePrice || 0) * (a.quantity || 1);
      const loss = totalCost - a.balance;
      return { ...a, unrealizedLoss: loss };
    });
  }, [profile.assets]);

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <i className="fas fa-landmark-flag"></i> Fiscal Integrity Unit
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tax Architect</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Strategic asset location and deduction engineering.</p>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-8 shrink-0">
           <div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Efficiency Score</div>
             <div className={`text-4xl font-black ${analysis?.score && analysis.score > 70 ? 'text-emerald-500' : 'text-indigo-600'}`}>
               {analysis?.score || '--'}%
             </div>
           </div>
           <div className="w-px h-10 bg-slate-100"></div>
           <div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Est. Burden</div>
             <div className="text-4xl font-black text-slate-900">${Math.round(estimatedTax).toLocaleString()}</div>
           </div>
        </div>
      </header>

      {/* Tax Bucket Allocation Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 opacity-30"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">Tax Bucket Allocation</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Classification of your entire capital pool</p>
            </div>
            <div className="flex gap-4">
               {bucketData.map(b => (
                 <div key={b.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }}></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase">{b.name}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {bucketData.map(bucket => (
              <div key={bucket.name} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: `${bucket.color}15`, color: bucket.color }}>
                  <i className={`fas ${bucket.icon} text-xl`}></i>
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{bucket.name}</h4>
                <div className="text-3xl font-black text-slate-900">${bucket.value.toLocaleString()}</div>
                <div className="mt-4 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full transition-all duration-1000" style={{ backgroundColor: bucket.color, width: `${(bucket.value / profile.totalBalance) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row gap-8 items-center group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500"></div>
             <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-2xl text-indigo-400 shadow-2xl shrink-0">
               <i className="fas fa-arrows-split-up-and-left"></i>
             </div>
             <div>
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Location Optimization Insights</h4>
               <p className="text-base font-medium leading-relaxed italic text-slate-300">
                 "{analysis?.locationOptimization || "Analyzing asset positioning for maximum tax-deferral and capital preservation..."}"
               </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl space-y-8 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform">
             <i className="fas fa-brain text-9xl"></i>
           </div>
           
           <div className="relative z-10 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-200">Neural Fiscal Verdict</h3>
              <div>
                <h4 className="text-3xl font-black mb-4 leading-tight">{analysis?.verdict || "Calculating..."}</h4>
                <div className="space-y-4">
                   {analysis?.tips.slice(0, 3).map((tip, i) => (
                     <div key={i} className="flex gap-4 text-sm font-medium text-indigo-100 leading-relaxed">
                        <i className="fas fa-bolt-lightning text-emerald-400 mt-1"></i>
                        {tip}
                     </div>
                   ))}
                </div>
              </div>
           </div>

           <div className="relative z-10 pt-8 border-t border-white/10">
              <p className="text-[10px] font-bold text-indigo-200 uppercase leading-relaxed italic">
                 "Consistent rebalancing into tax-exempt vehicles (HSAs/Roth) can increase 30-year terminal wealth by up to 14%."
              </p>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-xl">
              <i className="fas fa-scissors"></i>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Tax-Loss Harvesting Lab</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified Portfolio Inefficiencies</p>
            </div>
          </div>

          <div className="space-y-6">
            {harvestingCandidates.length > 0 ? (
              harvestingCandidates.map((asset, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all">
                  <div>
                    <h5 className="font-black text-slate-900">{asset.name}</h5>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Cost: ${(asset.purchasePrice! * (asset.quantity || 1)).toLocaleString()}</span>
                      <span className="text-[9px] font-black text-rose-500 uppercase">Current: ${asset.balance.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-rose-600">-${asset.unrealizedLoss.toLocaleString()}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unrealized Loss</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                <i className="fas fa-check-circle text-3xl text-emerald-100 mb-4"></i>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No immediate harvesting targets. <br/> (Ensure Cost Basis is set in Account)</p>
              </div>
            )}
          </div>

          <div className="bg-rose-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <i className="fas fa-brain text-7xl"></i>
             </div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">AI Harvesting Strategy</h4>
             <p className="text-sm font-medium leading-relaxed italic">
               {analysis?.harvestingStrategy || "Analyze your portfolio to unlock tax-loss harvesting recommendations and wash-sale safety guidelines."}
             </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
              <i className="fas fa-hand-holding-dollar"></i>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Deduction Opportunities</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile-Based Potential Savings</p>
            </div>
          </div>
          
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis?.deductions.map((deduction, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <i className="fas fa-plus text-[10px]"></i>
                     </div>
                     <h5 className="font-black text-slate-900 text-[11px] uppercase tracking-tighter">{deduction.name}</h5>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                    "{deduction.reason}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
