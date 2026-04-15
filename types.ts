
export interface SimulationData {
  year: number;
  balance: number;
  inflationAdjusted: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface IncomeStream {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'bi-weekly' | 'weekly' | 'one-time';
}

export interface BudgetCategory {
  id: string;
  name: string;
  target: number;
  actual: number;
}

export interface LifeEvent {
  id: string;
  name: string;
  year: number;
  oneTimeImpact: number; 
  monthlyImpact: number; 
}

export interface Asset {
  id: string;
  name: string;
  balance: number; 
  quantity?: number; 
  unitPrice?: number; 
  type: 'savings' | 'stock' | 'bond' | 'real_estate' | 'crypto' | 'commodity' | 'debt';
  icon: string;
  color: string;
  ticker?: string;
  isLinked?: boolean;
  isRecurring?: boolean;
  recurringAmount?: number;
  recurringFrequency?: 'weekly' | 'bi-weekly' | 'monthly';
  lastRecurringProcessedDate?: string;
  interestRate?: number;
  minimumPayment?: number;
  purchasePrice?: number;
  estimatedValue?: number;
  appreciationRate?: number;
}

export interface UserGoal {
  id: string;
  name: string;
  target: number;
  current: number;
}

export interface UserProfile {
  id: string;
  name: string;
  totalBalance: number;
  monthlySavings: number;
  monthlyIncome: number;    
  monthlyExpenses: number;  
  expectedReturn: number;
  assets: Asset[];
  incomeStreams: IncomeStream[];
  budgets: BudgetCategory[];
  goals: UserGoal[];
  lifeEvents: LifeEvent[];
  healthScore?: number;     
}

export interface AppState {
  profiles: UserProfile[];
  activeProfileId: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  PORTFOLIO = 'portfolio',
  SIMULATOR = 'simulator',
  CONCEPTS = 'concepts',
  PULSE = 'pulse',
  ACCOUNT = 'account',
  ADVISOR = 'advisor',
  TIMEMACHINE = 'timemachine',
  ARENA = 'arena',
  TAX = 'tax',
  DEFI = 'defi',
  BOND = 'bond'
}
