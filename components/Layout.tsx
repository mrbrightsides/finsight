
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: AppTab.DASHBOARD, icon: 'fa-chart-pie', label: 'Overview' },
    { id: AppTab.PORTFOLIO, icon: 'fa-wallet', label: 'My Hub' },
    { id: AppTab.ADVISOR, icon: 'fa-robot', label: 'AI Advisor' },
    { id: AppTab.SIMULATOR, icon: 'fa-rocket', label: 'Wealth Path' },
    { id: AppTab.BOND, icon: 'fa-building-columns', label: 'Bond Lab' },
    { id: AppTab.TAX, icon: 'fa-landmark-flag', label: 'Tax Architect' },
    { id: AppTab.DEFI, icon: 'fa-microchip', label: 'DeFi Explorer' },
    { id: AppTab.TIMEMACHINE, icon: 'fa-hourglass-start', label: 'Time Machine' },
    { id: AppTab.ARENA, icon: 'fa-trophy', label: 'Arena' },
    { id: AppTab.CONCEPTS, icon: 'fa-lightbulb', label: 'Concept Lab' },
    { id: AppTab.PULSE, icon: 'fa-rss', label: 'Market Pulse' },
    { id: AppTab.ACCOUNT, icon: 'fa-user-gear', label: 'Account' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
            <i className="fas fa-coins"></i>
          </div>
          <span className="font-bold text-xl tracking-tight">FinSight <span className="text-indigo-600">AI</span></span>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto pr-2 scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
            <h4 className="font-bold text-sm mb-1">Hackonomics 2026</h4>
            <p className="text-xs opacity-80 leading-relaxed">Fusing Finance, Economics, and Computer System.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 mb-20 md:mb-0">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center z-50 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 min-w-[50px] ${
                activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <i className={`fas ${item.icon} text-lg`}></i>
              <span className="text-[8px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
};
