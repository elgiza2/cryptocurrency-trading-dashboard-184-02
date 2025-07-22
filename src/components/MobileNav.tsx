
import { Home, Users, Zap, Gamepad2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      label: 'Home'
    },
    {
      id: 'referral',
      icon: Users,
      label: 'Friends'
    },
    {
      id: 'roulette',
      icon: Gamepad2,
      label: 'Roulette',
      special: true
    },
    {
      id: 'missions',
      icon: Zap,
      label: 'Tasks'
    },
    {
      id: 'giveaways',
      icon: Gift,
      label: 'Giveaways'
    }
  ];

  const getItemStyle = (id: string, special = false) => {
    if (special) {
      return activeTab === id 
        ? 'btn-roulette shadow-lg shadow-pink-500/50 h-14 w-14 p-0' 
        : 'btn-roulette opacity-70 hover:opacity-100 h-12 w-12 p-0';
    }
    
    if (activeTab === id) {
      return 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-pink-500/30';
    }
    
    return 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 p-1">
      <div className="flex justify-center items-end max-w-xs mx-auto px-1">
        {navItems.map(({ id, icon: Icon, label, special }) => (
          <div key={id} className={`flex flex-col items-center ${special ? 'mx-0.5' : 'flex-1'}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col gap-0.5 transition-all duration-300 rounded-lg border-none bg-transparent hover:bg-transparent ${
                special 
                  ? activeTab === id 
                    ? 'text-pink-500 h-8 w-8 p-0' 
                    : 'text-white/70 hover:text-white h-7 w-7 p-0'
                  : activeTab === id
                    ? 'text-pink-500 h-auto p-0.5 min-h-7'
                    : 'text-white/70 hover:text-white h-auto p-0.5 min-h-7'
              }`}
              onClick={() => onTabChange(id)}
            >
              <Icon className={special ? "h-4 w-4" : "h-3 w-3"} />
              {!special && <span className="text-[10px] font-medium">{label}</span>}
            </Button>
            {special && (
              <span className="text-[10px] font-medium text-white/80 mt-0.5">{label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
