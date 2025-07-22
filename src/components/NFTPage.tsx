import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useToast } from "@/hooks/use-toast";
import { DatabaseService } from "@/lib/database";
import NFTDetailView from "./NFTDetailView";
import UnifiedBackButton from "./UnifiedBackButton";

interface NFTPageProps {
  onBack?: () => void;
}

interface NFTItem {
  id: string;
  name: string;
  price: number;
  image: string;
  remaining: number;
  total: number;
  miningPower: number;
}

const NFT_ITEMS: NFTItem[] = [
  {
    id: "nft-1",
    name: "Steel Warrior",
    price: 1,
    image: "/lovable-uploads/c2cf09ca-6d44-4fe6-8a3f-61301ba2403f.png",
    remaining: 1847,
    total: 2000,
    miningPower: 1
  },
  {
    id: "nft-2",
    name: "Crystal Mage",
    price: 5,
    image: "/lovable-uploads/4fe8b0ab-e55b-48e1-ab0c-83a72b71b5dc.png",
    remaining: 1923,
    total: 2000,
    miningPower: 5
  },
  {
    id: "nft-3",
    name: "Golden Knight",
    price: 10,
    image: "/lovable-uploads/79761367-4a78-4080-afd6-59d892368c80.png",
    remaining: 788,
    total: 2000,
    miningPower: 10
  },
  {
    id: "nft-4",
    name: "Cyber Guardian",
    price: 25,
    image: "/lovable-uploads/675e42e0-d859-41c4-98b5-17ea7acaf102.png",
    remaining: 395,
    total: 2000,
    miningPower: 25
  },
  {
    id: "nft-5",
    name: "Epic Titan",
    price: 50,
    image: "/lovable-uploads/637bf18e-3340-4bc8-84f4-7c197738c2a2.png",
    remaining: 199,
    total: 2000,
    miningPower: 50
  },
  {
    id: "nft-6",
    name: "Diamond Legend",
    price: 100,
    image: "/lovable-uploads/eff8b802-752d-4b3d-8fa9-d49dd57c4f6e.png",
    remaining: 98,
    total: 2000,
    miningPower: 100
  }
];

const NFTPage = ({ onBack }: NFTPageProps) => {
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initTelegramData = () => {
      if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        setTelegramUser((window as any).Telegram.WebApp.initDataUnsafe.user);
      }
    };

    initTelegramData();
    const timeout = setTimeout(initTelegramData, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handlePurchaseNFT = async (nft: NFTItem) => {
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

      const { error } = await DatabaseService.createNFTPurchase(telegramUser.id.toString(), nft.id, nft.price, nft.miningPower);
      if (error) {
        console.error('Database error:', error);
      }

      toast({
        title: "NFT Purchased!",
        description: `Successfully purchased ${nft.name} for ${nft.price} TON`
      });
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

  if (selectedNFT) {
    return <NFTDetailView nft={selectedNFT} onClose={() => setSelectedNFT(null)} telegramUser={telegramUser} />;
  }

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white">
        {/* Unified Header */}
        {onBack && <UnifiedBackButton onBack={onBack} title="NFT Miners" />}

        <div className="p-6">
          {/* Title */}
          <div className="mb-8">
            <p className="text-blue-200 text-lg">
              Presale of characters that will soon let you mine even more TON
            </p>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-2 gap-4">
            {NFT_ITEMS.map(nft => (
              <div key={nft.id} className="cursor-pointer hover:opacity-80 transition-all duration-200" onClick={() => setSelectedNFT(nft)}>
                <div className="aspect-square p-0">
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-contain rounded-2xl" />
                </div>
                
                <div className="p-2 pt-3">
                  <h3 className="text-white font-bold text-lg mb-1 truncate">
                    {nft.name}
                  </h3>
                  
                  <p className="text-blue-200 text-sm">
                    {nft.remaining} NFT left
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Connect Wallet Button */}
          {!tonConnectUI.wallet && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-blue-950 to-transparent">
              <Button 
                onClick={() => tonConnectUI.openModal()} 
                className="w-full bg-blue-700 hover:bg-blue-600 text-white py-4 text-lg font-medium rounded-2xl border border-blue-500"
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default NFTPage;
