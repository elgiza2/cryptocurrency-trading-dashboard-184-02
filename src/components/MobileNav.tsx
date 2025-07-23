import { Home, Users, Trophy, Target, Gift, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdminAccess?: () => void;
}

const MobileNav = ({
  activeTab,
  onTabChange,
  onAdminAccess
}: MobileNavProps) => {
  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'referral',
      icon: Users,
      label: 'Friends',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'roulette',
      icon: Zap,
      label: 'Roulette',
      special: true,
      gradient: 'from-pink-500 to-purple-600'
    },
    {
      id: 'missions',
      icon: Trophy,
      label: 'Tasks',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'giveaways',
      icon: Gift,
      label: 'Giveaways',
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  const regularItems = navItems.filter(item => !item.special);
  const rouletteItem = navItems.find(item => item.special);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'var(--telegram-safe-area-bottom)' }}>
      {/* Background with blur and gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-lg" />
      
      <div className="relative px-3 py-2">
        <div className="flex items-end justify-center max-w-xs mx-auto">
          {/* Left side buttons */}
          <div className="flex space-x-1 flex-1 justify-around">
            {regularItems.slice(0, 2).map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </div>

          {/* Center Roulette button */}
          {rouletteItem && (
            <div className="mx-3 -mt-4">
              <CenterButton
                item={rouletteItem}
                isActive={activeTab === rouletteItem.id}
                onClick={() => onTabChange(rouletteItem.id)}
              />
            </div>
          )}

          {/* Right side buttons */}
          <div className="flex space-x-1 flex-1 justify-around">
            {regularItems.slice(2).map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavButtonProps {
  item: {
    id: string;
    icon: any;
    label: string;
    gradient: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ item, isActive, onClick }: NavButtonProps) => {
  const { icon: Icon, label, gradient } = item;

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex flex-col items-center gap-0.5 h-auto p-1.5 rounded-lg transition-all duration-300 group hover:scale-105",
        "hover:bg-transparent active:bg-transparent focus:bg-transparent min-w-[48px]",
        isActive ? "" : ""
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <Icon className={cn(
        "h-4 w-4 transition-all duration-300",
        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
      )} />
      
      {/* Label */}
      <span className={cn(
        "text-[10px] font-medium transition-colors duration-300 leading-tight",
        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
      )}>
        {label}
      </span>
    </Button>
  );
};

interface CenterButtonProps {
  item: {
    id: string;
    icon: any;
    label: string;
    gradient: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const CenterButton = ({ item, isActive, onClick }: CenterButtonProps) => {
  const { icon: Icon, gradient } = item;

  return (
    <div className="relative">
      {/* Outer glow ring */}
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-500",
        isActive 
          ? "bg-gradient-to-br from-pink-500/50 to-purple-600/50 scale-110 animate-pulse" 
          : "bg-gradient-to-br from-pink-500/20 to-purple-600/20"
      )} />
      
      <Button
        variant="ghost"
        className={cn(
          "relative h-16 w-16 rounded-full p-0 overflow-hidden transition-all duration-300 group",
          "hover:scale-110 shadow-2xl hover:bg-transparent active:bg-transparent focus:bg-transparent"
        )}
        onClick={onClick}
      >
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-300",
          gradient,
          isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        )} />
        
        {/* Inner highlight */}
        <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
        
        {/* Icon */}
        <Icon className="relative z-10 h-6 w-6 text-white drop-shadow-lg" />
        
        {/* Ripple effect */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isActive ? "bg-white/10 animate-ping" : ""
        )} />
      </Button>
    </div>
  );
};

export default MobileNav;
