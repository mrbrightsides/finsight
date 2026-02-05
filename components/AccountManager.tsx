
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Asset, IncomeStream, BudgetCategory, GroundingSource, LifeEvent } from '../types';
import { createNewProfile, clearAppState } from '../services/storageService';
import { analyzeCashFlow, analyzeDebtStrategy, calculateFinancialHealth, getStockNews } from '../services/geminiService';

interface AccountManagerProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onUpdateProfiles: (updated: UserProfile[]) => void;
  onSwitchProfile: (id: string) => void;
}

interface CashFlowAnalysis {
  habits: string;
  opportunities: string[];
  budgetTips: string[];
  adjustments?: string[];
}

interface ResilienceAudit {
  score: number;
  verdict: string;
  metrics: {
    emergencyFund: number;
    debtRatio: number;
    diversification: number;
  };
  insights: string[];
}

interface TradeState {
  assetId: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
}

interface SplitState {
  assetId: string;
  ratioA: number;
  ratioB: number;
}

interface StockNewsState {
  text: string;
  sources: GroundingSource[];
  isLoading: boolean;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ profiles, activeProfileId, onUpdateProfiles, onSwitchProfile }) => {
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [formData, setFormData] = useState<UserProfile>({ ...activeProfile });
  const [newProfileName, setNewProfileName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modals / Overlays
  const [tradeModal, setTradeModal] = useState<TradeState | null>(null);
  const [splitModal, setSplitModal] = useState<SplitState | null>(null);

  // AI Analysis State
  const [cfAnalysis, setCfAnalysis] = useState<CashFlowAnalysis | null>(null);
  const [isAnalyzingCF, setIsAnalyzingCF] = useState(false);
  const [resilienceAudit, setResilienceAudit] = useState<ResilienceAudit | null>(null);
  const [isAuditingResilience, setIsAuditingResilience] = useState(false);
  const [debtAiInsights, setDebtAiInsights] = useState<Record<string, string>>({});
  const [isAnalyzingDebt, setIsAnalyzingDebt] = useState<Record<string, boolean>>({});
  const [stockNews, setStockNews] = useState<Record<string, StockNewsState>>({});

  useEffect(() => {
    setFormData({ ...activeProfile });
    setCfAnalysis(null);
    setResilienceAudit(null);
    setStockNews({});
  }, [activeProfileId, activeProfile.id]);

  useEffect(() => {
    const calculatedTotal = formData.assets.reduce((sum, asset) => sum + asset.balance, 0);
    if (calculatedTotal !== formData.totalBalance) {
      setFormData(prev => ({ ...prev, totalBalance: calculatedTotal }));
    }
  }, [formData.assets]);

  useEffect(() => {
    const totalMonthly = formData.incomeStreams.reduce((acc, stream) => {
      let multiplier = 1;
      switch (stream.frequency) {
        case 'weekly': multiplier = 4.33; break;
        case 'bi-weekly': multiplier = 2.16; break;
        case 'monthly': multiplier = 1; break;
        case 'one-time': multiplier = 0.083; break; 
      }
      return acc + (stream.amount * multiplier);
    }, 0);
    
    if (Math.round(totalMonthly) !== Math.round(formData.monthlyIncome)) {
      setFormData(prev => ({ ...prev, monthlyIncome: Math.round(totalMonthly) }));
    }
  }, [formData.incomeStreams]);

  useEffect(() => {
    const totalExpenses = formData.budgets.reduce((sum, b) => sum + b.actual, 0);
    if (Math.round(totalExpenses) !== Math.round(formData.monthlyExpenses)) {
      setFormData(prev => ({ ...prev, monthlyExpenses: Math.round(totalExpenses) }));
    }
  }, [formData.budgets]);

  const assetTypes = [
    { value: 'savings', label: 'Savings/Cash', icon: 'fa-piggy-bank' },
    { value: 'stock', label: 'Stocks/Equity', icon: 'fa-chart-line' },
    { value: 'bond', label: 'Bonds/Fixed Income', icon: 'fa-building-columns' },
    { value: 'real_estate', label: 'Real Estate', icon: 'fa-house-chimney' },
    { value: 'crypto', label: 'Cryptocurrency', icon: 'fa-bitcoin-sign' },
    { value: 'commodity', label: 'Commodities', icon: 'fa-gem' },
    { value: 'debt', label: 'Liability/Debt', icon: 'fa-file-invoice-dollar' },
  ] as const;

  const handleUpdateAsset = (id: string, field: keyof Asset, value: any) => {
    const updatedAssets = formData.assets.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        
        if (field === 'type') {
          const typeData = assetTypes.find(t => t.value === value);
          if (typeData) updated.icon = typeData.icon;
          if (value === 'real_estate') {
            updated.estimatedValue = updated.estimatedValue || updated.balance;
            updated.appreciationRate = updated.appreciationRate || 3;
          }
          if (value === 'debt') {
            updated.interestRate = updated.interestRate || 18;
            updated.minimumPayment = updated.minimumPayment || 100;
            if (updated.balance > 0) updated.balance = -updated.balance;
          }
        }

        if (updated.type === 'stock') {
          if (field === 'quantity' || field === 'unitPrice') {
            updated.balance = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
          } else if (field === 'balance') {
            if (updated.quantity && updated.quantity > 0) {
              updated.unitPrice = updated.balance / updated.quantity;
            }
          }
        }

        return updated;
      }
      return a;
    });
    setFormData({ ...formData, assets: updatedAssets });
  };

  const handleFetchStockNews = async (id: string, ticker: string) => {
    if (!ticker) return;
    setStockNews(prev => ({ ...prev, [id]: { text: '', sources: [], isLoading: true } }));
    try {
      const news = await getStockNews(ticker);
      setStockNews(prev => ({ 
        ...prev, 
        [id]: { text: news.text, sources: news.sources, isLoading: false } 
      }));
    } catch (e) {
      console.error(e);
      setStockNews(prev => ({ ...prev, [id]: { text: 'Failed to fetch news.', sources: [], isLoading: false } }));
    }
  };

  const handleUpdateBudget = (id: string, field: keyof BudgetCategory, value: any) => {
    setFormData({
      ...formData,
      budgets: formData.budgets.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const handleAddBudget = () => {
    const newBudget: BudgetCategory = { id: Math.random().toString(36).substr(2, 9), name: 'New Category', target: 0, actual: 0 };
    setFormData({ ...formData, budgets: [...formData.budgets, newBudget] });
  };

  const handleRemoveBudget = (id: string) => {
    setFormData({ ...formData, budgets: formData.budgets.filter(b => b.id !== id) });
  };

  const handleAddLifeEvent = () => {
    const newEvent: LifeEvent = { id: Math.random().toString(36).substr(2, 9), name: 'New Milestone', year: 5, oneTimeImpact: 0, monthlyImpact: 0 };
    setFormData({ ...formData, lifeEvents: [...formData.lifeEvents, newEvent] });
  };

  const handleUpdateLifeEvent = (id: string, field: keyof LifeEvent, value: any) => {
    setFormData({
      ...formData,
      lifeEvents: formData.lifeEvents.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const handleRemoveLifeEvent = (id: string) => {
    setFormData({ ...formData, lifeEvents: formData.lifeEvents.filter(e => e.id !== id) });
  };

  const calculateDebtPayoff = (asset: Asset) => {
    const principal = Math.abs(asset.balance);
    const rate = (asset.interestRate || 0) / 100 / 12;
    const payment = asset.minimumPayment || 0;
    if (principal <= 0) return { months: 0, totalInterest: 0, status: 'clear' };
    if (payment <= principal * rate) return { months: Infinity, totalInterest: Infinity, status: 'warning' };
    const months = -Math.log(1 - (rate * principal) / payment) / Math.log(1 + rate);
    const totalInterest = (months * payment) - principal;
    return { months: Math.ceil(months), totalInterest: Math.round(totalInterest), status: 'active' };
  };

  const handleRunResilienceAudit = async () => {
    setIsAuditingResilience(true);
    try {
      const res = await calculateFinancialHealth(formData);
      setResilienceAudit(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditingResilience(false);
    }
  };

  const handleRunDebtAi = async (asset: Asset) => {
    setIsAnalyzingDebt(prev => ({ ...prev, [asset.id]: true }));
    try {
      const insight = await analyzeDebtStrategy(asset, formData.monthlyIncome);
      setDebtAiInsights(prev => ({ ...prev, [asset.id]: insight }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingDebt(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const executeTrade = () => {
    if (!tradeModal) return;
    const { assetId, type, shares, price } = tradeModal;
    const updatedAssets = formData.assets.map(a => {
      if (a.id === assetId) {
        const currentQty = a.quantity || 0;
        const qtyChange = Math.abs(shares);
        let newQty = type === 'buy' ? currentQty + qtyChange : Math.max(0, currentQty - qtyChange);
        return { ...a, quantity: newQty, unitPrice: price, balance: newQty * price };
      }
      return a;
    });
    setFormData({ ...formData, assets: updatedAssets });
    setTradeModal(null);
  };

  const executeSplit = () => {
    if (!splitModal) return;
    const { assetId, ratioA, ratioB } = splitModal;
    if (ratioA <= 0 || ratioB <= 0) return;
    const updatedAssets = formData.assets.map(a => {
      if (a.id === assetId) {
        const factor = ratioA / ratioB;
        return { ...a, quantity: (a.quantity || 0) * factor, unitPrice: (a.unitPrice || 0) / factor };
      }
      return a;
    });
    setFormData({ ...formData, assets: updatedAssets });
    setSplitModal(null);
  };

  const handleAddAsset = () => {
    const newAsset: Asset = { id: Math.random().toString(36).substr(2, 9), name: 'New Asset', balance: 0, type: 'savings', icon: 'fa-wallet', color: 'bg-indigo-100 text-indigo-600' };
    setFormData({ ...formData, assets: [...formData.assets, newAsset] });
  };

  const handleRemoveAsset = (id: string) => {
    setFormData({ ...formData, assets: formData.assets.filter(a => a.id !== id) });
  };

  const handleAddIncome = () => {
    const newIncome: IncomeStream = { id: Math.random().toString(36).substr(2, 9), name: 'New Stream', amount: 0, frequency: 'monthly' };
    setFormData({ ...formData, incomeStreams: [...formData.incomeStreams, newIncome] });
  };

  const handleUpdateIncome = (id: string, field: keyof IncomeStream, value: any) => {
    setFormData({
      ...formData,
      incomeStreams: formData.incomeStreams.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const handleRemoveIncome = (id: string) => {
    setFormData({ ...formData, incomeStreams: formData.incomeStreams.filter(s => s.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfiles(profiles.map(p => p.id === formData.id ? formData : p));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    const nextProfile = createNewProfile(newProfileName);
    onUpdateProfiles([...profiles, nextProfile]);
    onSwitchProfile(nextProfile.id);
    setNewProfileName('');
  };

  const handleResetApp = () => {
    if (confirm("Resetting will wipe all custom profiles, assets, and AI insights. This cannot be undone. Proceed?")) {
      clearAppState();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12 relative">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">CFO Intelligence Hub</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Define your income, expenses, and milestones.</p>
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <input 
            type="text" 
            placeholder="Account Name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="px-4 py-2 text-sm font-bold outline-none bg-transparent w-40"
          />
          <button onClick={handleCreateProfile} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
            Create
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Profiles</h3>
             <div className="space-y-3">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSwitchProfile(p.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      activeProfileId === p.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-transparent text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-black">{p.name}</div>
                    <div className="text-[10px] font-bold opacity-60">${p.totalBalance.toLocaleString()}</div>
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <i className="fas fa-shield-heart text-7xl"></i>
             </div>
             <div>
               <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <i className="fas fa-microchip"></i> Resilience Audit
               </h3>
               {resilienceAudit ? (
                 <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-4">
                       <div className="text-5xl font-black text-indigo-400">{resilienceAudit.score}</div>
                       <div>
                          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            resilienceAudit.score > 75 ? 'bg-emerald-500/20 text-emerald-400' :
                            resilienceAudit.score > 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {resilienceAudit.verdict}
                          </div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">Calculated IQ</div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div>
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-1">
                             <span className="text-slate-500">Emergency Fund</span>
                             <span className="text-indigo-400">{resilienceAudit.metrics.emergencyFund}%</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${resilienceAudit.metrics.emergencyFund}%` }}></div>
                          </div>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <ul className="space-y-3">
                          {resilienceAudit.insights.map((insight, i) => (
                            <li key={i} className="flex gap-2 text-[9px] font-medium text-slate-400 leading-relaxed italic">
                               <i className="fas fa-circle-info text-indigo-400 mt-0.5"></i>
                               {insight}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
               ) : (
                 <div className="py-8 text-center space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed px-4">Analyze your profile to find your Resilience Score.</p>
                 </div>
               )}
             </div>
             <button type="button" onClick={handleRunResilienceAudit} disabled={isAuditingResilience} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
               {isAuditingResilience ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magnifying-glass-chart"></i>} 
               Audit Now
             </button>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-6">Core Statistics</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Monthly Income</label>
                  <div className="text-2xl font-black text-emerald-600">${formData.monthlyIncome.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Monthly Expenses</label>
                  <div className="text-2xl font-black text-rose-600">${formData.monthlyExpenses.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Savings ($)</label>
                  <input type="number" value={formData.monthlySavings || 0} onChange={(e) => setFormData({...formData, monthlySavings: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500" />
                </div>
             </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <h3 className="text-xl font-black text-slate-900">Revenue Streams</h3>
                <button type="button" onClick={handleAddIncome} className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">+ Add Stream</button>
             </div>
             <div className="space-y-4">
                {formData.incomeStreams.map((stream) => (
                  <div key={stream.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                    <div className="md:col-span-1"><label className="text-[9px] font-black text-emerald-600 uppercase mb-1 block">Source</label><input value={stream.name} onChange={(e) => handleUpdateIncome(stream.id, 'name', e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-emerald-100 text-sm font-bold focus:border-emerald-500 outline-none bg-white" /></div>
                    <div><label className="text-[9px] font-black text-emerald-600 uppercase mb-1 block">Amount ($)</label><input type="number" value={stream.amount} onChange={(e) => handleUpdateIncome(stream.id, 'amount', Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border-2 border-emerald-100 text-sm font-bold focus:border-emerald-500 outline-none bg-white" /></div>
                    <div><label className="text-[9px] font-black text-emerald-600 uppercase mb-1 block">Frequency</label><select value={stream.frequency} onChange={(e) => handleUpdateIncome(stream.id, 'frequency', e.target.value as any)} className="w-full px-4 py-2 rounded-xl border-2 border-emerald-100 text-sm font-bold focus:border-emerald-500 outline-none bg-white"><option value="weekly">Weekly</option><option value="bi-weekly">Bi-weekly</option><option value="monthly">Monthly</option></select></div>
                    <div className="flex items-end justify-end"><button type="button" onClick={() => handleRemoveIncome(stream.id)} className="p-3 text-emerald-300 hover:text-rose-500 transition-colors"><i className="fas fa-trash-can"></i></button></div>
                  </div>
                ))}
             </div>
          </div>

          {/* LIFE MILESTONES MANAGEMENT */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Life Milestones</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Future Events Driving Simulation Trajectories</p>
                </div>
                <button type="button" onClick={handleAddLifeEvent} className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">+ Add Milestone</button>
             </div>
             <div className="space-y-4">
                {formData.lifeEvents.map((event) => (
                  <div key={event.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-indigo-50/20 rounded-3xl border border-indigo-100/30">
                    <div className="md:col-span-1"><label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block">Event Name</label><input value={event.name} onChange={(e) => handleUpdateLifeEvent(event.id, 'name', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-indigo-100 text-sm font-bold bg-white" /></div>
                    <div><label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block">Execution Year</label><input type="number" value={event.year} onChange={(e) => handleUpdateLifeEvent(event.id, 'year', Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-indigo-100 text-sm font-bold bg-white" /></div>
                    <div><label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block">Capital Impact ($)</label><input type="number" value={event.oneTimeImpact} onChange={(e) => handleUpdateLifeEvent(event.id, 'oneTimeImpact', Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-indigo-100 text-sm font-bold bg-white" /></div>
                    <div className="flex items-end justify-end gap-2">
                       <div className="flex-1"><label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block">Cash Flow Delta</label><input type="number" value={event.monthlyImpact} onChange={(e) => handleUpdateLifeEvent(event.id, 'monthlyImpact', Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-indigo-100 text-sm font-bold bg-white" /></div>
                       <button type="button" onClick={() => handleRemoveLifeEvent(event.id)} className="p-3 text-indigo-300 hover:text-rose-500 transition-colors"><i className="fas fa-trash-can"></i></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <h3 className="text-xl font-black text-slate-900">Resource Allocation</h3>
                <button type="button" onClick={handleAddAsset} className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">+ Deploy Asset</button>
             </div>
             <div className="space-y-6">
                {formData.assets.map((asset) => {
                  const debtPayoff = asset.type === 'debt' ? calculateDebtPayoff(asset) : null;
                  const news = stockNews[asset.id];
                  return (
                    <div key={asset.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1"><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Label</label><input value={asset.name} onChange={(e) => handleUpdateAsset(asset.id, 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-bold bg-white" /></div>
                        <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Category</label><select value={asset.type} onChange={(e) => handleUpdateAsset(asset.id, 'type', e.target.value as any)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-bold bg-white">{assetTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                        <div><label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Value ($)</label><input type="number" value={asset.balance} onChange={(e) => handleUpdateAsset(asset.id, 'balance', Number(e.target.value))} className={`w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm font-bold bg-white ${asset.balance < 0 ? 'text-rose-500' : 'text-slate-900'}`} /></div>
                        <div className="flex items-end justify-end"><button type="button" onClick={() => handleRemoveAsset(asset.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><i className="fas fa-trash-can"></i></button></div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="flex justify-end gap-4 bg-white/50 backdrop-blur-md p-8 rounded-[2rem] border border-white sticky bottom-6 z-20">
             {showSuccess && <span className="text-emerald-600 font-black text-xs flex items-center gap-2 animate-fadeIn"><i className="fas fa-check-circle"></i> Strategy Synced</span>}
             <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Save Strategy</button>
          </div>
        </form>
      </div>

      {tradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl space-y-8">
            <h4 className="text-2xl font-black text-slate-900">{tradeModal.type === 'buy' ? 'Buy Shares' : 'Sell Shares'}</h4>
            <div className="space-y-6">
              <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Amount of Shares</label><input type="number" autoFocus value={tradeModal.shares || ''} onChange={(e) => setTradeModal({ ...tradeModal, shares: Number(e.target.value) })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl outline-none focus:border-indigo-500" /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Price ($)</label><input type="number" value={tradeModal.price || ''} onChange={(e) => setTradeModal({ ...tradeModal, price: Number(e.target.value) })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl outline-none focus:border-indigo-500" /></div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center"><div className="text-[10px] font-black text-slate-400 uppercase mb-1">Value</div><div className="text-2xl font-black text-slate-900">${((tradeModal.shares || 0) * (tradeModal.price || 0)).toLocaleString()}</div></div>
              <div className="flex gap-4"><button onClick={() => setTradeModal(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase">Cancel</button><button onClick={executeTrade} className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase ${tradeModal.type === 'buy' ? 'bg-emerald-600' : 'bg-rose-600'}`}>Confirm</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
