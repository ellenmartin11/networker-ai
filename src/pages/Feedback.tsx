import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

export default function Feedback() {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async () => {
    setSubmittingFeedback(true);
    await new Promise(res => setTimeout(res, 800)); // Simulate API payload
    toast({ title: "Thank you for your feedback!" });
    setSubmittingFeedback(false);
    setFeedbackText("");
    setNpsScore(null);
  };

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

      <main className="relative pt-32 pb-16 px-4 mx-auto max-w-2xl">
        <div className="animate-fade-in space-y-8 bg-white/60 backdrop-blur-xl border border-white/50 p-10 md:p-12 rounded-3xl shadow-sm">
          <div className="text-center">
             <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
             <h1 className="text-3xl font-display font-semibold text-slate-800 tracking-tight leading-tight">
               We'd love to hear from you!
             </h1>
             <p className="text-slate-600 mt-2">Your feedback is incredibly valuable in helping us improve networker-ai.</p>
          </div>
          
          <div className="space-y-6 my-8">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">How likely are you to recommend networker-ai to a friend or colleague?</Label>
              <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-slate-100 flex-wrap gap-1 sm:gap-0">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => setNpsScore(score)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${npsScore === score 
                        ? 'bg-primary text-white shadow-md scale-110' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/50 hover:bg-primary/5'}
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">What could we do better? (Optional)</Label>
              <Textarea 
                placeholder="Tell us what you love, what's missing, or what's bothering you..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[120px] bg-white/60 resize-y"
              />
            </div>
            
            <Button onClick={submitFeedback} disabled={submittingFeedback || !npsScore} className="w-full h-12 gap-2 text-md mt-4">
              {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Feedback
            </Button>
          </div>
        </div>
      </main>

      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
