
import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { analyzeWealthPath } from '../services/geminiService';
import { UserProfile, LifeEvent } from '../types';

interface WealthSimulatorProps {
  profile: UserProfile;
  onUpdateReturn: (newRate: number) => void;
}

const SHOCK_PRESETS = [
  { id: 'none', label: 'Steady Growth', rateMod: 0, infMod: 0, icon: 'fa-sun', color: 'bg-indigo-50 text-indigo-600' },
  { id: '2008', label: 'Market Crash', rateMod: -15, infMod: 0, icon: 'fa-bolt', color: 'bg-rose-50 text-rose-600' },
  { id: 'boom', label: 'Tech Boom', rateMod: 10, infMod: 2, icon: 'fa-rocket', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'stag', label: 'Stagflation', rateMod: -2, infMod: 6, icon: 'fa-cloud-showers-heavy', color: 'bg-amber-50 text-amber-600' },
];

export const WealthSimulator: React.FC<WealthSimulatorProps> = ({ profile, onUpdateReturn }) => {
  const [initial, setInitial] = useState(profile.totalBalance);
  const [monthly, setMonthly] = useState(profile.monthlySavings);
  const [rate, setRate] = useState(profile.expectedReturn);
  const [years, setYears] = useState(30);
  const [inflation, setInflation] = useState(3);
  const [taxDrag, setTaxDrag] = useState(15);
  const [activeShock, setActiveShock] = useState('none');
  const [verdict, setVerdict] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Life Events state
  const [events, setEvents] = useState<LifeEvent[]>(profile.lifeEvents || []);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<LifeEvent>>({ name: '', year: 5, oneTimeImpact: 0, monthlyImpact: 0 });

  useEffect(() => {
    setInitial(profile.totalBalance);
    setMonthly(profile.monthlySavings);
    setRate(profile.expectedReturn);
    setEvents(profile.lifeEvents || []);
  }, [profile]);

  const shockData = useMemo(() => SHOCK_PRESETS.find(s => s.id === activeShock) || SHOCK_PRESETS[0], [activeShock]);

  const data = useMemo(() => {
    let results = [];
    let currentBalance = initial;
    let currentInflationAdjusted = initial;
    let runningMonthlySavings = monthly;
    
    const effectiveRate = rate + shockData.rateMod;
    const effectiveInflation = inflation + shockData.infMod;

    for (let year = 0; year <= years; year++) {
      // Check for life events this year
      const yearEvents = events.filter(e => e.year === year);
      yearEvents.forEach(e => {
        currentBalance += e.oneTimeImpact;
        currentInflationAdjusted += e.oneTimeImpact;
        runningMonthlySavings += e.monthlyImpact;
      });

      results.push({
        year,
        balance: Math.max(0, Math.round(currentBalance)),
        inflationAdjusted: Math.max(0, Math.round(currentInflationAdjusted)),
        hasEvent: yearEvents.length > 0,
        eventNames: yearEvents.map(e => e.name).join(', ')
      });
      
      for (let month = 0; month < 12; month++) {
        const yRate = year < 3 ? effectiveRate : rate;
        const yInf = year < 3 ? effectiveInflation : inflation;

        const growth = currentBalance * (yRate / 100 / 12);
        const netGrowth = growth * (1 - (taxDrag / 100));
        
        currentBalance = (currentBalance + runningMonthlySavings) + netGrowth;
        currentInflationAdjusted = (currentInflationAdjusted + runningMonthlySavings) * (1 + ((yRate - yInf) / 100) / 12);
      }
    }
    return results;
  }, [initial, monthly, rate, years, inflation, taxDrag, shockData, events]);

  const handleAddEvent = () => {
    if (!newEvent.name) return;
    const event: LifeEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEvent.name,
      year: newEvent.year || 1,
      oneTimeImpact: newEvent.oneTimeImpact || 0,
      monthlyImpact: newEvent.monthlyImpact || 0
    };
    setEvents(prev => [...prev, event]);
    setNewEvent({ name: '', year: 5, oneTimeImpact: 0, monthlyImpact: 0 });
    setShowEventForm(false);
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const summary = `Initial $${initial}, Monthly $${monthly}, ${rate}% growth. Scenario: ${shockData.label}. Events: ${events.map(e => `${e.name} in Yr ${e.year}`).join(', ')}. Final wealth: $${data[data.length-1].balance.toLocaleString()}. Explain how life milestones changed the trajectory.`;
      const res = await analyzeWealthPath(summary);
      setVerdict(res || "Analysis unavailable.");
    } catch (err) {
      setVerdict("Failed to connect to AI for analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <i className="fas fa-microscope"></i> Future Engineering
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Wealth Path Studio</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Model 30 years of life events and purchasing power.</p>
        </div>
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl text-right shrink-0">
             <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Year {years} Net Outcome</span>
             <div className="text-5xl font-black mt-1 text-indigo-400">
               ${data[data.length - 1].balance.toLocaleString()}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest border-b border-slate-50 pb-4">Simulation Parameters</h3>
            <div className="space-y-6">
               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Monthly Contribution ($)</label>
                <input 
                  type="number" value={monthly} 
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Base Return: {rate}%</label>
                <input 
                  type="range" min="1" max="15" step="0.1" 
                  value={rate} onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Inflation Rate: {inflation}%</label>
                <input 
                  type="range" min="0" max="10" step="0.5" 
                  value={inflation} onChange={(e) => setInflation(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Life Events Panel */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Life Milestones</h3>
              <button 
                onClick={() => setShowEventForm(!showEventForm)}
                className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
              >
                <i className={`fas ${showEventForm ? 'fa-times' : 'fa-plus'} text-xs`}></i>
              </button>
            </div>

            {showEventForm && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 animate-fadeIn">
                <input 
                  placeholder="Event Name (e.g. Wedding)" 
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Year of Event</label>
                    <input type="number" value={newEvent.year} onChange={e => setNewEvent({...newEvent, year: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Impact ($)</label>
                    <input type="number" placeholder="-50000" value={newEvent.oneTimeImpact} onChange={e => setNewEvent({...newEvent, oneTimeImpact: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                  </div>
                </div>
                <div>
                   <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Monthly Flow Delta ($)</label>
                   <input type="number" placeholder="+500" value={newEvent.monthlyImpact} onChange={e => setNewEvent({...newEvent, monthlyImpact: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                </div>
                <button onClick={handleAddEvent} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700">Add Milestone</button>
              </div>
            )}

            <div className="space-y-3">
               {events.map(e => (
                 <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div>
                       <div className="text-[10px] font-black text-slate-900">{e.name} <span className="text-indigo-600 ml-1">Yr {e.year}</span></div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase">Impact: ${e.oneTimeImpact.toLocaleString()} / Delta: ${e.monthlyImpact}/mo</div>
                    </div>
                    <button onClick={() => removeEvent(e.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                       <i className="fas fa-times-circle"></i>
                    </button>
                 </div>
               ))}
               {events.length === 0 && !showEventForm && (
                 <p className="text-[10px] text-center text-slate-400 font-bold uppercase py-4">No life events added</p>
               )}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Macro Events</h3>
            <div className="grid grid-cols-2 gap-3">
               {SHOCK_PRESETS.map(s => (
                 <button
                    key={s.id}
                    onClick={() => setActiveShock(s.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-2 ${
                      activeShock === s.id ? `${s.color} border-current scale-95 shadow-inner` : 'bg-slate-50 border-transparent text-slate-300 hover:bg-slate-100'
                    }`}
                 >
                   <i className={`fas ${s.icon} text-2xl`}></i>
                   <span className="text-[9px] font-black uppercase text-center">{s.label}</span>
                 </button>
               ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-center">
               <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                 {isAnalyzing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-brain"></i>}
                 AI Strategy Lab
               </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-full min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <div>
                 <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">Growth Vector Analysis</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Life milestones integrated into capital path</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">Nominal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">Purchasing Power</span>
                  </div>
               </div>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="vectorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '20px' }}
                    itemStyle={{ fontWeight: 'black' }}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={6} fill="url(#vectorGradient)" animationDuration={1000} />
                  <Area type="monotone" dataKey="inflationAdjusted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 6" fill="none" />
                  
                  {events.map((e, idx) => (
                    <ReferenceLine 
                      key={e.id} 
                      x={e.year} 
                      stroke="#4f46e5" 
                      strokeWidth={2} 
                      strokeDasharray="3 3"
                      label={{ 
                        position: 'top', 
                        value: e.name, 
                        fill: '#4f46e5', 
                        fontSize: 9, 
                        fontWeight: 'black', 
                        className: 'uppercase tracking-widest'
                      }} 
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {verdict && (
              <div className="mt-10 p-8 bg-slate-900 rounded-[2rem] text-white animate-fadeIn border-l-8 border-indigo-500">
                <p className="text-sm leading-relaxed font-medium italic text-slate-300">"{verdict}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
