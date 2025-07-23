import { useEffect } from 'react';

interface TelegramBackButtonOptions {
  onBack?: () => void;
  enabled?: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        ready: () => void;
      };
    };
  }
}

export const useTelegramBackButton = ({ onBack, enabled = true }: TelegramBackButtonOptions = {}) => {
  useEffect(() => {
    if (!window.Telegram?.WebApp?.BackButton || !enabled) return;

    const backButton = window.Telegram.WebApp.BackButton;
    
    // Show back button
    backButton.show();

    // Set up click handler
    const handleBackClick = () => {
      if (onBack) {
        onBack();
      } else {
        // Default behavior - go back in history
        window.history.back();
      }
    };

    backButton.onClick(handleBackClick);

    // Cleanup
    return () => {
      backButton.offClick(handleBackClick);
      if (!enabled) {
        backButton.hide();
      }
    };
  }, [onBack, enabled]);

  const showBackButton = () => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
    }
  };

  return {
    showBackButton,
    hideBackButton
  };
};