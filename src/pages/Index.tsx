import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkTab } from "@/components/NetworkTab";
import { LeadsTab } from "@/components/LeadsTab";
import { HomeTab } from "@/components/HomeTab";
import { ConnectionsTab } from "@/components/ConnectionsTab";
import { AccountTab } from "@/components/AccountTab";
import { Users, Sparkles, Home, UserPlus, Settings } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0]">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-primary">
              <LogoIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-tight text-primary" style={{ fontWeight: 500 }}>
                networker<span className="font-semibold">-ai</span>
              </h1>
              <p className="text-sm text-foreground/70 mt-0.5">AI-powered professional network intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-4xl py-8">
        <Tabs defaultValue="home">
          <TabsList className="bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm p-1">
            <TabsTrigger value="home" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
              <Home className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
              <Users className="h-4 w-4" />
              My Network
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
              <UserPlus className="h-4 w-4" />
              Connect
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all">
              <Sparkles className="h-4 w-4" />
              NetGraph
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all ml-auto">
              <Settings className="h-4 w-4" />
              My Account
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="home">
              <HomeTab />
            </TabsContent>
            <TabsContent value="network">
              <NetworkTab />
            </TabsContent>
            <TabsContent value="connections">
              <ConnectionsTab />
            </TabsContent>
            <TabsContent value="leads">
              <LeadsTab />
            </TabsContent>
            <TabsContent value="account">
              <AccountTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
