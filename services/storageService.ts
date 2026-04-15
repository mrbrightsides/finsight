
import { UserProfile, Asset, AppState, IncomeStream, BudgetCategory, LifeEvent } from '../types';

const STORAGE_KEY = 'finsight_app_state';

const createDefaultAssets = (): Asset[] => [
  { 
    id: Math.random().toString(36).substr(2, 9), 
    name: 'Primary Liquidity', 
    balance: 15000, 
    type: 'savings', 
    icon: 'fa-piggy-bank', 
    color: 'bg-orange-100 text-orange-600',
    lastRecurringProcessedDate: new Date().toISOString() 
  },
  { 
    id: Math.random().toString(36).substr(2, 9), 
    name: 'S&P 500 ETF (SPY)', 
    balance: 45000, 
    quantity: 100,
    unitPrice: 450,
    type: 'stock', 
    ticker: 'SPY',
    isLinked: true,
    icon: 'fa-chart-line', 
    color: 'bg-emerald-100 text-emerald-600' 
  },
  { 
    id: Math.random().toString(36).substr(2, 9), 
    name: 'Student Debt', 
    balance: -8500, 
    type: 'debt', 
    icon: 'fa-graduation-cap', 
    color: 'bg-pink-100 text-pink-600',
    interestRate: 4.5,
    minimumPayment: 250,
    isRecurring: true,
    recurringAmount: 250,
    recurringFrequency: 'monthly',
    lastRecurringProcessedDate: new Date().toISOString()
  }
];

const createDefaultBudgets = (): BudgetCategory[] => [
  { id: 'b1', name: 'Housing & Utilities', target: 2000, actual: 1950 },
  { id: 'b2', name: 'Groceries', target: 600, actual: 580 },
  { id: 'b3', name: 'Dining Out', target: 400, actual: 450 },
  { id: 'b4', name: 'Transport', target: 300, actual: 280 },
];

const createDefaultProfile = (name: string = 'New Strategist'): UserProfile => {
  const assets = createDefaultAssets();
  const budgets = createDefaultBudgets();
  const total = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = budgets.reduce((sum, b) => sum + b.actual, 0);
  const defaultIncome: IncomeStream[] = [
    { id: 'i1', name: 'Primary Salary', amount: 6500, frequency: 'monthly' }
  ];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    totalBalance: total,
    monthlySavings: 1500,
    monthlyIncome: 6500,
    monthlyExpenses: totalExpenses || 4000,
    expectedReturn: 8,
    assets,
    incomeStreams: defaultIncome,
    budgets,
    goals: [{ id: 'g1', name: 'Home Down Payment', target: 80000, current: 51500 }],
    lifeEvents: []
  };
};

export const processRecurringDeposits = (profile: UserProfile): { updatedProfile: UserProfile, depositsApplied: number } => {
  let depositsAppliedCount = 0;
  const now = new Date();
  
  const updatedAssets = profile.assets.map(asset => {
    const isProcessableType = asset.type === 'savings' || asset.type === 'debt';
    
    if (isProcessableType && asset.isRecurring && asset.recurringAmount && asset.recurringAmount > 0) {
      const lastProcess = asset.lastRecurringProcessedDate ? new Date(asset.lastRecurringProcessedDate) : new Date();
      const msDiff = now.getTime() - lastProcess.getTime();
      
      let intervalMs = 0;
      switch (asset.recurringFrequency) {
        case 'weekly': intervalMs = 7 * 24 * 60 * 60 * 1000; break;
        case 'bi-weekly': intervalMs = 14 * 24 * 60 * 60 * 1000; break;
        case 'monthly': intervalMs = 30 * 24 * 60 * 60 * 1000; break;
        default: intervalMs = 30 * 24 * 60 * 60 * 1000;
      }

      const intervalsPassed = Math.floor(msDiff / intervalMs);
      
      if (intervalsPassed > 0) {
        const totalDeposit = intervalsPassed * asset.recurringAmount;
        depositsAppliedCount += intervalsPassed;
        const newProcessDate = new Date(lastProcess.getTime() + (intervalsPassed * intervalMs));
        return {
          ...asset,
          balance: asset.balance + totalDeposit,
          lastRecurringProcessedDate: newProcessDate.toISOString()
        };
      }
    }
    return asset;
  });

  const totalBalance = updatedAssets.reduce((sum, a) => sum + a.balance, 0);

  return {
    updatedProfile: { ...profile, assets: updatedAssets, totalBalance },
    depositsApplied: depositsAppliedCount
  };
};

export const loadAppState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const state = JSON.parse(saved);
      state.profiles = state.profiles.map((p: UserProfile) => ({
        ...p,
        incomeStreams: p.incomeStreams || [{ id: Math.random().toString(36).substr(2, 9), name: 'Salary', amount: p.monthlyIncome, frequency: 'monthly' }],
        budgets: p.budgets || createDefaultBudgets(),
        lifeEvents: p.lifeEvents || []
      }));
      return state;
    } catch (e) {
      console.error("Failed to parse app state", e);
    }
  }
  const defaultProfile = createDefaultProfile('Executive Account');
  return {
    profiles: [defaultProfile],
    activeProfileId: defaultProfile.id
  };
};

export const saveAppState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearAppState = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const createNewProfile = (name: string): UserProfile => {
  return createDefaultProfile(name);
};
