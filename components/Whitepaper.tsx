
import React from 'react';

interface WhitepaperProps {
  onClose: () => void;
}

export const Whitepaper: React.FC<WhitepaperProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 font-serif">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center font-sans">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-file-invoice"></i>
          </div>
          <span className="font-black text-sm uppercase tracking-tighter">Technical Brief 2026.1</span>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2"
        >
          Exit Document <i className="fas fa-times"></i>
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-20">
        {/* Title Header */}
        <header className="mb-20 text-center font-sans">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
            Official Submission: Hackonomics 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
            FinSight AI: <br />
            <span className="text-slate-400">Engineering Fiscal Resilience</span>
          </h1>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Author: Intelligence Syndicate</span>
            <span className="hidden md:inline">•</span>
            <span>Date: Q1 2026</span>
            <span className="hidden md:inline">•</span>
            <span>Status: Production V1.0</span>
          </div>
        </header>

        {/* Abstract */}
        <section className="mb-24 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 italic text-xl leading-relaxed text-slate-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none font-sans font-black">ABSTRACT</div>
          "As global economic structures transition toward decentralized intelligence and hyper-volatility, the traditional tools for financial literacy have become obsolete. FinSight AI introduces a recursive, AI-driven architectural hub designed to bridge the gap between complex economic theory and personal wealth management through real-time grounding and historical stress-testing."
        </section>

        {/* Sections */}
        <div className="space-y-24">
          {/* Section 1 */}
          <section>
            <h2 className="font-sans text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">01. The Hackonomics Mission</h2>
            <div className="prose prose-slate max-w-none prose-lg text-slate-700 leading-relaxed">
              <p>
                Hackonomics 2026 is founded on a singular premise: <strong>economic literacy is a survival skill.</strong> In an era where algorithmic trading and digital assets define the baseline of financial participation, individuals require more than static spreadsheets—they require intelligence agents.
              </p>
              <p>
                FinSight AI transforms the user from a passive observer into a <strong>Strategic Wealth Architect</strong>. By fusing Finance, Economics, and Computer Science, we provide a playground where consequences are simulated before they are realized.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-sans text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">02. Technical Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="font-sans font-black text-sm uppercase mb-4 text-slate-900">Neural Core</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Powered by the <strong>Google Gemini 3-Pro-Preview</strong> and <strong>Flash-Lite</strong> models, the engine performs recursive analysis of user-defined assets. Every recommendation is grounded in live market data via the Google Search toolset, ensuring that advice is not just theoretical but current.
                </p>
              </div>
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="font-sans font-black text-sm uppercase mb-4 text-slate-900">Temporal Stress-Testing</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The <strong>Economic Time Machine</strong> utilizes high-dimensional historical embeddings to simulate how modern portfolios would interact with historical shocks, such as the 1929 Great Depression or the 2008 Subprime Collapse.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-50"></div>
            <h2 className="relative z-10 font-sans text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-12">03. The Strategic Pillars</h2>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="text-2xl font-black font-sans">Predictive</div>
                <p className="text-sm text-slate-400 leading-relaxed">Wealth Path Studio models 30 years of tax-aware growth, adjusting for purchasing power erosion (inflation).</p>
              </div>
              <div className="space-y-4">
                <div className="text-2xl font-black font-sans">Defensive</div>
                <p className="text-sm text-slate-400 leading-relaxed">The Fiscal Integrity Unit automates tax-loss harvesting and bond sensitivity analysis to protect capital.</p>
              </div>
              <div className="space-y-4">
                <div className="text-2xl font-black font-sans">Decentralized</div>
                <p className="text-sm text-slate-400 leading-relaxed">The DeFi Explorer simulates on-chain yields, allowing users to safely navigate the frontier of finance.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-sans text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">04. Conclusion & Future Vectors</h2>
            <div className="prose prose-slate max-w-none prose-lg text-slate-700 leading-relaxed">
              <p>
                FinSight AI is not a broker; it is a <strong>Cognitive Amplifier</strong> for the economic mind. As we move further into 2026, the engine will evolve to include multi-agent simulations where users can compete in "Learning Combat" within the Knowledge Arena, fostering a community of enlightened strategists.
              </p>
              <p className="font-bold text-slate-900">
                The future of wealth is not in the accumulation of currency, but in the perfection of strategy.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Signature */}
        <footer className="mt-32 pt-12 border-t border-slate-100 text-center font-sans">
          <div className="flex items-center justify-center gap-2 mb-4">
            <i className="fas fa-stamp text-slate-200 text-4xl"></i>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Validated for Public Disclosure • V.1.0.0
          </p>
        </footer>
      </div>
    </div>
  );
};
