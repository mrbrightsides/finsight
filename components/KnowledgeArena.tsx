
import React, { useState, useEffect } from 'react';
import { generateDailyQuiz } from '../services/geminiService';

const TOPICS = [
  { id: 'tax', label: 'Tax Optimization', icon: 'fa-receipt', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'growth', label: 'Growth Equity', icon: 'fa-chart-line', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'macro', label: 'Macro Economy', icon: 'fa-earth-americas', color: 'bg-amber-100 text-amber-600' },
  { id: 'psych', label: 'Finance Psych', icon: 'fa-brain-circuit', color: 'bg-rose-100 text-rose-600' },
];

export const KnowledgeArena: React.FC = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);

  const startQuiz = async (topicLabel: string) => {
    setIsLoading(true);
    setQuiz(null);
    setFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setAnsweredIdx(null);
    try {
      const data = await generateDailyQuiz(topicLabel);
      setQuiz(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answeredIdx !== null) return;
    setAnsweredIdx(idx);
    if (idx === quiz.questions[currentIdx].correctIndex) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
      if (currentIdx < quiz.questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setAnsweredIdx(null);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
          <i className="fas fa-bolt"></i> Learning Combat
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Knowledge Arena</h2>
        <p className="text-slate-500 mt-2 text-lg font-medium">Earn Economic IQ points by mastering complex fiscal scenarios.</p>
      </header>

      {!quiz && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => { setSelectedTopic(topic.id); startQuiz(topic.label); }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-center space-y-6 flex flex-col items-center"
            >
              <div className={`w-20 h-20 ${topic.color} rounded-3xl flex items-center justify-center text-3xl shadow-sm`}>
                <i className={`fas ${topic.icon}`}></i>
              </div>
              <div>
                <h4 className="font-black text-slate-900">{topic.label}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">3 Questions • 50 IQ</p>
              </div>
              <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-1/3 opacity-30"></div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center space-y-8 border border-slate-100 shadow-sm">
           <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <div className="text-center">
             <h4 className="text-xl font-black text-slate-900">Forging Your Challenge</h4>
             <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">AI-Generated Custom Scenarios Incoming...</p>
           </div>
        </div>
      )}

      {quiz && !finished && (
        <div className="max-w-3xl mx-auto space-y-8">
           <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentIdx + 1} of {quiz.questions.length}</span>
              <div className="flex gap-1">
                 {quiz.questions.map((_: any, i: number) => (
                   <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${i <= currentIdx ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl space-y-10 animate-fadeIn">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight text-center">
                {quiz.questions[currentIdx].text}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                 {quiz.questions[currentIdx].options.map((option: string, i: number) => {
                    const isCorrect = i === quiz.questions[currentIdx].correctIndex;
                    const isSelected = i === answeredIdx;
                    let stateClasses = 'bg-slate-50 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30';
                    
                    if (answeredIdx !== null) {
                       if (isCorrect) stateClasses = 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50';
                       else if (isSelected) stateClasses = 'bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50';
                       else stateClasses = 'bg-slate-50 border-slate-100 opacity-40';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={answeredIdx !== null}
                        className={`p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 ${stateClasses}`}
                      >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0 font-black text-xs">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                        {answeredIdx !== null && isCorrect && <i className="fas fa-check-circle ml-auto text-emerald-500 text-xl"></i>}
                        {answeredIdx !== null && isSelected && !isCorrect && <i className="fas fa-times-circle ml-auto text-rose-500 text-xl"></i>}
                      </button>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {finished && (
        <div className="max-w-2xl mx-auto bg-slate-900 rounded-[3rem] p-16 text-white text-center shadow-2xl space-y-10 animate-fadeIn border-t-8 border-indigo-500">
           <div className="space-y-4">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl mx-auto text-amber-400">
                <i className="fas fa-award"></i>
              </div>
              <h3 className="text-4xl font-black">Arena Complete!</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your Daily IQ Harvest</p>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                 <div className="text-5xl font-black text-indigo-400">{score}/{quiz.questions.length}</div>
                 <div className="text-[10px] font-black text-slate-500 uppercase mt-2">Accuracy</div>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                 <div className="text-5xl font-black text-emerald-400">+{score * 20}</div>
                 <div className="text-[10px] font-black text-slate-500 uppercase mt-2">Economic IQ</div>
              </div>
           </div>

           <div className="pt-4 flex gap-4">
              <button onClick={() => setQuiz(null)} className="flex-1 py-5 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
                Claim Reward
              </button>
              <button onClick={() => setQuiz(null)} className="flex-1 py-5 bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                Close Arena
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
