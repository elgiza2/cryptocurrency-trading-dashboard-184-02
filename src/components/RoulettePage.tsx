import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { TonTransactionService } from '@/services/tonTransactionService';
import UnifiedBackButton from "./UnifiedBackButton";
import { useTelegramViewport } from '@/hooks/useTelegramViewport';
interface RoulettePageProps {
  onBack?: () => void;
  onNavigateToReferral?: () => void;
  userBalance?: {
    space: number;
    ton: number;
  };
  onHideNavigation?: (hide: boolean) => void;
}
const RoulettePage = ({
  onBack,
  onNavigateToReferral,
  userBalance = {
    space: 0.8001,
    ton: 0.12
  },
  onHideNavigation
}: RoulettePageProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSpinPrice, setSelectedSpinPrice] = useState(0.5);
  const [hasFreeSpins, setHasFreeSpins] = useState(false);
  const [showAllPrizes, setShowAllPrizes] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const viewport = useTelegramViewport();
  useEffect(() => {
    console.log('RoulettePage: Viewport state:', viewport);
    onHideNavigation?.(true);
    return () => onHideNavigation?.(false);
  }, [onHideNavigation, viewport]);
  const gifts = [{
    name: "Plush Pepe",
    image: "https://nft.fragment.com/collection/plushpepe.webp",
    price: 4950
  }, {
    name: "Durov's Cap",
    image: "https://nft.fragment.com/collection/durovscap.webp",
    price: 888
  }, {
    name: "Precious Peach",
    image: "https://nft.fragment.com/collection/preciouspeach.webp",
    price: 605
  }, {
    name: "Toy Bears",
    image: "https://client.mineverse.app/static/media/Toy%20Bears.4b17717023cdb2d66425.webp",
    price: 18
  }, {
    name: "Swiss Watch",
    image: "https://nft.fragment.com/collection/swisswatch.webp",
    price: 31
  }, {
    name: "Scared Cat",
    image: "https://nft.fragment.com/collection/scaredcat.webp",
    price: 42.75
  }, {
    name: "Spy Agaric",
    image: "https://nft.fragment.com/collection/spyagaric.webp",
    price: 2.8
  }, {
    name: "Lollipop",
    image: "https://nft.fragment.com/collection/lolpop.webp",
    price: 2
  }, {
    name: "Diamond Ring",
    image: "https://nft.fragment.com/collection/diamondring.webp",
    price: 14
  }, {
    name: "Genie Lamp",
    image: "https://nft.fragment.com/collection/genielamp.webp",
    price: 44
  }, {
    name: "Magic Potion",
    image: "https://nft.fragment.com/collection/magicpotion.webp",
    price: 57
  }, {
    name: "Desk Calendar",
    image: "https://nft.fragment.com/collection/deskcalendar.webp",
    price: 2
  }, {
    name: "Jack in the Box",
    image: "https://nft.fragment.com/collection/jackinthebox.webp",
    price: 2
  }, {
    name: "Jester Hat",
    image: "https://nft.fragment.com/collection/jesterhat.webp",
    price: 2
  }, {
    name: "Hypno Lollipop",
    image: "https://nft.fragment.com/collection/hypnolollipop.webp",
    price: 2
  }, {
    name: "Birthday Candle",
    image: "https://nft.fragment.com/collection/bdaycandle.webp",
    price: 2
  }, {
    name: "Easter Egg",
    image: "https://nft.fragment.com/collection/easteregg.webp",
    price: 2.5
  }, {
    name: "10 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 10
  }, {
    name: "5 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 5
  }, {
    name: "2 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 2
  }, {
    name: "1 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 1
  }, {
    name: "0.5 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 0.5
  }, {
    name: "0.1 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 0.1
  }, {
    name: "0.006 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 0.006
  }, {
    name: "0.0005 TON",
    image: "https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png",
    price: 0.0005
  }, {
    name: "Nothing",
    image: "/nothing-icon.png",
    price: 0
  }];
  const spinPrices = [0.25, 0.5, 1, 2.5, 5];
  const handleSpin = async (isFree = false) => {
    if (isFree && !hasFreeSpins) {
      toast({
        title: "No Free Spins",
        description: "You need to invite 1 friend to spin for free",
        variant: "destructive"
      });
      return;
    }
    if (!isFree) {
      try {
        if (!tonConnectUI?.wallet) {
          toast({
            title: "Wallet Required",
            description: "Please connect your TON wallet to spin",
            variant: "destructive"
          });
          return;
        }
        const transactionService = new TonTransactionService(tonConnectUI);
        toast({
          title: "Processing Transaction",
          description: "Please confirm the TON transaction in your wallet..."
        });

        // Send TON transaction for the spin
        const tonTransactionResult = await transactionService.sendTransaction("UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq",
        // Destination address
        selectedSpinPrice,
        // Amount in TON
        `Roulette Spin: ${selectedSpinPrice} TON` // Comment
        );
        console.log('TON Transaction completed:', tonTransactionResult);
      } catch (error: any) {
        console.error('Error processing spin transaction:', error);
        if (error.message?.includes('User declined')) {
          toast({
            title: "Transaction Cancelled",
            description: "You cancelled the transaction. No charges were made.",
            variant: "destructive"
          });
        } else if (error.message?.includes('Insufficient')) {
          toast({
            title: "Insufficient Balance",
            description: `You need at least ${selectedSpinPrice} TON to spin.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Transaction Failed",
            description: error.message || "Failed to process spin transaction",
            variant: "destructive"
          });
        }
        return;
      }
    }
    setIsSpinning(true);
    setTimeout(() => {
      // Always give "Nothing" prize (last item in gifts array)
      const selectedGift = gifts[gifts.length - 1]; // "Nothing" is now at the last index
      setIsSpinning(false);
      if (isFree) {
        setHasFreeSpins(false);
      }
      toast({
        title: "Congratulations!",
        description: `You won ${selectedGift.name}!`
      });
    }, 3000);
  };
  const displayedGifts = showAllPrizes ? gifts : gifts.slice(0, 4);
  return <div className="h-screen unified-gaming-bg relative overflow-hidden">
      <ScrollArea className="h-full">
        <div 
          className="min-h-screen text-white space-y-3 max-w-md mx-auto" 
          style={{ 
            paddingBottom: viewport.safeAreaInsetBottom ? `${viewport.safeAreaInsetBottom + 144}px` : '144px' 
          }}
        >
          
          {/* Unified Header */}
          {onBack && <UnifiedBackButton onBack={onBack} title="Roulette" />}

          <div className="px-4 space-y-3">
            {/* Free Spin Section */}
            <Card className="bg-secondary/60 backdrop-blur-xl border-white/20 p-3 rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => onNavigateToReferral?.()}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold mb-1 text-blue-100">Free spin</h3>
                  <p className="text-xs text-blue-200">You need to invite 1 friend to spin for free</p>
                </div>
                <ChevronRight className="h-4 w-4 text-blue-300" />
              </div>
            </Card>

            {/* Roulette Wheel */}
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"></div>
              </div>
              
              <div className="bg-secondary/60 backdrop-blur-xl rounded-2xl p-4 pt-8 border border-white/20">
                <div className="overflow-hidden">
                  <div className={`flex gap-4 transition-transform duration-${isSpinning ? '3000' : '300'} ${isSpinning ? 'animate-pulse' : ''}`}>
                    {[...gifts, ...gifts].map((gift, index) => <div key={index} className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-20 h-20 bg-secondary/30 rounded-xl overflow-hidden mb-2">
                          <img src={gift.image} alt={gift.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="bg-blue-600/80 backdrop-blur-sm text-blue-100 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          {gift.name === "Nothing" ? (
                            <span>0</span>
                          ) : (
                            <>
                              <img src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" alt="TON" className="w-3 h-3" />
                              <span>{gift.price}</span>
                            </>
                          )}
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Prize List */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-blue-100">Prize List</h3>
              <div className="backdrop-blur-xl rounded-2xl p-4 border border-white/20 bg-black">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {displayedGifts.map((gift, index) => <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-secondary/30 rounded-xl overflow-hidden mb-2">
                        <img src={gift.image} alt={gift.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="bg-blue-600/80 backdrop-blur-sm text-blue-100 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                        {gift.name === "Nothing" ? (
                          <span>0</span>
                        ) : (
                          <>
                            <img src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" alt="TON" className="w-3 h-3" />
                            <span>{gift.price}</span>
                          </>
                        )}
                      </div>
                    </div>)}
                </div>
                
                <Button variant="ghost" onClick={() => setShowAllPrizes(!showAllPrizes)} className="w-full text-white/70 hover:text-white hover:bg-secondary/30">
                  <span>{showAllPrizes ? "Show less" : "Show all"}</span>
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAllPrizes ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>

      {/* Fixed Spin Controls Above Bottom Navigation */}
      <div 
        className="fixed left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xl p-4 space-y-3 border-t border-white/20 max-w-md mx-auto"
        style={{ 
          bottom: viewport.safeAreaInsetBottom ? `${viewport.safeAreaInsetBottom + 64}px` : '64px',
          zIndex: 50
        }}
      >
        <div className="flex gap-2 justify-center flex-wrap">
          {spinPrices.map(price => (
            <Button 
              key={price} 
              variant={selectedSpinPrice === price ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedSpinPrice(price)} 
              className={`px-3 py-1.5 rounded-full transition-all text-xs ${
                selectedSpinPrice === price 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                  : 'bg-secondary/60 text-white/70 border-white/20 hover:bg-secondary/80'
              }`}
            >
              <img src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" alt="TON" className="w-2.5 h-2.5 mr-1" />
              {price}
            </Button>
          ))}
        </div>
        
        <Button 
          onClick={() => handleSpin(false)} 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 text-base font-bold rounded-2xl shadow-lg shadow-primary/40 transition-all duration-300 transform hover:scale-105" 
          disabled={isSpinning}
        >
          {isSpinning ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Spinning...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" alt="TON" className="w-4 h-4" />
              <span>Spin for {selectedSpinPrice} TON</span>
            </div>
          )}
        </Button>
      </div>

    </div>;
};
export default RoulettePage;