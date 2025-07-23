
import { useEffect } from 'react';

interface UseTelegramBackButtonProps {
  onBack: () => void;
  isVisible: boolean;
}

export const useTelegramBackButton = ({ onBack, isVisible }: UseTelegramBackButtonProps) => {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      console.log('Telegram WebApp not available');
      return;
    }

    if (isVisible) {
      // Show the back button
      tg.BackButton.show();
      
      // Set up the click handler
      tg.BackButton.onClick(onBack);
    } else {
      // Hide the back button
      tg.BackButton.hide();
    }

    // Cleanup: hide button and remove event listener when component unmounts
    return () => {
      if (tg.BackButton) {
        tg.BackButton.hide();
        tg.BackButton.offClick(onBack);
      }
    };
  }, [onBack, isVisible]);
};
