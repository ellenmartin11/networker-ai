import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkTab } from "@/components/NetworkTab";
import { LeadsTab } from "@/components/LeadsTab";
import { Users, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">NetGraph</h1>
              <p className="text-sm text-muted-foreground">AI-powered professional network intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-4xl py-8">
        <Tabs defaultValue="network">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="network" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Users className="h-4 w-4" />
              My Network
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Sparkles className="h-4 w-4" />
              AI Leads
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
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
