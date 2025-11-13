import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`fixed top-4 left-4 z-50 hover:bg-slate-100 ${className}`}
    >
      <ChevronLeft className="w-5 h-5 mr-2" />
      Back
    </Button>
  );
};

export default BackButton; 