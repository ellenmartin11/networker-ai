import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Github, Linkedin, MessageSquareHeart } from "lucide-react";
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

export default function Collaborate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0] overflow-hidden">
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-white/40 backdrop-blur-md border-b border-white/40">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-medium text-primary ml-4 hover:opacity-80 transition-opacity">
          <LogoIcon className="w-6 h-6" />
          <span>networker<span className="font-semibold">-ai</span></span>
        </Link>
        <div className="flex gap-4 mr-4">
          <Link to="/">
            <Button variant="ghost" className="font-medium hover:bg-white/50 gap-2"><ArrowLeft className="w-4 h-4"/> Back</Button>
          </Link>
        </div>
      </nav>

      <main className="relative pt-32 pb-16 px-4 mx-auto max-w-3xl">
        <div className="animate-fade-in space-y-8 bg-white/60 backdrop-blur-xl border border-white/50 p-10 md:p-16 rounded-3xl shadow-sm text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquareHeart className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-slate-800 tracking-tight leading-tight">
            Collaborate with us
          </h1>
          
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
            We are always looking for passionate people to help improve networker-ai. Whether you're an engineer, designer, or just have a great idea, we'd love to chat! Reach out to us directly through any of the channels below.
          </p>
          
          <div className="pt-8 space-y-4 max-w-md mx-auto">
            <a href="mailto:martin.ellenjane@gmail.com" className="flex items-center justify-start gap-4 p-5 bg-white/80 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group">
              <Mail className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Email</span>
                <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">martin.ellenjane@gmail.com</span>
              </div>
            </a>
            
            <a href="https://github.com/ellenmartin11/networker-ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-start gap-4 p-5 bg-white/80 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group">
              <Github className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">GitHub</span>
                <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">ellenmartin11 / networker-ai</span>
              </div>
            </a>
            
            <a href="https://linkedin.com/in/martinellenjane" target="_blank" rel="noopener noreferrer" className="flex items-center justify-start gap-4 p-5 bg-white/80 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group">
              <Linkedin className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">LinkedIn</span>
                <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">martinellenjane</span>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
