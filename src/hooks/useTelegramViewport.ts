
import { useState, useEffect } from 'react';

interface TelegramViewport {
  isExpanded: boolean;
  height: number;
  stableHeight: number;
  safeAreaInsetTop: number;
}

export const useTelegramViewport = () => {
  const [viewport, setViewport] = useState<TelegramViewport>({
    isExpanded: false,
    height: window.innerHeight,
    stableHeight: window.innerHeight,
    safeAreaInsetTop: 0
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      console.log('Telegram WebApp not available, using fallback');
      return;
    }

    // تمكين وضع ملء الشاشة تلقائياً
    tg.expand();
    
    // حساب safe area inset top
    const calculateSafeAreaTop = () => {
      // محاولة الحصول على القيمة من CSS
      const cssValue = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-top')
        .trim();
      
      if (cssValue) {
        return parseInt(cssValue.replace('px', '')) || 0;
      }
      
      // قيم افتراضية حسب نوع الجهاز
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('iphone')) {
        return 44; // iPhone status bar height
      } else if (userAgent.includes('android')) {
        return 24; // Android status bar height
      }
      
      return 20; // قيمة افتراضية
    };

    const updateViewport = () => {
      const safeAreaTop = calculateSafeAreaTop();
      
      setViewport({
        isExpanded: tg.isExpanded,
        height: tg.viewportHeight || window.innerHeight,
        stableHeight: tg.viewportStableHeight || window.innerHeight,
        safeAreaInsetTop: tg.isExpanded ? safeAreaTop : 0
      });
      
      // تحديث CSS variables
      document.documentElement.style.setProperty(
        '--telegram-viewport-height', 
        `${tg.viewportHeight || window.innerHeight}px`
      );
      document.documentElement.style.setProperty(
        '--telegram-safe-area-top', 
        `${tg.isExpanded ? safeAreaTop : 0}px`
      );
    };

    // مراقبة تغييرات viewport
    tg.onEvent('viewportChanged', updateViewport);
    
    // تحديث أولي
    updateViewport();
    
    // تنظيف
    return () => {
      tg.offEvent('viewportChanged', updateViewport);
    };
  }, []);

  return viewport;
};
