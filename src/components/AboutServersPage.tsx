
import { ScrollArea } from "@/components/ui/scroll-area";
import UnifiedBackButton from "./UnifiedBackButton";

interface AboutServersPageProps {
  onBack?: () => void;
}

const AboutServersPage = ({ onBack }: AboutServersPageProps) => {
  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen text-foreground">
        
        {/* Unified Header */}
        {onBack && <UnifiedBackButton onBack={onBack} title="VIRAL" />}

        <div className="p-4 space-y-4">
          {/* Compact Logo */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">V</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              VIRAL
            </h1>
          </div>

          {/* Compact Content */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h2 className="text-lg font-bold text-blue-100 mb-2">About VIRAL</h2>
              <p className="text-blue-200 text-sm leading-relaxed">
                VIRAL is an AI platform accessible via Telegram bot that enables automated mining and rewards. 
                Access it at https://t.me/Viralelbot?startapp
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-base font-semibold text-blue-100 mb-2">How it Works</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>• Connect with AI-powered mining</li>
                <li>• Earn passive VIRAL rewards daily</li>
                <li>• Automated 24/7 mining operations</li>
                <li>• Intelligent reward optimization</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-base font-semibold text-blue-100 mb-2">Benefits</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>• AI-powered mining platform</li>
                <li>• No maintenance required</li>
                <li>• Transparent earnings</li>
                <li>• Telegram integration</li>
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
