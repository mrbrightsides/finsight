
import React, { useState, useEffect } from 'react';
import { getMarketPulse } from '../services/geminiService';
import { GroundingSource } from '../types';

const PULSE_CATEGORIES = [
  { id: 'macro', label: 'Macro Outlook', icon: 'fa-earth-americas', query: 'Global economic trends and inflation outlook 2026' },
  { id: 'jobs', label: 'Job Market', icon: 'fa-briefcase', query: 'State of the labor market and remote work trends' },
  { id: 'housing', label: 'Housing', icon: 'fa-house-user', query: 'Real estate market trends and mortgage rates' },
  { id: 'tech', label: 'FinTech & Crypto', icon: 'fa-microchip', query: 'Latest trends in financial technology and digital assets' },
];

export const MarketPulse: React.FC = () => {
  const [pulse, setPulse] = useState('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('macro');

  const fetchPulse = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const data = await getMarketPulse(searchQuery);
      setPulse(data.text || '');
      setSources(data.sources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cat = PULSE_CATEGORIES.find(c => c.id === activeCategory);
    if (cat) fetchPulse(cat.query);
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setActiveCategory('');
      fetchPulse(query);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <i className="fas fa-satellite-dish"></i> Real-time Grounding
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Feed</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Verified economic insights powered by Google Search grounding.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Query economic trends..."
            />
          </div>
          <button 
            type="submit"
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            Go
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {PULSE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${
              activeCategory === cat.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <i className={`fas ${cat.icon}`}></i>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed Content */}
        <div className="lg:col-span-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Decrypting Market Signal</p>
                  <p className="text-slate-400 text-xs mt-1">Sourcing verified economic data...</p>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-600 font-medium">
                    {pulse.split('\n').map((para, i) => {
                       if (para.startsWith('1.') || para.startsWith('2.') || para.startsWith('3.') || para.startsWith('4.')) {
                         return <h4 key={i} className="text-slate-900 font-black mt-8 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                           <span className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center text-[10px]">{para[0]}</span>
                           {para.substring(2)}
                         </h4>;
                       }
                       if (para.startsWith('-')) {
                         return <div key={i} className="flex gap-3 mb-2 ml-4">
                           <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full mt-2 shrink-0"></div>
                           <p className="text-sm">{para.substring(1).trim()}</p>
                         </div>;
                       }
                       return <p key={i} className="mb-4 text-sm leading-7">{para}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <i className="fas fa-shield-check text-8xl"></i>
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 text-emerald-400">
              <i className="fas fa-link"></i> Verified Intelligence
            </h3>
            <div className="space-y-4 relative z-10">
              {sources.length > 0 ? sources.map((s, i) => (
                <a 
                  key={i} 
                  href={s.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="font-bold text-xs mb-1 truncate text-indigo-100">{s.title || 'Market Brief'}</div>
                  <div className="opacity-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                    <i className="fas fa-globe"></i>
                    {new URL(s.uri).hostname.replace('www.', '')}
                  </div>
                </a>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <i className="fas fa-radar text-4xl mb-4"></i>
                  <p className="text-[10px] font-bold uppercase">No external links found</p>
                </div>
              )}
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
               <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                 <p className="text-[10px] text-amber-200 leading-relaxed font-medium">
                   <span className="font-black text-amber-400">NOTE:</span> Insights are grounded using Gemini & Google Search. Always verify critical decisions with a professional.
                 </p>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-6">Trending Topics</h3>
             <div className="flex flex-wrap gap-2">
                {['CPI Data', 'FED Rates', 'BTC Halving', 'Job Growth', 'S&P 500', 'Energy Prices'].map(topic => (
                  <button 
                    key={topic} 
                    onClick={() => setQuery(topic)}
                    className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    #{topic}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
