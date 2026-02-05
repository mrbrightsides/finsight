
import React from 'react';
import { EcosystemMap } from './EcosystemMap';
import { IntelligenceMatrix } from './IntelligenceMatrix';
import { AppTab } from '../types';

interface LandingPageProps {
  onStart: (initialTab?: AppTab) => void;
  onOpenWhitepaper: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenWhitepaper }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-coins text-xl"></i>
          </div>
          <span className="font-black text-2xl tracking-tighter">FinSight <span className="text-indigo-500">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Architecture</button>
          <button onClick={() => scrollToSection('simulations')} className="hover:text-white transition-colors">Simulations</button>
          <button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors">Security</button>
        </div>
        <button 
          onClick={() => onStart()}
          className="px-6 py-2.5 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95"
        >
          Access Terminal
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-fadeIn">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Hackonomics 2026 Engine Online
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-fadeIn">
          Master the <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Economics of 2026</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          The all-in-one intelligence hub for the modern economist. Fusing real-time grounding, recursive simulations, and neural financial advice.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => onStart()}
            className="group relative px-10 py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-500/20"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initialize Strategy Terminal <i className="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
          <button 
            onClick={onOpenWhitepaper}
            className="px-10 py-5 bg-slate-900 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all block text-center"
          >
            View Whitepaper
          </button>
        </div>

        {/* Interactive Intelligence Matrix (Replaces static visual) */}
        <div className="mt-24 relative animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full scale-75 opacity-50"></div>
          <IntelligenceMatrix onStartWithTab={(tab) => onStart(tab)} />
        </div>
      </main>

      {/* Feature Bento Grid */}
      <section id="features" className="relative z-10 px-8 py-32 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center mb-20">
          <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">Integrated Ecosystem</h2>
          <p className="text-4xl font-black tracking-tight mb-16">Everything you need to out-simulate the market.</p>
          
          <div className="max-w-5xl mx-auto mb-20">
            <EcosystemMap />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/30 transition-all group cursor-pointer" onClick={() => onStart(AppTab.ADVISOR)}>
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">
              <i className="fas fa-robot"></i>
            </div>
            <h3 className="text-xl font-black mb-4">Finny AI Advisor</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Personalized recursive advice that understands your specific asset structure and goals.</p>
          </div>
          {/* Card 2 */}
          <div id="simulations" className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 hover:border-emerald-500/30 transition-all group md:col-span-2 relative overflow-hidden scroll-mt-24 cursor-pointer" onClick={() => onStart(AppTab.TIMEMACHINE)}>
             <div className="absolute top-0 right-0 p-12 opacity-5 text-[12rem] pointer-events-none group-hover:scale-110 transition-transform">
                <i className="fas fa-hourglass-start"></i>
             </div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">
                  <i className="fas fa-clock-rotate-left"></i>
                </div>
                <h3 className="text-xl font-black mb-4">Economic Time Machine</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">Deploy your current portfolio into 1929, 2008, or 1637 and observe how your wealth survives history's greatest shocks.</p>
             </div>
          </div>
          {/* Card 3 */}
          <div id="security" className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 hover:border-purple-500/30 transition-all group md:col-span-2 relative overflow-hidden scroll-mt-24 cursor-pointer" onClick={() => onStart(AppTab.TAX)}>
             <div className="absolute top-0 right-0 p-12 opacity-5 text-[12rem] pointer-events-none group-hover:scale-110 transition-transform">
                <i className="fas fa-building-columns"></i>
             </div>
             <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">
                  <i className="fas fa-landmark-flag"></i>
                </div>
                <h3 className="text-xl font-black mb-4">Fiscal Integrity Unit</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">Automated Tax Architecting and Bond Price Simulation tools designed for institutional-grade portfolio management.</p>
             </div>
          </div>
          {/* Card 4 */}
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 hover:border-amber-500/30 transition-all group cursor-pointer" onClick={() => onStart(AppTab.DEFI)}>
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">
              <i className="fas fa-shield-virus"></i>
            </div>
            <h3 className="text-xl font-black mb-4">DeFi Explorer</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Simulate on-chain yields and recursive lending protocols without risking your capital.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 border-t border-slate-900 text-center">
        <div className="flex items-center justify-center gap-3 mb-8 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-coins"></i>
          </div>
          <span className="font-black text-lg tracking-tighter">FinSight AI</span>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-10">
          <a 
            href="https://github.com/mrbrightsides" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all group"
            title="GitHub Repository"
          >
            <i className="fab fa-github text-xl group-hover:scale-110 transition-transform"></i>
          </a>
          <a 
            href="https://rantai.elpeef.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 transition-all group"
            title="Intelligence Network"
          >
            <i className="fas fa-globe text-lg group-hover:scale-110 transition-transform"></i>
          </a>
        </div>

        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
          Built for Hackonomics 2026 • © 2026 Intelligence Syndicate
        </div>
      </footer>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
