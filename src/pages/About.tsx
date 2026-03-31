import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-white/40 backdrop-blur-md border-b border-white/40">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-medium text-primary ml-4 hover:opacity-80 transition-opacity">
          <LogoIcon className="w-6 h-6" />
          <span>networker<span className="font-semibold">-ai</span></span>
        </Link>
        <div className="flex gap-4 mr-4">
          <Link to="/">
            <Button variant="ghost" className="font-medium hover:bg-white/50 gap-2"><ArrowLeft className="w-4 h-4"/> Back to home</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 px-4 mx-auto max-w-4xl">
        <div className="animate-fade-in space-y-8 bg-white/60 backdrop-blur-xl border border-white/50 p-10 md:p-16 rounded-3xl shadow-sm">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-slate-800 tracking-tight leading-tight mb-8">
            Our Story
          </h1>
          
          <div className="prose prose-lg prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
            <p className="text-xl font-medium text-slate-800">
              networker-ai started off as a project for a leadership and innovation in AI class at the University of New Haven. We wanted to provide a solution to a real-life problem, one that we face ourselves!
            </p>
            <p>
              Our biggest frustration was networking online. Nowadays, most job opportunities come from known networking contacts, rather than filling in online applications.
            </p>
            <p>
              We had online networking accounts with over a thousand connections, and we had honestly forgotten who many of them were — old classmates, undergrad group members, recruiters met at career events, or sometimes even strangers with interesting profiles.
            </p>
            <p className="font-semibold text-primary text-xl mt-8 border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
              So we built networker-ai to help sift through the noise.
            </p>
          </div>
          
          <div className="pt-10 mt-10 border-t border-slate-200/50 flex justify-end">
             <Link to="/login">
               <Button className="h-12 px-8 text-md font-medium shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white">Join networker-ai today <Sparkles className="w-4 h-4 ml-2" /></Button>
             </Link>
          </div>
        </div>
      </main>

      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
