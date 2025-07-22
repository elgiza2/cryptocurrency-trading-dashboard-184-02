
import { Home, Users, Wallet, Zap, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [walletClicks, setWalletClicks] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
      id: 'nft',
      icon: Wallet,
      label: 'NFT'
    },
    {
      id: 'giveaways',
      icon: Wallet,
      label: 'Giveaways'
    }
  ];

  const handleWalletClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newCount = walletClicks + 1;
    setWalletClicks(newCount);

    if (newCount === 5) {
      onAdminAccess?.();
      toast({
        title: "Admin Panel",
        description: "Welcome to admin panel!"
      });
      setWalletClicks(0);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setWalletClicks(0);
    }, 2000);

    onTabChange('wallet');
  };

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
    <div className="fixed bottom-0 left-0 right-0 bg-black p-1">
      <div className="flex justify-center items-end max-w-sm mx-auto px-1">
        {navItems.map(({ id, icon: Icon, label, special }) => (
          <div key={id} className={`flex flex-col items-center ${special ? 'mx-1' : 'flex-1'}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col gap-0.5 transition-all duration-300 rounded-none border-none bg-transparent hover:bg-transparent ${
                special 
                  ? activeTab === id 
                    ? 'text-pink-500 h-10 w-10 p-0' 
                    : 'text-white/70 hover:text-white h-8 w-8 p-0'
                  : activeTab === id
                    ? 'text-pink-500 h-auto p-0.5 min-h-8'
                    : 'text-white/70 hover:text-white h-auto p-0.5 min-h-8'
              }`}
              onClick={id === 'wallet' ? handleWalletClick : () => onTabChange(id)}
            >
              <Icon className={special ? "h-5 w-5" : "h-3.5 w-3.5"} />
              {!special && <span className="text-xs font-medium">{label}</span>}
            </Button>
            {special && (
              <span className="text-xs font-medium text-white/80 mt-0.5">{label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
