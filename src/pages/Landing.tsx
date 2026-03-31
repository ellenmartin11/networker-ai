import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Network, Fingerprint, ArrowRight, Check, UserPlus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
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

export default function Landing() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-white/40 backdrop-blur-md border-b border-white/40">
        <div className="flex items-center gap-2 font-display text-xl font-medium text-primary ml-4">
          <LogoIcon className="w-6 h-6" />
          <span>networker<span className="font-semibold">-ai</span></span>
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

        {/* Feature Highlights Grid */}
        <div className="mt-32 max-w-7xl mx-auto space-y-24 text-left px-4 lg:px-8">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            <div className="md:w-5/12 space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Network className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-semibold text-slate-800 tracking-tight">AI Matchmaker</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                We score your connections based on industry, role, skills, and background to surface the most valuable people to talk to right now. Stop digging through endless contacts.
              </p>
            </div>
            <div className="md:w-7/12 w-full">
              <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 to-slate-50 relative aspect-video group-hover:shadow-xl group-hover:border-blue-200 transition-all flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
                 <img src="/demo_gifs/generate_leads.gif" alt="AI Matchmaker Demo" className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain rounded-xl shadow-2xl border border-slate-200/40" />
              </div>
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 group">
             <div className="md:w-5/12 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-semibold text-slate-800 tracking-tight">Personalized Intros</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Never stare at a blank screen again. Let our AI intelligently draft highly personalized, context-aware greetings precisely tailored to each connection.
              </p>
            </div>
            <div className="md:w-7/12 w-full">
              <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-50 to-slate-50 relative aspect-video group-hover:shadow-xl group-hover:border-emerald-200 transition-all flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
                 <img src="/demo_gifs/browse_connections.gif" alt="Generate Leads Demo" className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain rounded-xl shadow-2xl border border-slate-200/40" />
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
             <div className="md:w-5/12 space-y-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Fingerprint className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-semibold text-slate-800 tracking-tight">Dynamic NetGraph</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Visualize your relationships in interactive nodes! Effortlessly discover shared connections and expand your reach seamlessly across platforms.
              </p>
            </div>
            <div className="md:w-7/12 w-full">
              <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-50 to-slate-50 relative aspect-video group-hover:shadow-xl group-hover:border-purple-200 transition-all flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
                 <img src="/demo_gifs/netgraph.gif" alt="Dynamic NetGraph Demo" className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain rounded-xl shadow-2xl border border-slate-200/40" />
              </div>
            </div>
          </div>

        </div>

        {/* How it Works / Add Contacts Guide */}
        <div className="mt-32">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-display font-medium text-slate-800 mb-4 text-center">How it works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto text-center mb-8">Get up and running with networker-ai in just a few easy steps.</p>
            <Button 
              variant="outline" 
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="gap-2 font-medium bg-white/60 backdrop-blur-md border-primary/20 text-primary hover:bg-primary/10 shadow-sm rounded-full px-6 h-12 transition-all border-2"
            >
              {showHowItWorks ? "Hide Instructions" : "Show Instructions"}
              {showHowItWorks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>

          {showHowItWorks && (
            <div className="grid md:grid-cols-2 gap-12 items-center text-left max-w-6xl mx-auto bg-white/60 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">1</div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-1">Create an account</h4>
                  <p className="text-slate-600 leading-relaxed text-sm lg:text-base">Sign up and set up your base profile with your own details so AI can find overlaps.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">2</div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Add your networking contacts</h4>
                  <div className="text-slate-600 mb-4 space-y-3 leading-relaxed text-sm lg:text-base">
                    <p>networker-ai performs best when it has a lot of information.</p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm text-sm">
                      <p className="font-semibold text-slate-800 mb-2 mt-0">How to export your LinkedIn data:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                        <li>Go to LinkedIn <strong>Settings & Privacy</strong></li>
                        <li>Click <strong>Data privacy</strong> on the left menu</li>
                        <li>Select <strong>Get a copy of your data</strong></li>
                        <li>Check <strong>Connections</strong> and request the archive</li>
                      </ol>
                      <p className="text-xs text-amber-600 italic mt-3 font-medium bg-amber-50 inline-block px-2 py-1 rounded">
                        *Note: LinkedIn can take up to a few days to email you this spreadsheet.
                      </p>
                    </div>
                    <p>
                      <strong>In the meantime:</strong> You don't have to wait! You can easily begin building your graph right now by manually copying and pasting your priority contacts directly into your networker-ai account.
                    </p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-inner text-sm text-slate-700">
                    <strong className="text-slate-800 block mb-1">💡 Pro Tip:</strong>
                    Grab your contact's headline, bio, and location along with their name. The more textual detail you provide, the better the AI can identify meaningful synergies!
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">3</div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-1">Generate leads & visualize</h4>
                  <p className="text-slate-600 leading-relaxed text-sm lg:text-base">Generate leads based on shared education, location, skills or interests! View these connections as an interactive network graph to discover hidden links.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">4</div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-1">Tailored greetings & interaction</h4>
                  <p className="text-slate-600 leading-relaxed text-sm lg:text-base">Select your high-priority leads and let our integrated AI draft the perfect, context-aware icebreaker message. Then, take that generated ice-breaker and interact with them on your favorite networking site!</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-6 justify-center px-4 lg:px-12">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl shadow-sm transform transition-transform hover:-translate-y-1">
                 <div className="flex items-center gap-3 mb-3"><UserPlus className="w-5 h-5 text-blue-500"/><span className="font-semibold text-slate-800">Add Data</span></div>
                 <div className="h-2 w-full bg-blue-200/70 rounded-full max-w-[80%] mb-2"></div>
                 <div className="h-2 w-full bg-blue-200/70 rounded-full max-w-[60%]"></div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl shadow-sm transform transition-transform hover:-translate-y-1 ml-10">
                 <div className="flex items-center gap-3 mb-3"><Network className="w-5 h-5 text-emerald-500"/><span className="font-semibold text-slate-800">Match & Graph</span></div>
                 <div className="h-2 w-full bg-emerald-200/70 rounded-full max-w-[70%] mb-2"></div>
                 <div className="h-2 w-full bg-emerald-200/70 rounded-full max-w-[90%]"></div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 p-6 rounded-2xl shadow-sm transform transition-transform hover:-translate-y-1">
                 <div className="flex items-center gap-3 mb-3"><MessageSquare className="w-5 h-5 text-purple-500"/><span className="font-semibold text-slate-800">Generate Icebreaker</span></div>
                 <div className="h-2 w-full bg-purple-200/70 rounded-full max-w-[85%] mb-2"></div>
                 <div className="h-2 w-full bg-purple-200/70 rounded-full max-w-[40%]"></div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="mt-32" id="pricing">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-medium text-slate-800 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Choose the plan that best fits your networking needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Explorer Tier */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Explorer</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-800">Free</span>
              </div>
              <ul className="text-slate-600 space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> 3 Similarity Searches per day</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> Top 5 leads shown</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> Text-based results & graph</li>
              </ul>
              <Link to="/login" className="mt-auto">
                <Button variant="outline" className="w-full font-medium h-12">Get Started</Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-primary/5 backdrop-blur-xl border border-primary/20 p-8 rounded-2xl shadow-md hover:shadow-lg transition-transform md:-translate-y-4 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Most Popular</div>
              <h3 className="text-2xl font-semibold mb-2 text-primary">Pro</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-slate-800">$3</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mb-6 font-medium">For job seekers & casual networkers.</p>
              <ul className="text-slate-600 space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0 mt-0.5" /> 50 Similarity Searches per month</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0 mt-0.5" /> Top 20 leads + Network Graph view</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0 mt-0.5" /> Unlimited AI "Greeting Generator"</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0 mt-0.5" /> Copy/Paste bio history and csv import</li>
              </ul>
              <Link to="/login" className="mt-auto">
                <Button className="w-full font-medium h-12 bg-primary hover:bg-primary/90 shadow-md">Upgrade to Pro</Button>
              </Link>
            </div>

            {/* Recruiter Tier */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Recruiter</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-slate-800">$20</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mb-6 font-medium">For headhunters & founders.</p>
              <ul className="text-slate-600 space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> Unlimited Similarity Searches</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> Bulk CSV Upload (Sync LinkedIn)</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> Export leads to CSV/CRM</li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" /> "Priority Match" AI alerts</li>
              </ul>
              <Link to="/login" className="mt-auto">
                <Button variant="outline" className="w-full font-medium h-12">Upgrade to Recruiter</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/40 backdrop-blur-xl mt-32 py-16 text-sm text-slate-600 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-display text-xl font-medium text-primary mb-4">
              <LogoIcon className="w-6 h-6" />
              <span>networker<span className="font-semibold">-ai</span></span>
            </div>
            <p className="mb-6 max-w-sm text-slate-500">
              The intelligent way to build your professional network. Uncover hidden potential in your existing connections.
            </p>
            <div className="flex items-center gap-4 mt-6 font-medium text-slate-400">
              <a href="https://github.com/ellenmartin11/networker-ai" className="hover:text-primary transition-colors flex items-center gap-1">GitHub</a>
              <span className="text-slate-300">•</span>
              <a href="https://linkedin.com/in/martinellenjane" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">LinkedIn</a>
              <span className="text-slate-300">•</span>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">Twitter</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Product</h4>
            <ul className="space-y-3 font-medium text-slate-500">
              <li><a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Security</Link></li>
              <li><Link to="/feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
              <li><a href="https://github.com/ellenmartin11/networker-ai" className="hover:text-primary transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Company</h4>
            <ul className="space-y-3 font-medium text-slate-500">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/collaborate" className="hover:text-primary transition-colors">Collaborate with us</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Terms & Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <div className="mb-4 md:mb-0 space-x-6">
            <button className="hover:text-slate-600 transition-colors">We do not sell your personal information</button>
            <button className="hover:text-slate-600 transition-colors">Cookie settings</button>
            <button className="hover:text-slate-600 transition-colors">English (US)</button>
          </div>
          <p>© 2026 networker-ai. All rights reserved.</p>
        </div>
      </footer>

      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
