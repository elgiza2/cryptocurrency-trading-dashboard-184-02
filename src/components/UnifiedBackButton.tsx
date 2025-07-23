
import React, { useEffect } from 'react';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';

interface UnifiedBackButtonProps {
  onBack: () => void;
  title: string;
}

const UnifiedBackButton = ({ onBack, title }: UnifiedBackButtonProps) => {
  // Enable Telegram back button
  useTelegramBackButton({ onBack, enabled: true });

  return (
    <div className="flex items-center gap-3 pt-4 pb-2 px-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="text-white hover:bg-white/10 p-2 rounded-xl"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
  );
};

export default UnifiedBackButton;
