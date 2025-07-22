
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
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-3">
      <div className="flex justify-center items-end max-w-md mx-auto relative">
        {/* Left buttons */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(0, 2).map(({ id, icon: Icon, label }) => (
            <div key={id} className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col gap-1 transition-all duration-300 rounded-lg border-none bg-transparent hover:bg-transparent p-2"
                onClick={() => onTabChange(id)}
              >
                <Icon className={`h-5 w-5 ${
                  activeTab === id ? 'text-pink-500' : 'text-gray-400'
                }`} />
                <span className={`text-xs font-medium ${
                  activeTab === id ? 'text-pink-500' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </Button>
            </div>
          ))}
        </div>

        {/* Center Roulette button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center transition-all duration-300 rounded-full border-none bg-transparent hover:bg-transparent p-0 hover:scale-110"
            onClick={() => onTabChange('roulette')}
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl shadow-pink-500/50 flex items-center justify-center animate-pulse">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
          </Button>
        </div>

        {/* Right buttons */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(3).map(({ id, icon: Icon, label }) => (
            <div key={id} className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col gap-1 transition-all duration-300 rounded-lg border-none bg-transparent hover:bg-transparent p-2"
                onClick={() => onTabChange(id)}
              >
                <Icon className={`h-5 w-5 ${
                  activeTab === id ? 'text-pink-500' : 'text-gray-400'
                }`} />
                <span className={`text-xs font-medium ${
                  activeTab === id ? 'text-pink-500' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
