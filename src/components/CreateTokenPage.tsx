import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { 
  ArrowLeft,
  Plus,
  Send,
  Globe,
  Twitter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateTokenPage = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState(1);
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const [tokenData, setTokenData] = useState({
    name: "",
    ticker: "",
    description: "",
    telegram: "",
    website: "",
    twitter: "",
    icon: null as File | null,
    totalSupply: ""
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTokenData(prev => ({ ...prev, icon: file }));
    }
  };

  const handleCreateToken = async () => {
    try {
      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        messages: [
          {
            address: "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq", // TON receiver address
            amount: "1000000000", // 1 TON in nanotons
            payload: `Create token: ${tokenData.name} (${tokenData.ticker})`
          }
        ]
      };

      await tonConnectUI.sendTransaction(transaction);
      
      // Create token in database after successful transaction
      const { data: newToken, error: dbError } = await supabase
        .from('cryptocurrencies')
        .insert({
          name: tokenData.name,
          symbol: tokenData.ticker,
          current_price: 0.001, // Starting price
          icon_url: tokenData.icon ? URL.createObjectURL(tokenData.icon) : null,
          description: tokenData.description || null,
          website_url: tokenData.website || null,
          telegram_url: tokenData.telegram || null,
          twitter_url: tokenData.twitter || null
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Give creator 10% of total supply
      if (newToken && tokenData.totalSupply) {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          const creatorAmount = (parseFloat(tokenData.totalSupply) * 0.1);
          await supabase.from('wallet_holdings').insert({
            user_id: user.data.user.id,
            cryptocurrency_id: newToken.id,
            balance: creatorAmount
          });
        }
      }
      
      toast({
        title: "Token Created Successfully",
        description: `You received ${(parseFloat(tokenData.totalSupply) * 0.1).toLocaleString()} ${tokenData.ticker} tokens as creator bonus!`,
      });
      
      onBack();
    } catch (error) {
      console.error('Transaction failed:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to create token. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Progress */}
      <div className="w-full bg-muted/20 rounded-full h-1">
        <div className="bg-gradient-to-r from-yellow-500 to-pink-500 h-1 rounded-full w-1/3 transition-all duration-500"></div>
      </div>

      {/* Header */}
      <div className="glass-card p-4 rounded-2xl bg-muted/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-black">1</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Token Information</h1>
            <p className="text-xs text-muted-foreground">Enter basic token details</p>
          </div>
        </div>

        {/* Icon Upload */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-sm mb-1 text-white">Token Image</h3>
            <p className="text-xs text-muted-foreground">Upload an image or GIF</p>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-yellow-500/50 hover:border-yellow-500 transition-all group">
                {tokenData.icon ? (
                  <img 
                    src={URL.createObjectURL(tokenData.icon)} 
                    alt="Token icon" 
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <Plus className="h-6 w-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-base font-semibold text-white">Token Name</label>
            <span className="text-xs text-muted-foreground">{tokenData.name.length}/50</span>
          </div>
          <Input
            placeholder="e.g. Awesome Token"
            value={tokenData.name}
            onChange={(e) => setTokenData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-muted/30 border-muted-foreground/30 h-12 rounded-xl text-lg focus:border-yellow-500 text-white"
            maxLength={50}
          />
        </div>

        {/* Ticker Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-base font-semibold text-white">Token Symbol</label>
            <span className="text-xs text-muted-foreground">{tokenData.ticker.length}/10</span>
          </div>
          <Input
            placeholder="e.g. AWESOME"
            value={tokenData.ticker.toUpperCase()}
            onChange={(e) => setTokenData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
            className="bg-muted/30 border-muted-foreground/30 h-12 rounded-xl text-lg font-bold focus:border-yellow-500 text-white"
            maxLength={10}
          />
        </div>

        {/* Total Supply Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-base font-semibold text-white">Total Supply</label>
          </div>
          <Input
            placeholder="e.g. 1000000"
            value={tokenData.totalSupply}
            onChange={(e) => setTokenData(prev => ({ ...prev, totalSupply: e.target.value }))}
            className="bg-muted/30 border-muted-foreground/30 h-12 rounded-xl text-lg focus:border-yellow-500 text-white"
            type="number"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-base font-semibold text-white">Token Description</label>
            <span className="text-xs text-muted-foreground">{tokenData.description.length}/300</span>
          </div>
          <Textarea
            placeholder="Describe the purpose of your token and benefits it will provide to the community..."
            value={tokenData.description}
            onChange={(e) => setTokenData(prev => ({ ...prev, description: e.target.value }))}
            className="bg-muted/30 border-muted-foreground/30 rounded-xl resize-none focus:border-yellow-500 text-white"
            rows={4}
            maxLength={300}
          />
        </div>
      </div>

      {/* Continue Button */}
      <Button 
        onClick={() => setStep(2)}
        className="w-full bg-yellow-500 text-black h-10 text-sm font-bold rounded-xl hover:bg-yellow-600"
        disabled={!tokenData.name.trim() || !tokenData.ticker.trim() || !tokenData.totalSupply.trim() || tokenData.name.length < 3 || tokenData.ticker.length < 2}
      >
        Continue to Social Links
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Progress */}
      <div className="w-full bg-muted/20 rounded-full h-2">
        <div className="bg-gradient-to-r from-yellow-500 to-pink-500 h-2 rounded-full w-2/3 transition-all duration-500"></div>
      </div>

      {/* Header */}
      <div className="glass-card p-6 rounded-3xl bg-muted/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">2</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Social Presence</h1>
            <p className="text-muted-foreground">Connect your community channels</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          {/* Telegram */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-white">Telegram</span>
              <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">Optional</span>
            </div>
            <Input
              placeholder="@your_telegram_channel"
              value={tokenData.telegram}
              onChange={(e) => setTokenData(prev => ({ ...prev, telegram: e.target.value }))}
              className="bg-muted/30 border-muted-foreground/30 h-12 rounded-xl text-base focus:border-yellow-500 text-white"
            />
          </div>

          {/* Website */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-pink-500" />
              <span className="font-semibold text-white">Website</span>
              <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">Optional</span>
            </div>
            <Input
              placeholder="https://yourtoken.com"
              value={tokenData.website}
              onChange={(e) => setTokenData(prev => ({ ...prev, website: e.target.value }))}
              className="bg-muted/30 border-muted-foreground/30 h-12 rounded-xl text-base focus:border-yellow-500 text-white"
            />
          </div>

          {/* Twitter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">Twitter</span>
              <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">Optional</span>
            </div>
            <Input
              placeholder="@your_twitter"
              value={tokenData.twitter}
              onChange={(e) => setTokenData(prev => ({ ...prev, twitter: e.target.value }))}
              className="bg-muted/30 border-muted-foreground/30 h-12 rounded-xl text-base focus:border-yellow-500 text-white"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={() => setStep(1)}
          variant="outline"
          className="flex-1 h-14 text-base font-medium rounded-2xl border-muted hover:bg-muted/20 text-white"
        >
          Back
        </Button>
        <Button 
          onClick={() => setStep(3)}
          className="flex-1 bg-pink-500 text-white h-14 text-base font-medium rounded-2xl hover:bg-pink-600"
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Progress */}
      <div className="w-full bg-muted/20 rounded-full h-2">
        <div className="bg-gradient-to-r from-yellow-500 to-pink-500 h-2 rounded-full w-full transition-all duration-500"></div>
      </div>

      {/* Header */}
      <div className="glass-card p-6 rounded-3xl bg-muted/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">3</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Review & Deploy</h1>
            <p className="text-muted-foreground">Confirm token details</p>
          </div>
        </div>

        {/* Token Preview */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-pink-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {tokenData.icon ? (
              <img 
                src={URL.createObjectURL(tokenData.icon)} 
                alt="Token icon" 
                className="w-16 h-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{tokenData.ticker.charAt(0) || "T"}</span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{tokenData.name || "Token Name"}</h3>
              <p className="text-lg font-mono text-yellow-500">${tokenData.ticker || "SYMBOL"}</p>
              <p className="text-sm text-muted-foreground">Total Supply: {tokenData.totalSupply ? Number(tokenData.totalSupply).toLocaleString() : "0"}</p>
            </div>
          </div>
          
          {tokenData.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tokenData.description}
            </p>
          )}
        </div>

        {/* Creation Cost */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Creation Cost</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Token Creation Fee</span>
              <span className="font-medium text-white">1.0 TON</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-yellow-500">1.0 TON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={() => setStep(2)}
          variant="outline"
          className="flex-1 h-14 text-base font-medium rounded-2xl border-muted hover:bg-muted/20 text-white"
        >
          Back
        </Button>
        {!tonConnectUI.connected ? (
          <Button 
            onClick={() => tonConnectUI.connectWallet()}
            className="flex-1 bg-blue-500 text-white h-14 text-base font-medium rounded-2xl hover:bg-blue-600"
          >
            Connect Wallet
          </Button>
        ) : (
          <Button 
            onClick={handleCreateToken}
            className="flex-1 bg-green-500 text-white h-14 text-base font-medium rounded-2xl hover:bg-green-600"
          >
            Create Token (1 TON)
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={step === 1 ? onBack : () => setStep(step - 1)} 
            className="h-10 w-10 text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold text-white">Create Token</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default CreateTokenPage;