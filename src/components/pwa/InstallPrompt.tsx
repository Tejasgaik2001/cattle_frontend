"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in the past
    if (localStorage.getItem("pwaPromptDismissed") === "true") {
      setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setIsInstallable(false);
    setIsDismissed(true);
    localStorage.setItem("pwaPromptDismissed", "true");
  };

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-[100] flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 max-w-lg w-full relative">
        <button 
          onClick={handleDismiss} 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>
        
        <div className="flex-shrink-0 bg-primary/10 p-3 rounded-2xl text-primary shadow-inner">
          <Download size={24} />
        </div>
        
        <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
          <h3 className="font-semibold text-sm">Install MyCowFarm App</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for quick and easy access</p>
        </div>
        
        <Button onClick={handleInstallClick} className="w-full sm:w-auto shrink-0 shadow-md font-medium mt-2 sm:mt-0">
          Install App
        </Button>
      </div>
    </div>
  );
}
