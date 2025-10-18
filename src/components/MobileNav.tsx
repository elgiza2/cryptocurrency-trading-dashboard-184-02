import { Home, Users, Sparkles, ListTodo, Gift } from "lucide-react";
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
      color: 'hsl(211, 100%, 50%)'
    },
    {
      id: 'referral',
      icon: Users,
      label: 'Friends',
      color: 'hsl(142, 71%, 45%)'
    },
    {
      id: 'roulette',
      icon: Sparkles,
      label: 'Roulette',
      special: true,
      color: 'hsl(211, 100%, 50%)'
    },
    {
      id: 'missions',
      icon: ListTodo,
      label: 'Tasks',
      color: 'hsl(38, 92%, 50%)'
    },
    {
      id: 'giveaways',
      icon: Gift,
      label: 'Giveaways',
      color: 'hsl(271, 81%, 56%)'
    }
  ];

  const regularItems = navItems.filter(item => !item.special);
  const rouletteItem = navItems.find(item => item.special);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'var(--telegram-safe-area-bottom)' }}>
      {/* iOS style background with blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,25%,8%)] via-[hsl(220,25%,8%)]/98 to-transparent backdrop-blur-2xl border-t border-white/10" />
      
      <div className="relative px-4 py-3">
        <div className="flex items-end justify-center max-w-md mx-auto">
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
    color: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ item, isActive, onClick }: NavButtonProps) => {
  const { icon: Icon, label, color } = item;

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 group",
        "hover:bg-white/5 active:scale-95 min-w-[56px]",
        isActive ? "bg-white/10" : ""
      )}
      onClick={onClick}
    >
      {/* iOS style icon container */}
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
        isActive ? "bg-primary/20" : "group-hover:bg-white/5"
      )}>
        <Icon 
          className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )} 
          style={isActive ? { color } : {}}
        />
      </div>
      
      {/* Label */}
      <span className={cn(
        "text-[11px] font-medium transition-colors duration-200 leading-none",
        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
    color: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const CenterButton = ({ item, isActive, onClick }: CenterButtonProps) => {
  const { icon: Icon, color } = item;

  return (
    <div className="relative">
      {/* iOS glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-500 blur-xl",
        isActive 
          ? "bg-primary/40 scale-110" 
          : "bg-primary/20"
      )} />
      
      <Button
        variant="ghost"
        className={cn(
          "relative h-16 w-16 rounded-2xl p-0 overflow-hidden transition-all duration-200 group",
          "shadow-2xl hover:scale-105 active:scale-95",
          "border-2 border-white/20"
        )}
        style={{
          background: `linear-gradient(135deg, ${color}, hsl(220, 100%, 60%))`
        }}
        onClick={onClick}
      >
        {/* Inner iOS highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        
        {/* Icon */}
        <Icon className="relative z-10 h-7 w-7 text-white drop-shadow-lg" />
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
        )}
      </Button>
    </div>
  );
};

export default MobileNav;
