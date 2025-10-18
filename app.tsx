import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Pages
import Auth from "@/pages/auth";
import Chat from "@/pages/chat";
import MemorySearch from "@/pages/memory-search";
import Profile from "@/pages/profile";
import Conversations from "@/pages/conversations";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";

// Components
import { PremiumModal } from "@/components/premium-modal";

type View = "chat" | "memory" | "profile" | "conversations";

function MainApp() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [, navigate] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Tyler...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUpgradeClick = () => {
    if (user?.isPremium) return;
    navigate("/subscribe");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {currentView === "chat" && (
        <Chat
          onMenuClick={() => setCurrentView("conversations")}
          onSearchClick={() => setCurrentView("memory")}
          onUpgradeClick={handleUpgradeClick}
        />
      )}
      {currentView === "memory" && (
        <MemorySearch onBack={() => setCurrentView("chat")} />
      )}
      {currentView === "profile" && (
        <Profile onBack={() => setCurrentView("chat")} />
      )}
      {currentView === "conversations" && (
        <Conversations
          onBack={() => setCurrentView("chat")}
          onSelectConversation={(id) => {
            // Handle conversation selection
            setCurrentView("chat");
          }}
        />
      )}

      <PremiumModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgradeClick}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/" component={MainApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
