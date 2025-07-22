
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';
import { ReactNode, useEffect, useState } from 'react';

interface TonConnectProviderProps {
  children: ReactNode;
}

const TonConnectProvider = ({ children }: TonConnectProviderProps) => {
  const [manifestReady, setManifestReady] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
  
  console.log('🔧 TonConnect Provider initializing...');
  console.log('📄 Manifest URL:', manifestUrl);
  console.log('🌐 Window location origin:', window.location.origin);
  
  // Enhanced manifest testing with better error handling
  useEffect(() => {
    const testManifest = async () => {
      console.log('🧪 Testing manifest accessibility...');
      try {
        const response = await fetch(manifestUrl, {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        console.log('📄 Manifest fetch response:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Manifest content loaded successfully:', data);
        
        // Validate manifest structure
        if (!data.url || !data.name || !data.iconUrl) {
          throw new Error('Manifest missing required fields');
        }
        
        setManifestReady(true);
        setManifestError(null);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown manifest error';
        console.error('❌ Failed to fetch manifest:', errorMsg);
        setManifestError(errorMsg);
        
        // Still allow provider to load for development
        setManifestReady(true);
      }
    };

    testManifest();
  }, [manifestUrl]);

  // Enhanced loading screen with error display
  if (!manifestReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white">جاري تحميل محفظة TON...</div>
          {manifestError && (
            <div className="text-red-400 text-sm max-w-sm">
              خطأ في تحميل البيان: {manifestError}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      restoreConnection={true}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me',
        returnStrategy: 'back',
        skipRedirectToWallet: 'never'
      }}
      uiPreferences={{
        theme: THEME.DARK,
        borderRadius: 'm',
        colorsSet: {
          [THEME.DARK]: {
            connectButton: {
              background: '#1a1a1a',
              foreground: '#ffffff'
            },
            accent: '#0066cc',
            telegramButton: '#0088cc',
            icon: {
              primary: '#ffffff',
              secondary: '#808080',
              tertiary: '#404040',
              success: '#4caf50',
              error: '#f44336'
            },
            background: {
              primary: '#000000',
              secondary: '#1a1a1a',
              segment: '#2a2a2a'
            },
            text: {
              primary: '#ffffff',
              secondary: '#cccccc'
            }
          }
        }
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
};

export default TonConnectProvider;
