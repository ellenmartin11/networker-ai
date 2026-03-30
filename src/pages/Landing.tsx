import { Link } from "react-router-dom";
import { Sparkles, Network, Fingerprint, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-white/40 backdrop-blur-md border-b border-white/40">
        <div className="flex items-center gap-2 font-display text-xl font-medium text-primary ml-4">
          <Sparkles className="w-5 h-5" />
          networker<span className="font-semibold">-ai</span>
        </div>
        <div className="flex gap-4 mr-4">
          <Link to="/login">
            <Button variant="ghost" className="font-medium hover:bg-white/50">Log In</Button>
          </Link>
          <Link to="/login">
            <Button className="font-medium bg-primary/90 hover:bg-primary shadow-sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4 mx-auto max-w-7xl text-center">
        <div className="animate-fade-in space-y-8">
          <h1 className="text-5xl md:text-7xl font-display font-medium text-slate-800 tracking-tight max-w-4xl mx-auto leading-tight">
            The intelligent way to build your <span className="text-primary italic">professional network</span>
          </h1>
          
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Networker-ai analyzes your connections, suggests powerful introductions, and maps the hidden relationships in your industry.
          </p>
          
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Try networker-ai <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Network className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Matchmaker</h3>
            <p className="text-slate-600 leading-relaxed">
              We score your connections based on industry, role, skills, and background to surface the most valuable people to talk to right now.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Personalized Intros</h3>
            <p className="text-slate-600 leading-relaxed">
              Never stare at a blank screen again. Let our AI draft highly personalized, context-aware greetings tailored to each connection.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Fingerprint className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dynamic Network Graph</h3>
            <p className="text-slate-600 leading-relaxed">
              Visualize your relationships in interactive nodes. Discover shared connections and expand your reach seamlessly.
            </p>
          </div>
        </div>
      </main>

      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
