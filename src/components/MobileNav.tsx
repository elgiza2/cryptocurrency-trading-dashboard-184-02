import { Home, Users, Trophy, Target, Gift } from "lucide-react";
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
      icon: Target,
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background with blur and gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-lg" />
      
      <div className="relative px-4 py-3">
        <div className="flex items-end justify-center max-w-sm mx-auto">
          {/* Left side buttons */}
          <div className="flex space-x-2 flex-1 justify-around">
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
            <div className="mx-4 -mt-6">
              <CenterButton
                item={rouletteItem}
                isActive={activeTab === rouletteItem.id}
                onClick={() => onTabChange(rouletteItem.id)}
              />
            </div>
          )}

          {/* Right side buttons */}
          <div className="flex space-x-2 flex-1 justify-around">
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
        "flex flex-col items-center gap-1 h-auto p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
        "hover:scale-105 active:scale-95",
        isActive ? "shadow-lg" : "hover:bg-white/5"
      )}
      onClick={onClick}
    >
      {/* Background gradient for active state */}
      {isActive && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-20 rounded-xl",
          gradient
        )} />
      )}
      
      {/* Icon container */}
      <div className={cn(
        "relative p-2 rounded-lg transition-all duration-300",
        isActive 
          ? `bg-gradient-to-br ${gradient} shadow-lg shadow-pink-500/25` 
          : "bg-white/10 group-hover:bg-white/20"
      )}>
        <Icon className={cn(
          "h-5 w-5 transition-colors duration-300",
          isActive ? "text-white" : "text-gray-400 group-hover:text-white"
        )} />
      </div>
      
      {/* Label */}
      <span className={cn(
        "text-xs font-medium transition-colors duration-300 relative z-10",
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
          "relative h-20 w-20 rounded-full p-0 overflow-hidden transition-all duration-300 group",
          "hover:scale-110 active:scale-95 shadow-2xl"
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
        <Icon className="relative z-10 h-8 w-8 text-white drop-shadow-lg" />
        
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