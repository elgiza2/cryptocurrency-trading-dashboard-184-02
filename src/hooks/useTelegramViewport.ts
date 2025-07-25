
import { useState, useEffect, useCallback } from 'react';

interface TelegramViewport {
  isExpanded: boolean;
  height: number;
  stableHeight: number;
  safeAreaInsetTop: number;
  safeAreaInsetBottom: number;
  isFullscreen: boolean;
}

export const useTelegramViewport = () => {
  const [viewport, setViewport] = useState<TelegramViewport>({
    isExpanded: false,
    height: window.innerHeight,
    stableHeight: window.innerHeight,
    safeAreaInsetTop: 0,
    safeAreaInsetBottom: 0,
    isFullscreen: false
  });

  const updateCSSVariables = useCallback((viewportData: TelegramViewport) => {
    const root = document.documentElement;
    
    // Update viewport height variables
    root.style.setProperty('--telegram-viewport-height', `${viewportData.height}px`);
    root.style.setProperty('--telegram-viewport-stable-height', `${viewportData.stableHeight}px`);
    
    // Update safe area variables
    root.style.setProperty('--telegram-safe-area-top', `${viewportData.safeAreaInsetTop}px`);
    root.style.setProperty('--telegram-safe-area-bottom', `${viewportData.safeAreaInsetBottom}px`);
    
    console.log('Updated CSS variables:', {
      height: viewportData.height,
      stableHeight: viewportData.stableHeight,
      safeAreaTop: viewportData.safeAreaInsetTop,
      safeAreaBottom: viewportData.safeAreaInsetBottom
    });
  }, []);

  const calculateSafeAreaInsets = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    let topInset = 0;
    let bottomInset = 0;

    if (tg && tg.isExpanded) {
      // Try to get safe area from CSS environment variables
      const cssTop = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-top')
        .trim();
      const cssBottom = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-bottom')
        .trim();

      if (cssTop) {
        topInset = parseInt(cssTop.replace('px', '')) || 0;
      }
      if (cssBottom) {
        bottomInset = parseInt(cssBottom.replace('px', '')) || 0;
      }

      // Fallback to device-specific values if CSS values not available
      if (topInset === 0) {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('iphone')) {
          // iPhone with notch/dynamic island
          if (window.screen.height >= 812) {
            topInset = 44;
          } else {
            topInset = 20;
          }
        } else if (userAgent.includes('android')) {
          topInset = 24;
        } else {
          topInset = 20;
        }
      }

      // Bottom safe area (for home indicator on newer iPhones)
      if (bottomInset === 0) {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('iphone') && window.screen.height >= 812) {
          bottomInset = 34;
        }
      }
    }

    return { topInset, bottomInset };
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      console.log('Telegram WebApp not available, using fallback values');
      const fallbackViewport = {
        isExpanded: false,
        height: window.innerHeight,
        stableHeight: window.innerHeight,
        safeAreaInsetTop: 0,
        safeAreaInsetBottom: 0,
        isFullscreen: false
      };
      setViewport(fallbackViewport);
      updateCSSVariables(fallbackViewport);
      return;
    }

    // Enable fullscreen mode
    try {
      tg.expand();
    } catch (error) {
      console.error('Error expanding Telegram WebApp:', error);
    }
    
    const updateViewport = () => {
      try {
        const { topInset, bottomInset } = calculateSafeAreaInsets();
        
        const newViewport = {
          isExpanded: tg.isExpanded || false,
          height: tg.viewportHeight || window.innerHeight,
          stableHeight: tg.viewportStableHeight || window.innerHeight,
          safeAreaInsetTop: topInset,
          safeAreaInsetBottom: bottomInset,
          isFullscreen: tg.isExpanded || false
        };
        
        setViewport(newViewport);
        updateCSSVariables(newViewport);
        
        console.log('Telegram viewport updated:', newViewport);
      } catch (error) {
        console.error('Error updating viewport:', error);
      }
    };

    // Listen for viewport changes
    try {
      tg.onEvent('viewportChanged', updateViewport);
      tg.onEvent('themeChanged', updateViewport);
    } catch (error) {
      console.error('Error setting up Telegram event listeners:', error);
    }
    
    // Initial update
    updateViewport();
    
    // Also listen for window resize as fallback
    const handleWindowResize = () => {
      console.log('Window resized:', { width: window.innerWidth, height: window.innerHeight });
      setTimeout(updateViewport, 100);
    };
    
    const handleOrientationChange = () => {
      console.log('Orientation changed');
      setTimeout(updateViewport, 300);
    };
    
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Cleanup
    return () => {
      try {
        tg.offEvent('viewportChanged', updateViewport);
        tg.offEvent('themeChanged', updateViewport);
      } catch (error) {
        console.error('Error removing Telegram event listeners:', error);
      }
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [calculateSafeAreaInsets, updateCSSVariables]);

  return viewport;
};
