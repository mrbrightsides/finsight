
import React, { useEffect, useState, useMemo } from 'react';

const NODES = [
  { label: 'AI Advisor', icon: 'fa-robot', x: 20, y: 30, color: 'text-indigo-400', delay: '0s' },
  { label: 'Time Machine', icon: 'fa-clock-rotate-left', x: 80, y: 25, color: 'text-emerald-400', delay: '1s' },
  { label: 'Tax Architect', icon: 'fa-landmark-flag', x: 75, y: 70, color: 'text-rose-400', delay: '2s' },
  { label: 'DeFi Explorer', icon: 'fa-microchip', x: 25, y: 75, color: 'text-purple-400', delay: '3s' },
  { label: 'Market Pulse', icon: 'fa-satellite-dish', x: 50, y: 50, color: 'text-white', delay: '1.5s' },
];

export const EcosystemMap: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Liquid Blob (The "Ecosystem Cloud") */}
      <div 
        className="absolute inset-0 flex items-center justify-center opacity-40 blur-[80px]"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="w-[400px] h-[300px] bg-indigo-600 rounded-full animate-morph-1"></div>
        <div className="w-[350px] h-[350px] bg-emerald-600 rounded-full animate-morph-2 -ml-20"></div>
        <div className="w-[300px] h-[400px] bg-purple-600 rounded-full animate-morph-3 -mt-20"></div>
      </div>

      {/* SVG Neural Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="liquid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="liquid" />
          </filter>
        </defs>
        <g filter="url(#liquid)">
          {NODES.map((node, i) => (
             NODES.slice(i + 1).map((target, j) => (
               <line 
                key={`${i}-${j}`} 
                x1={node.x} y1={node.y} 
                x2={target.x} y2={target.y} 
                stroke="white" 
                strokeWidth="0.5" 
                className="animate-pulse"
               />
             ))
          ))}
        </g>
      </svg>

      {/* Interactive Feature Nodes */}
      <div className="relative z-10 w-full max-w-4xl h-full">
        {NODES.map((node, i) => (
          <div 
            key={i}
            className="absolute transition-transform duration-1000 ease-out flex flex-col items-center gap-3 group"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`, 
              transform: `translate(-50%, -50%) translate(${mousePos.x * (i % 2 ? 1 : -1)}px, ${mousePos.y * (i % 3 ? 1 : -1)}px)`,
              animationDelay: node.delay 
            }}
          >
            <div className={`w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-2xl group-hover:scale-110 group-hover:border-indigo-500/50 transition-all ${node.color} relative`}>
              <i className={`fas ${node.icon}`}></i>
              <div className={`absolute inset-0 rounded-2xl blur-lg ${node.color.replace('text', 'bg')} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
              {node.label}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes morph-1 {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
          34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          67% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 40%; }
        }
        @keyframes morph-2 {
          0%, 100% { border-radius: 60% 40% 30% 70% / 50% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 70% 40% 60% 30%; }
        }
        @keyframes morph-3 {
          0%, 100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: scale(1); }
          50% { border-radius: 70% 30% 30% 70% / 30% 70% 70% 30%; transform: scale(1.1); }
        }
        .animate-morph-1 { animation: morph-1 12s ease-in-out infinite; }
        .animate-morph-2 { animation: morph-2 15s ease-in-out infinite; }
        .animate-morph-3 { animation: morph-3 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
