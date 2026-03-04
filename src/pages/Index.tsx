import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkTab } from "@/components/NetworkTab";
import { LeadsTab } from "@/components/LeadsTab";
import { HomeTab } from "@/components/HomeTab";
import { Users, Sparkles, Home } from "lucide-react";

const LogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="28" cy="25" r="7" fill="currentColor" />
    <circle cx="55" cy="25" r="7" fill="currentColor" />
    <circle cx="15" cy="48" r="7" fill="currentColor" />
    <circle cx="45" cy="50" r="7" fill="currentColor" />
    <circle cx="28" cy="72" r="7" fill="currentColor" />
    <circle cx="58" cy="65" r="7" fill="currentColor" />

    <line x1="28" y1="25" x2="55" y2="25" />
    <line x1="28" y1="25" x2="15" y2="48" />
    <line x1="28" y1="25" x2="45" y2="50" />
    <line x1="55" y1="25" x2="45" y2="50" />
    <line x1="15" y1="48" x2="45" y2="50" />
    <line x1="15" y1="48" x2="28" y2="72" />
    <line x1="45" y1="50" x2="28" y2="72" />
    <line x1="45" y1="50" x2="58" y2="65" />
    <line x1="55" y1="25" x2="58" y2="65" />
  </svg>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-[#3b82f6]">
              <LogoIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-tight text-[#3b82f6]" style={{ fontWeight: 500 }}>
                networker<span className="font-semibold">-ai</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">AI-powered professional network intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-4xl py-8">
        <Tabs defaultValue="home">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="home" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Home className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Users className="h-4 w-4" />
              My Network
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Sparkles className="h-4 w-4" />
              NetGraph
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="home">
              <HomeTab />
            </TabsContent>
            <TabsContent value="network">
              <NetworkTab />
            </TabsContent>
            <TabsContent value="leads">
              <LeadsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
