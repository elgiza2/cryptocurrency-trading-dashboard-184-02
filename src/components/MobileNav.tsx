
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ id, icon: Icon, label, special }) => (
          <div key={id} className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col gap-1 transition-all duration-300 rounded-lg border-none bg-transparent hover:bg-transparent p-2 relative ${
                special 
                  ? 'h-16 w-16' 
                  : 'h-auto'
              }`}
              onClick={() => onTabChange(id)}
            >
              <div className={`relative flex items-center justify-center ${
                special 
                  ? 'h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/50' 
                  : ''
              }`}>
                <Icon className={`${special ? "h-6 w-6 text-white" : "h-5 w-5"} ${
                  activeTab === id 
                    ? special ? 'text-white' : 'text-pink-500'
                    : 'text-gray-400'
                }`} />
                {id === 'missions' && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    23
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium ${
                activeTab === id 
                  ? special ? 'text-white' : 'text-pink-500'
                  : 'text-gray-400'
              }`}>
                {label}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
