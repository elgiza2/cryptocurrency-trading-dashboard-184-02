
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTonWallet } from '@/hooks/useTonWallet';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export const WalletConnectionTest = () => {
  const { isConnected, walletAddress, balance, connectWallet, tonConnectUI } = useTonWallet();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: TonConnect UI Instance
    console.log('🧪 Test 1: TonConnect UI Instance');
    try {
      if (tonConnectUI) {
        testResults.push({
          name: 'TonConnect UI',
          status: 'success',
          message: 'TonConnect UI initialized successfully',
          details: 'UI instance available'
        });
      } else {
        testResults.push({
          name: 'TonConnect UI',
          status: 'error',
          message: 'TonConnect UI not initialized',
          details: 'UI instance missing'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'TonConnect UI',
        status: 'error',
        message: 'Error checking TonConnect UI',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Manifest File
    console.log('🧪 Test 2: Manifest File');
    try {
      const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
      const response = await fetch(manifestUrl);
      
      if (response.ok) {
        const manifest = await response.json();
        if (manifest.url && manifest.name && manifest.iconUrl) {
          testResults.push({
            name: 'Manifest File',
            status: 'success',
            message: 'Manifest file loaded and valid',
            details: `URL: ${manifest.url}`
          });
        } else {
          testResults.push({
            name: 'Manifest File',
            status: 'warning',
            message: 'Manifest file missing required fields',
            details: 'Check url, name, iconUrl fields'
          });
        }
      } else {
        testResults.push({
          name: 'Manifest File',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: `Failed to load from ${manifestUrl}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Manifest File',
        status: 'error',
        message: 'Error loading manifest',
        details: error instanceof Error ? error.message : 'Network error'
      });
    }

    // Test 3: Wallet Connection
    console.log('🧪 Test 3: Wallet Connection');
    if (isConnected && walletAddress) {
      testResults.push({
        name: 'Wallet Connection',
        status: 'success',
        message: 'Wallet connected successfully',
        details: `Address: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
      });
    } else {
      testResults.push({
        name: 'Wallet Connection',
        status: 'warning',
        message: 'Wallet not connected',
        details: 'Click connect to establish connection'
      });
    }

    // Test 4: Balance Fetching
    console.log('🧪 Test 4: Balance Fetching');
    if (isConnected && walletAddress) {
      try {
        const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            testResults.push({
              name: 'Balance API',
              status: 'success',
              message: 'Balance fetched successfully',
              details: `Balance: ${balance || 'Loading...'} TON`
            });
          } else {
            testResults.push({
              name: 'Balance API',
              status: 'error',
              message: 'Balance API returned error',
              details: data.error || 'Unknown API error'
            });
          }
        } else {
          testResults.push({
            name: 'Balance API',
            status: 'error',
            message: 'Failed to fetch balance',
            details: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Balance API',
          status: 'error',
          message: 'Balance fetch error',
          details: error instanceof Error ? error.message : 'Network error'
        });
      }
    } else {
      testResults.push({
        name: 'Balance API',
        status: 'warning',
        message: 'Wallet not connected for balance test',
        details: 'Connect wallet first'
      });
    }

    setTests(testResults);
    setIsRunning(false);
    console.log('✅ All tests completed');
  };

  useEffect(() => {
    // Run tests automatically on mount
    runTests();
  }, [isConnected, walletAddress]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-success/20 text-success border-success/30',
      error: 'bg-destructive/20 text-destructive border-destructive/30',
      warning: 'bg-warning/20 text-warning border-warning/30',
      loading: 'bg-primary/20 text-primary border-primary/30'
    };
    
    return variants[status];
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>اختبار اتصال المحفظة</span>
          <Button
            onClick={runTests}
            disabled={isRunning}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'جاري الاختبار...' : 'إعادة الاختبار'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-card/30 rounded-lg border border-border/50">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(test.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground">{test.name}</h4>
                <Badge className={getStatusBadge(test.status)}>
                  {test.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{test.message}</p>
              {test.details && (
                <p className="text-xs text-muted-foreground/70 font-mono">
                  {test.details}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {!isConnected && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground mb-3">لاختبار كامل، اربط محفظتك أولاً:</p>
            <Button onClick={connectWallet} className="w-full">
              ربط محفظة TON
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
