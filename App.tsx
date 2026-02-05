
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WealthSimulator } from './components/WealthSimulator';
import { ConceptLab } from './components/ConceptLab';
import { MarketPulse } from './components/MarketPulse';
import { PortfolioHub } from './components/PortfolioHub';
import { AccountManager } from './components/AccountManager';
import { AdvisorChat } from './components/AdvisorChat';
import { TimeMachine } from './components/TimeMachine';
import { KnowledgeArena } from './components/KnowledgeArena';
import { TaxArchitect } from './components/TaxArchitect';
import { DeFiExplorer } from './components/DeFiExplorer';
import { BondLab } from './components/BondLab';
import { LandingPage } from './components/LandingPage';
import { Whitepaper } from './components/Whitepaper';
import { AppTab, UserProfile, AppState } from './types';
import { loadAppState, saveAppState, processRecurringDeposits } from './services/storageService';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [appState, setAppState] = useState<AppState>(loadAppState());

  const activeProfile = appState.profiles.find(p => p.id === appState.activeProfileId) || appState.profiles[0];

  useEffect(() => {
    let changed = false;
    const updatedProfiles = appState.profiles.map(profile => {
      const { updatedProfile, depositsApplied } = processRecurringDeposits(profile);
      if (depositsApplied > 0) {
        changed = true;
        return updatedProfile;
      }
      return profile;
    });

    if (changed) {
      const newState = { ...appState, profiles: updatedProfiles };
      setAppState(newState);
      saveAppState(newState);
    }
  }, []);

  const handleUpdateProfiles = (updatedProfiles: UserProfile[]) => {
    const newState = { ...appState, profiles: updatedProfiles };
    setAppState(newState);
    saveAppState(newState);
  };

  const handleSwitchProfile = (id: string) => {
    const newState = { ...appState, activeProfileId: id };
    setAppState(newState);
    saveAppState(newState);
  };

  const handleUpdateReturn = (rate: number) => {
    const updatedProfiles = appState.profiles.map(p => 
      p.id === appState.activeProfileId ? { ...p, expectedReturn: rate } : p
    );
    handleUpdateProfiles(updatedProfiles);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard profile={activeProfile} onTabChange={setActiveTab} />;
      case AppTab.SIMULATOR:
        return <WealthSimulator profile={activeProfile} onUpdateReturn={handleUpdateReturn} />;
      case AppTab.CONCEPTS:
        return <ConceptLab />;
      case AppTab.PULSE:
        return <MarketPulse />;
      case AppTab.PORTFOLIO:
        return <PortfolioHub profile={activeProfile} />;
      case AppTab.ADVISOR:
        return <AdvisorChat profile={activeProfile} />;
      case AppTab.TIMEMACHINE:
        return <TimeMachine profile={activeProfile} />;
      case AppTab.ARENA:
        return <KnowledgeArena />;
      case AppTab.TAX:
        return <TaxArchitect profile={activeProfile} />;
      case AppTab.DEFI:
        return <DeFiExplorer profile={activeProfile} />;
      case AppTab.BOND:
        return <BondLab profile={activeProfile} />;
      case AppTab.ACCOUNT:
        return (
          <AccountManager 
            profiles={appState.profiles} 
            activeProfileId={appState.activeProfileId}
            onUpdateProfiles={handleUpdateProfiles}
            onSwitchProfile={handleSwitchProfile}
          />
        );
      default:
        return <Dashboard profile={activeProfile} onTabChange={setActiveTab} />;
    }
  };

  if (showWhitepaper) {
    return <Whitepaper onClose={() => setShowWhitepaper(false)} />;
  }

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} onOpenWhitepaper={() => setShowWhitepaper(true)} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {renderContent()}
    </Layout>
  );
};

export default App;
