
import { ScrollArea } from "@/components/ui/scroll-area";
import UnifiedBackButton from "./UnifiedBackButton";

interface AboutServersPageProps {
  onBack?: () => void;
}

const AboutServersPage = ({ onBack }: AboutServersPageProps) => {
  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white">
        
        {/* Unified Header */}
        {onBack && <UnifiedBackButton onBack={onBack} title="Space Verse" />}

        <div className="p-4 space-y-4">
          {/* Compact Logo */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">SV</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Space Verse
            </h1>
          </div>

          {/* Compact Content */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h2 className="text-lg font-bold text-blue-100 mb-2">About Mining</h2>
              <p className="text-blue-200 text-sm leading-relaxed">
                Space Verse allows you to rent virtual servers that mine cryptocurrency 24/7. 
                Each server provides passive income in TON tokens.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-base font-semibold text-blue-100 mb-2">How it Works</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>• Rent servers with different mining power</li>
                <li>• Earn passive TON income daily</li>
                <li>• Servers run for 30 days automatically</li>
                <li>• Higher tier servers = more income</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-base font-semibold text-blue-100 mb-2">Benefits</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>• 24/7 passive income</li>
                <li>• No maintenance required</li>
                <li>• Transparent earnings</li>
                <li>• Multiple server options</li>
              </ul>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default AboutServersPage;
