
import React, { useState } from 'react';
import { simplifyConcept, generateScenario } from '../services/geminiService';

const PERSONAS = [
  { id: 'Cooking', name: 'The Master Chef', icon: 'fa-utensils', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { id: 'Video Games', name: 'The Pro Gamer', icon: 'fa-gamepad', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { id: 'Space Travel', name: 'The Astronaut', icon: 'fa-user-astronaut', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
  { id: 'Gardening', name: 'The Gardener', icon: 'fa-seedling', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'Sports', name: 'The Coach', icon: 'fa-whistle', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
];

const FUNDAMENTALS = [
  { name: 'Opportunity Cost', desc: 'The loss of potential gain from other alternatives.' },
  { name: 'Compound Interest', desc: 'Interest on interest, the key to long-term wealth.' },
  { name: 'Inflation', desc: 'The rate at which the general level of prices is rising.' },
  { name: 'Liquidity', desc: 'How easily an asset can be converted into cash.' },
  { name: 'Bear Market', desc: 'When prices fall and pessimism is high.' },
];

const PRESET_ANALOGIES = [
  {
    concept: 'Inflation',
    persona: 'Video Games',
    title: 'Gold Bloat & The XP Squish',
    text: "Imagine a glitch gives every player 1M gold. Shopkeepers raise the price of a Health Potion from 10 to 10,000 gold. You have more money, but you're not richer because your purchasing power has vanished.",
    icon: 'fa-gamepad',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    concept: 'Liquidity',
    persona: 'Cooking',
    title: 'The Melting Butter Principal',
    text: "Cash is like melted butter; it flows instantly and you can use it right now. Real estate is like a frozen steak; it's valuable, but you can't cook with it until you spend time thawing it out (selling it).",
    icon: 'fa-utensils',
    color: 'from-orange-400 to-rose-500'
  },
  {
    concept: 'Opportunity Cost',
    persona: 'Space Travel',
    title: 'Fuel Tank Trade-offs',
    text: "Every kg of fuel used for a luxury cabin is a kg of fuel NOT used for scientific sensors. Choosing one path in the stars means definitively NOT taking the other with the limited resources in your tank.",
    icon: 'fa-rocket',
    color: 'from-sky-400 to-indigo-500'
  }
];

export const ConceptLab: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('Cooking');
  const [explanation, setExplanation] = useState('');
  const [scenario, setScenario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);

  const handleSimplify = async () => {
    if (!concept) return;
    setIsLoading(true);
    setScenario('');
    try {
      const res = await simplifyConcept(concept, context);
      setExplanation(res || "Could not generate explanation.");
    } catch (err) {
      setExplanation("Error communicating with AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetScenario = async () => {
    if (!concept) return;
    setIsScenarioLoading(true);
    try {
      const res = await generateScenario(concept);
      setScenario(res || "Scenario unavailable.");
    } catch (err) {
      setScenario("Error generating scenario.");
    } finally {
      setIsScenarioLoading(false);
    }
  };

  const activePersona = PERSONAS.find(p => p.id === context) || PERSONAS[0];

  const loadPreset = (item: typeof PRESET_ANALOGIES[0]) => {
    setConcept(item.concept);
    setContext(item.persona);
    setExplanation(item.text);
    setScenario('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <i className="fas fa-flask"></i> Economic Alchemy
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Concept Lab</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Demystifying technical jargon with creative intelligence.</p>
        </div>
        <div className="flex -space-x-3">
          {PERSONAS.map(p => (
            <div key={p.id} className={`w-12 h-12 rounded-full border-4 border-white ${p.bg} flex items-center justify-center ${p.color} shadow-sm`} title={p.name}>
              <i className={`fas ${p.icon}`}></i>
            </div>
          ))}
          <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            +5
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Input Console */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Concept</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. Quantitative Easing" 
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  />
                  {concept && (
                    <button onClick={() => setConcept('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                      <i className="fas fa-times-circle"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Analogy Persona</label>
                <div className="grid grid-cols-5 gap-3">
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setContext(p.id)}
                      className={`h-14 rounded-2xl flex items-center justify-center transition-all ${
                        context === p.id 
                        ? `${p.bg} ${p.color} border-2 ${p.border} shadow-inner scale-95` 
                        : 'bg-slate-50 text-slate-300 border-2 border-transparent hover:bg-slate-100'
                      }`}
                      title={p.name}
                    >
                      <i className={`fas ${p.icon} text-xl`}></i>
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Selected: {activePersona.name}</span>
                </div>
              </div>

              <button 
                onClick={handleSimplify}
                disabled={isLoading || !concept}
                className={`w-full py-5 rounded-[2rem] font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isLoading || !concept ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-100'
                }`}
              >
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                Synthesize Analogy
              </button>
            </div>
          </div>

          {/* Quick Discover FUNDAMENTALS */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
             <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-400">
               <i className="fas fa-book-open"></i> Fundamentals
             </h3>
             <div className="space-y-6">
                {FUNDAMENTALS.map(item => (
                  <button 
                    key={item.name}
                    onClick={() => setConcept(item.name)}
                    className="w-full text-left group"
                  >
                    <div className="text-xs font-black group-hover:text-indigo-400 transition-colors">{item.name}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-1">{item.desc}</div>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Output Screen */}
        <div className="lg:col-span-8 space-y-8">
          {explanation ? (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px] animate-fadeIn">
              <div className="p-10 flex-1 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${activePersona.bg} ${activePersona.color} rounded-2xl flex items-center justify-center text-2xl`}>
                      <i className={`fas ${activePersona.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{concept}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastered through {activePersona.name}'s Lens</p>
                    </div>
                  </div>
                  <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400" onClick={() => navigator.clipboard.writeText(explanation)}>
                    <i className="fas fa-copy"></i>
                  </button>
                </div>

                <div className="prose prose-indigo max-w-none">
                   <p className="text-xl leading-relaxed text-slate-600 font-medium italic">
                     "{explanation}"
                   </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleGetScenario}
                    disabled={isScenarioLoading}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    {isScenarioLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-play"></i>}
                    Interactive Scenario
                  </button>
                  <button className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Deep Technical Dive
                  </button>
                </div>
              </div>

              {scenario && (
                <div className="bg-indigo-600 p-10 text-white animate-fadeIn">
                   <div className="flex items-center gap-2 mb-4 text-indigo-200">
                     <i className="fas fa-brain"></i>
                     <span className="text-[10px] font-black uppercase tracking-widest">What-If Simulation</span>
                   </div>
                   <div className="whitespace-pre-wrap text-lg leading-relaxed font-bold">
                     {scenario}
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 text-5xl">
                <i className="fas fa-microscope"></i>
              </div>
              <div className="max-w-xs">
                <h4 className="font-black text-slate-900 text-lg mb-2">Ready to Experiment?</h4>
                <p className="text-slate-400 text-sm font-medium">Input a concept on the left and choose a persona to start your financial literacy session.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                 {FUNDAMENTALS.slice(0, 3).map(f => (
                   <button key={f.name} onClick={() => setConcept(f.name)} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                     Try {f.name}
                   </button>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Library Section */}
      <section className="space-y-8">
         <div className="flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Analogy Mastery Library</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRESET_ANALOGIES.map((item, i) => (
              <div 
                key={i} 
                onClick={() => loadPreset(item)}
                className="group cursor-pointer bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-full -mr-16 -mt-16 transition-all duration-700 group-hover:scale-150`}></div>
                
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
                      <i className={`fas ${item.icon}`}></i>
                   </div>
                   <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full">
                      {item.persona}
                   </div>
                </div>

                <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-tighter">Topic: {item.concept}</p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed italic line-clamp-3">"{item.text}"</p>
                
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                   Load into Lab <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};
