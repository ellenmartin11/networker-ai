import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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

export default function Privacy() {
  const { user } = useAuth();
  const backRoute = user ? "/platform" : "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0] overflow-hidden">
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-white/40 backdrop-blur-md border-b border-white/40">
        <Link to={backRoute} className="flex items-center gap-2 font-display text-xl font-medium text-primary ml-4 hover:opacity-80 transition-opacity">
          <LogoIcon className="w-6 h-6" />
          <span>networker<span className="font-semibold">-ai</span></span>
        </Link>
        <div className="flex gap-4 mr-4">
          <Link to={backRoute}>
            <Button variant="ghost" className="font-medium hover:bg-white/50 gap-2"><ArrowLeft className="w-4 h-4"/> Back</Button>
          </Link>
        </div>
      </nav>

      <main className="relative pt-32 pb-16 px-4 mx-auto max-w-4xl">
        <div className="animate-fade-in space-y-8 bg-white/60 backdrop-blur-xl border border-white/50 p-10 md:p-16 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-slate-800 tracking-tight leading-tight">
              Terms & Privacy Policy
            </h1>
          </div>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed space-y-6">
            <section className="space-y-3 pt-6">
               <h2 className="text-2xl font-semibold text-slate-800">1. We do not sell your data</h2>
               <p>At networker-ai, your privacy is our absolute priority. We strictly do not sell your personal or private data to any third parties. Your data remains yours.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-200/50">
               <h2 className="text-2xl font-semibold text-slate-800">2. Data Sharing & Opt-in</h2>
               <p>We only share public professional information (such as your LinkedIn account URLs, bio, professional interests, and first/last name) with your direct connections on networker-ai.</p>
               <p>This sharing only occurs if you explicitly <strong>opt in</strong> to share your network. If you do not opt in, your connections will not have access to your extended network data through our platform.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-slate-200/50">
               <h2 className="text-2xl font-semibold text-slate-800">3. AI & Similarity Scoring</h2>
               <p>To provide our core matchmaking experience, networker-ai relies on advanced AI algorithms and Large Language Models (LLMs) to perform similarity scoring. These algorithms analyze the intentionally provided public professional information to find the best potential introductions, generating ice-breakers and synergies within your graph.</p>
            </section>

            <section className="space-y-3 bg-red-50/50 p-6 rounded-xl border border-red-100 mt-12">
               <h2 className="text-2xl font-semibold text-red-800">4. Account & Data Deletion</h2>
               <p>You have the absolute right to delete your account and all associated data at any time.</p>
               <p>If you choose to delete your account, we will permanently remove all data associated with you from our databases. Furthermore, your network connections on networker-ai will immediately lose access to your connections and profile information.</p>
               <p className="font-medium text-slate-900 mt-4">How to delete your account:</p>
               <ul className="list-disc pl-5 mt-2 space-y-1">
                 <li>Navigate to your <strong>Account</strong> settings within the application.</li>
                 <li>Select the option to permanently delete your data and account.</li>
                 <li>Alternatively, you can email us at our collaboration address to execute a full data wipe on your behalf.</li>
               </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
