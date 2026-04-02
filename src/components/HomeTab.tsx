import { Sparkles, Heart, Zap, User, Linkedin, Github, ShieldCheck, Layers, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HomeTab() {
    return (
        <div className="space-y-8 animate-fade-in">
            <section className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-8 shadow-sm text-center space-y-4">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">Welcome to networker-ai! 👋</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    We're thrilled you're here. Our mission is simple: <strong>to make networking less frustrating.</strong>
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mt-4">
                    <Zap className="h-4 w-4" />
                    <span>We are currently in Beta!</span>
                </div>
            </section>

            {/* NetCluster Discovery Card */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 backdrop-blur-xl rounded-xl border border-violet-200/60 shadow-sm p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100/40 to-indigo-100/20 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <Layers className="h-8 w-8 text-violet-600" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <h3 className="text-xl font-display font-bold text-violet-800">
                                Introducing NetCluster ✨
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full border border-violet-200">New</span>
                        </div>
                        <p className="text-sm text-violet-700/80 leading-relaxed max-w-xl">
                            See the <strong>hidden patterns</strong> in your network. Tag your contacts, and watch them self-organize into clusters — by school, industry, interest, or any category you define.
                        </p>
                    </div>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shrink-0 gap-2">
                        <Link to="/netcluster">
                            Open NetCluster <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            <section className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Heart className="h-5 w-5 text-primary" />
                        <h3>Our MO</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Networking shouldn't feel like a chore. We built networker-ai not to replace your favorite tools (like LinkedIn or your CRM), but to <em>enhance</em> your experience. We help you uncover the hidden potential in your existing network, intelligently recommending who you should talk to next, and giving you the perfect icebreaker to start the conversation. And hopefully you'll have fun exploring your network, uncovering old connections and fostering new ones!
                    </p>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <User className="h-5 w-5 text-primary" />
                        <h3>Meet the Creators</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                EM
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-foreground">Ellen Martin</h4>
                                    <div className="flex items-center gap-1.5">
                                        <a href="https://www.linkedin.com/in/martinellenjane/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                        <a href="https://github.com/ellenmartin11" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="GitHub">
                                            <Github className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Loves connecting the dots between data and human relationships. Always down for a coffee chat! MS Data Science, MRes Developmental Neuroscience, BSc Psychology.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                SD
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-foreground">Shruthi Darwaja</h4>
                                    <div className="flex items-center gap-1.5">
                                        <a href="https://www.linkedin.com/in/darwaja-shruthi/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                        <a href="SHRUTHI LINK HERE" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="GitHub">
                                            <Github className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Passionate about building intuitive tools that enhance day-to-day tasks, and integrate seamlessly into your existing workflows. MS Data Science. </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2 italic">
                            We built this for people just like us—and you! We'd love to hear your feedback as we continue to grow. Connect with us on LinkedIn!
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Your Privacy Matters</h4>
                        <p className="text-sm text-muted-foreground">We never sell your data. You control what you share.</p>
                    </div>
                </div>
                <Link to="/privacy" className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
                    Read our Privacy Policy &rarr;
                </Link>
            </section>
        </div>
    );
}
