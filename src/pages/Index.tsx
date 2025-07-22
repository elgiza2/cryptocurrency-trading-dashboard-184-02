
import { useState, useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import MiningDashboard from "@/components/MiningDashboard";
import TasksPage from "@/components/TasksPage";
import WalletPage from "@/components/WalletPage";
import NFTPage from "@/components/NFTPage";
import AdminLogin from "@/components/AdminLogin";
import AdminPage from "@/components/AdminPage";
import ActivityRewardsPage from "@/components/ActivityRewardsPage";
import ServerPage from "@/components/ServerPage";
import ReferralPage from "@/components/ReferralPage";
import AboutServersPage from "@/components/AboutServersPage";
import RoulettePage from "@/components/RoulettePage";
import CurrencyExchange from "@/components/CurrencyExchange";
import GiveawaysPage from "@/components/GiveawaysPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [hideNavigation, setHideNavigation] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [appState, setAppState] = useState({
    userBalance: { space: 0.8001, ton: 0.1175, si: 1000 },
    userServers: [],
    activityStreak: 0,
    lastRewardClaim: null,
    referralCount: 0
  });

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['home', 'activity', 'missions', 'wallet', 'nft', 'servers', 'referral', 'about-servers', 'roulette', 'exchange', 'giveaways'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Navigation helpers
  const navigateToTab = (tab: string) => {
    handleTabChange(tab);
  };

  // Currency exchange handler
  const handleCurrencyExchange = (fromCurrency: string, toCurrency: string, amount: number) => {
    const exchangeRate = 0.0006835; // 1 SPACE = 0.0006835 TON
    
    setAppState(prev => {
      const newBalance = { ...prev.userBalance };
      
      if (fromCurrency === 'SPACE' && toCurrency === 'TON') {
        newBalance.space -= amount;
        newBalance.ton += amount * exchangeRate;
      } else if (fromCurrency === 'TON' && toCurrency === 'SPACE') {
        newBalance.ton -= amount;
        newBalance.space += amount / exchangeRate;
      }
      
      return {
        ...prev,
        userBalance: newBalance
      };
    });
  };

  // Check if current page should hide navigation
  const shouldHideNavigation = ['about-servers', 'roulette', 'nft', 'exchange', 'activity', 'servers', 'giveaways'].includes(activeTab);

  const renderContent = () => {
    if (showAdminLogin && !isAdminLoggedIn) {
      return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
    }
    
    if (isAdminLoggedIn) {
      return <AdminPage onBack={() => {
        setIsAdminLoggedIn(false);
        setShowAdminLogin(false);
        setActiveTab("home");
      }} />;
    }

    switch (activeTab) {
      case "home":
        return (
          <MiningDashboard 
            onNavigateToNFT={() => navigateToTab("nft")}
            onNavigateToServers={() => navigateToTab("servers")}
            onNavigateToActivityRewards={() => navigateToTab("activity")}
            onNavigateToExchange={() => navigateToTab("exchange")}
            onNavigateToAboutServers={() => navigateToTab("about-servers")}
            onNavigateToWallet={() => navigateToTab("wallet")}
            userBalance={appState.userBalance}
            userServers={appState.userServers}
          />
        );
      case "roulette":
        return (
          <RoulettePage 
            onBack={() => navigateToTab("home")}
            onNavigateToReferral={() => navigateToTab("referral")}
            userBalance={appState.userBalance}
            onHideNavigation={setHideNavigation}
          />
        );
      case "exchange":
        return (
          <CurrencyExchange 
            onBack={() => navigateToTab("home")}
            userBalance={appState.userBalance}
            onExchange={handleCurrencyExchange}
          />
        );
      case "nft":
        return <NFTPage onBack={() => navigateToTab("home")} />;
      case "giveaways":
        return <GiveawaysPage />;
      case "missions":
        return <TasksPage onNavigateToReferral={() => navigateToTab("referral")} />;
      case "wallet":
        return <WalletPage userBalance={appState.userBalance} />;
      case "activity":
        return (
          <ActivityRewardsPage 
            onNavigateToReferral={() => navigateToTab("referral")}
            onNavigateToServers={() => navigateToTab("servers")}
            onNavigateToTasks={() => navigateToTab("missions")}
            onBack={() => navigateToTab("home")}
            activityStreak={appState.activityStreak}
          />
        );
      case "servers":
        return (
          <ServerPage 
            onBack={() => navigateToTab("home")}
            userBalance={appState.userBalance}
            userServers={appState.userServers}
            onServerPurchase={(server) => {
              setAppState(prev => ({
                ...prev,
                userServers: [...prev.userServers, server],
                userBalance: {
                  ...prev.userBalance,
                  ton: prev.userBalance.ton - server.price
                }
              }));
            }}
          />
        );
      case "referral":
        return (
          <ReferralPage 
            referralCount={appState.referralCount}
          />
        );
      case "about-servers":
        return <AboutServersPage onBack={() => navigateToTab("home")} />;
      default:
        return (
          <MiningDashboard 
            onNavigateToNFT={() => navigateToTab("nft")}
            onNavigateToServers={() => navigateToTab("servers")}
            onNavigateToActivityRewards={() => navigateToTab("activity")}
            onNavigateToExchange={() => navigateToTab("exchange")}
            onNavigateToAboutServers={() => navigateToTab("about-servers")}
            onNavigateToWallet={() => navigateToTab("wallet")}
            userBalance={appState.userBalance}
            userServers={appState.userServers}
          />
        );
    }
  };

  return (
    <div className="min-h-screen unified-gaming-bg relative">
      {/* Main Content */}
      <div className={`${!shouldHideNavigation ? 'pb-20' : ''}`}>
        {renderContent()}
      </div>
      
      {/* Mobile Navigation */}
      {!shouldHideNavigation && !isAdminLoggedIn && <MobileNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onAdminAccess={() => setShowAdminLogin(true)}
      />}
    </div>
  );
};

export default Index;
