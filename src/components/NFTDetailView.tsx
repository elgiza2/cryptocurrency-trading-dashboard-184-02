import { Button } from "@/components/ui/button";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useToast } from "@/hooks/use-toast";
import { DatabaseService } from "@/lib/database";
import { useState } from "react";
interface NFTDetailProps {
  nft: {
    id: string;
    name: string;
    price: number;
    image: string;
    remaining: number;
    total: number;
    miningPower: number;
  };
  onClose: () => void;
  telegramUser: any;
}
const NFTDetailView = ({
  nft,
  onClose,
  telegramUser
}: NFTDetailProps) => {
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handlePurchaseNFT = async () => {
    if (!tonConnectUI.wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your TON wallet first",
        variant: "destructive"
      });
      return;
    }
    if (!telegramUser?.id) {
      toast({
        title: "Error",
        description: "Telegram user not found",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [{
          address: "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq",
          amount: (nft.price * 1_000_000_000).toString()
        }]
      };
      await tonConnectUI.sendTransaction(transaction);
      const {
        error
      } = await DatabaseService.createNFTPurchase(telegramUser.id.toString(), nft.id, nft.price, nft.miningPower);
      if (error) {
        console.error('Database error:', error);
      }
      toast({
        title: "NFT Purchased!",
        description: `Successfully purchased ${nft.name} for ${nft.price} TON`
      });
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase NFT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-lg">Back</span>
        </div>
        
      </div>

      <div className="flex flex-col items-center justify-center flex-1 p-6">
        {/* NFT Image */}
        <div className="w-80 h-80 mb-8 rounded-3xl overflow-hidden p-6">
          <img src={nft.image} alt={nft.name} className="w-full h-full object-contain" />
        </div>

        {/* NFT Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {nft.name}
          </h1>
          <p className="text-lg text-zinc-50">This NFT will soon let you mine even more TON !</p>
        </div>

        {/* Price and Supply Info */}
        <div className="flex gap-4 mb-8">
          <div className="px-6 py-3">
            <span className="text-blue-400 text-xl font-bold">{nft.price} TON</span>
          </div>
          <div className="px-6 py-3">
            <span className="text-purple-400 text-xl font-bold">{nft.remaining} NFT left</span>
          </div>
        </div>

        {/* Connect Wallet Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          {tonConnectUI.wallet ? <Button onClick={handlePurchaseNFT} disabled={isLoading || nft.remaining === 0} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 text-lg font-medium rounded-2xl border border-gray-600">
              {isLoading ? "Processing..." : nft.remaining === 0 ? "Sold Out" : `Buy for ${nft.price} TON`}
            </Button> : <Button onClick={() => tonConnectUI.openModal()} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 text-lg font-medium rounded-2xl border border-gray-600">
              Connect Wallet
            </Button>}
        </div>
      </div>
    </div>;
};
export default NFTDetailView;