
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function SidebarToggle({ 
  onToggle, 
  isOpen 
}: { 
  onToggle: (isOpen: boolean) => void;
  isOpen: boolean;
}) {
  const isMobile = useIsMobile();

  const handleToggle = () => {
    const newState = !isOpen;
    onToggle(newState);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggle}
      className="fixed top-4 left-4 z-50 bg-white shadow-md"
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );
}
