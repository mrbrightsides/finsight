
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile } from '../types';
import { analyzeBondStrategy, getBondConceptExplanation } from '../services/geminiService';

interface BondLabProps {
  profile: UserProfile;
}

interface BondAnalysis {
  analogy: string;
  riskRating: string;
  tips: string[];
  recommendation: string;
  durationImpact: string;
}

const GLOSSARY_TERMS = [
  { 
    id: 'duration', 
    label: 'Duration', 
    icon: 'fa-hourglass-half', 
    color: 'text-amber-500',
    analogy: 'The Seesaw Length: A longer board (higher duration) makes the price swing much more violently for every tiny move in interest rates.'
  },
  { 
    id: 'convexity', 
    label: 'Convexity', 
    icon: 'fa-chart-area', 
    color: 'text-indigo-500',
    analogy: 'The Flexible Buffer: A safety curve that helps bond prices go up MORE when rates fall than they go down when rates rise.'
  },
  { 
    id: 'credit_spread', 
    label: 'Credit Spread', 
    icon: 'fa-arrows-left-right', 
    color: 'text-rose-500',
    analogy: 'The Worry Tax: The extra interest a company pays over the "safe" government rate to make the risk of default worth it for you.'
  },
  { 
    id: 'ytm', 
    label: 'Yield to Maturity', 
    icon: 'fa-flag-checkered', 
    color: 'text-emerald-500',
    analogy: 'The Total Road Trip: The total "miles per gallon" you get for the entire life of the bond, including interest and the final price payout.'
  },
  { 
    id: 'call_provision', 
    label: 'Call Provision', 
    icon: 'fa-phone-volume', 
    color: 'text-purple-500',
    analogy: 'The "Take Back" Clause: Like a library that can ask for its book back early if they find a better way to use it, companies can end the bond early.'
  },
  { 
    id: 'accrued_interest', 
    label: 'Accrued Interest', 
    icon: 'fa-stopwatch-20', 
    color: 'text-sky-500',
    analogy: 'The Wait-Time Tip: If you buy a bond midway between payments, you owe the previous owner for the time they spent waiting for that interest.'
  },
];

export const BondLab: React.FC<BondLabProps> = ({ profile }) => {
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(5);
  const [marketRate, setMarketRate] = useState(5);
  const [maturity, setMaturity] = useState(10);
  const [analysis, setAnalysis] = useState<BondAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  // Concept state for deep dives
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [conceptExpl, setConceptExpl] = useState<string | null>(null);
  const [isConceptLoading, setIsConceptLoading] = useState(false);

  // Bond Price Calculation: Price = [C * (1 - (1+r)^-n) / r] + [F / (1+r)^n]
  const currentPrice = useMemo(() => {
    const r = marketRate / 100;
    const C = (couponRate / 100) * faceValue;
    const n = maturity;
    const f = faceValue;

    if (r === 0) return C * n + f;
    const price = (C * (1 - Math.pow(1 + r, -n))) / r + f / Math.pow(1 + r, n);
    return Math.round(price * 100) / 100;
  }, [faceValue, couponRate, marketRate, maturity]);

  const yieldMetrics = useMemo(() => {
    const annualCoupon = (couponRate / 100) * faceValue;
    const totalCouponPayments = annualCoupon * maturity;
    const capitalGainLoss = faceValue - currentPrice;
    const totalReturn = totalCouponPayments + capitalGainLoss;
    
    const ytmNumerator = annualCoupon + (capitalGainLoss / maturity);
    const ytmDenominator = (faceValue + currentPrice) / 2;
    const ytm = (ytmNumerator / ytmDenominator) * 100;

    return {
      annualCoupon,
      totalCouponPayments,
      capitalGainLoss,
      totalReturn,
      ytm: Math.round(ytm * 100) / 100
    };
  }, [faceValue, couponRate, maturity, currentPrice]);

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setRateLimitError(false);
    try {
      const bondData = { faceValue, couponRate, marketRate, maturity, currentPrice, ...yieldMetrics };
      const res = await analyzeBondStrategy(profile, bondData);
      setAnalysis(res);
    } catch (e: any) {
      console.error("Bond AI error:", e);
      if (e?.message?.includes('429') || e?.status === 429) setRateLimitError(true);
    } finally {
      setIsLoading(false);
    }
  }, [profile, faceValue, couponRate, marketRate, maturity, currentPrice, yieldMetrics]);

  const fetchConcept = async (conceptId: string) => {
    if (selectedConcept === conceptId && conceptExpl) return;
    setIsConceptLoading(true);
    setSelectedConcept(conceptId);
    try {
      const label = GLOSSARY_TERMS.find(c => c.id === conceptId)?.label || conceptId;
      const res = await getBondConceptExplanation(label);
      setConceptExpl(res || "Definition unavailable.");
    } catch (e) {
      setConceptExpl("System node timed out. Try again shortly.");
    } finally {
      setIsConceptLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <i className="fas fa-building-columns"></i> Fixed Income Lab
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Bond Architect</h2>
          <p className="text-slate-500 mt-4 text-lg font-medium">Engineer and stress-test fixed income instruments against shifting macro yield curves.</p>
        </div>
        
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shrink-0 group border border-indigo-500/20">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Theoretical Market Value</div>
           <div className="text-5xl font-black text-indigo-400">
             ${currentPrice.toLocaleString()}
           </div>
           <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
             {currentPrice > faceValue ? 'Trading at Premium' : currentPrice < faceValue ? 'Trading at Discount' : 'Trading at Par'}
           </div>
        </div>
      </header>

      {/* Expanded Glossary Section */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none">
           <i className="fas fa-book-open"></i>
         </div>
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Bond Fundamentals Glossary</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GLOSSARY_TERMS.map(c => (
              <div key={c.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-4">
                   <div className={`w-10 h-10 rounded-xl bg-white shadow-sm ${c.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                     <i className={`fas ${c.icon}`}></i>
                   </div>
                   <h4 className="font-black text-slate-900">{c.label}</h4>
                 </div>
                 <p className="text-xs font-medium text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-4 italic group-hover:text-slate-700 transition-colors">
                    {c.analogy}
                 </p>
                 <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                    <i className={`fas ${c.icon} text-6xl`}></i>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest border-b border-slate-50 pb-4">Bond Parameters</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Face Value ($)</label>
                  <input type="number" value={faceValue} onChange={(e) => setFaceValue(Number(e.target.value))} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Coupon Rate: {couponRate}%</label>
                  <input type="range" min="0" max="15" step="0.1" value={couponRate} onChange={(e) => setCouponRate(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Maturity: {maturity} Years</label>
                  <input type="range" min="1" max="30" value={maturity} onChange={(e) => setMaturity(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
           </div>

           <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <i className="fas fa-gauge-high text-7xl"></i>
              </div>
              <h3 className="font-black text-xs uppercase tracking-widest mb-4">Market Rate Sensitivity</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-indigo-200 uppercase mb-4 block">Current Market Yield: {marketRate}%</label>
                  <input type="range" min="0" max="15" step="0.1" value={marketRate} onChange={(e) => setMarketRate(Number(e.target.value))} className="w-full accent-white h-2 bg-indigo-500 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="p-6 bg-white/10 rounded-3xl border border-white/10 text-center">
                   <div className="text-[10px] font-black text-indigo-300 uppercase mb-1">Price Change</div>
                   <div className={`text-3xl font-black ${currentPrice >= faceValue ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {(((currentPrice - faceValue) / faceValue) * 100).toFixed(2)}%
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">AI Deep Technical Dive</h3>
              <div className="flex flex-wrap gap-2">
                 {GLOSSARY_TERMS.map(c => (
                   <button 
                     key={c.id} 
                     onClick={() => fetchConcept(c.id)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedConcept === c.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                   >
                     <i className={`fas ${c.icon} mr-1.5`}></i> {c.label}
                   </button>
                 ))}
              </div>
              {selectedConcept && (
                <div className="mt-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-fadeIn">
                   {isConceptLoading ? (
                     <div className="flex items-center gap-3 opacity-50">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase">Decrypting...</span>
                     </div>
                   ) : (
                     <p className="text-xs font-medium text-slate-600 leading-relaxed italic animate-fadeIn">
                       {conceptExpl}
                     </p>
                   )}
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-10 flex items-center gap-4">
                <span className="w-2 h-10 bg-indigo-600 rounded-full"></span>
                Yield & Projection Calculator
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Approx. Yield to Maturity (YTM)</h4>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-black text-indigo-600">{yieldMetrics.ytm}%</div>
                      <div className={`text-[10px] font-black uppercase ${yieldMetrics.ytm > couponRate ? 'text-emerald-500' : 'text-slate-400'}`}>
                         {yieldMetrics.ytm > couponRate ? 'Yield Advantage' : 'Par/Below Coupon'}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] font-medium text-slate-500 leading-relaxed italic">
                      YTM accounts for annual interest plus the capital gain or loss realized if held to maturity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Annual Interest</div>
                      <div className="text-xl font-black text-slate-900">${yieldMetrics.annualCoupon.toLocaleString()}</div>
                    </div>
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Coupons</div>
                      <div className="text-xl font-black text-slate-900">${yieldMetrics.totalCouponPayments.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-8 border-2 border-indigo-50 bg-indigo-50/20 rounded-[2.5rem] space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Returns Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-500">Total Interest Income</span>
                        <span className="text-slate-900">${yieldMetrics.totalCouponPayments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-500">{yieldMetrics.capitalGainLoss >= 0 ? 'Capital Gain' : 'Capital Loss'}</span>
                        <span className={yieldMetrics.capitalGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          ${Math.abs(yieldMetrics.capitalGainLoss).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-indigo-100 flex justify-between items-center text-lg font-black">
                        <span className="text-slate-900">Total Absolute Return</span>
                        <span className="text-indigo-600">${yieldMetrics.totalReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 text-white rounded-[2rem] flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <i className="fas fa-chart-line text-sm"></i>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase">Effective ROI</div>
                      <div className="text-lg font-black">{((yieldMetrics.totalReturn / currentPrice) * 100).toFixed(1)}% <span className="text-[10px] opacity-40 font-bold uppercase">Total period</span></div>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col min-h-[400px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full -mr-40 -mt-40 opacity-30 pointer-events-none"></div>
              
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-12 flex items-center gap-4 relative z-10">
                <i className="fas fa-brain-circuit text-indigo-600"></i>
                Fixed Income Strategy Report
              </h3>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative z-10">
                   <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consulting Global Debt Markets...</p>
                </div>
              ) : rateLimitError ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-2xl"><i className="fas fa-hourglass-half"></i></div>
                  <h4 className="font-black text-slate-900 text-lg">Market Node Congested</h4>
                  <button onClick={fetchAnalysis} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">Retry Lab Analysis</button>
                </div>
              ) : (
                <div className="relative z-10 space-y-12 animate-fadeIn">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-slate-900 rounded-[3rem] text-white border-l-8 border-indigo-500">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4">Teeter-Totter Analogy</h4>
                         <p className="text-base font-medium leading-relaxed italic text-slate-300">"{analysis?.analogy}"</p>
                      </div>
                      <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col justify-center">
                         <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Simulated Credit Risk</div>
                         <div className="text-6xl font-black text-slate-900">{analysis?.riskRating || 'AAA'}</div>
                         <div className="mt-4 text-[11px] font-bold text-slate-500 leading-relaxed uppercase">Institutional Grade Projection</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {analysis?.tips.map((tip, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                           <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 text-xs mb-3 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <i className="fas fa-lightbulb"></i>
                           </div>
                           <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{tip}"</p>
                        </div>
                      ))}
                   </div>

                   <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex items-center gap-8">
                      <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center text-2xl shadow-lg">
                        <i className="fas fa-compass-drafting"></i>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-1">Architectural Recommendation</h5>
                        <p className="text-lg font-black text-emerald-900">{analysis?.recommendation}</p>
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
