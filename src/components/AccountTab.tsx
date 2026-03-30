import { useState, useEffect } from "react";
import { Loader2, Sparkles, User, Settings, CreditCard, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AccountTab() {
  const { user, profile, isPro, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [userName, setUserName] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [userAffiliations, setUserAffiliations] = useState("");
  const [userTags, setUserTags] = useState("");
  const [userBio, setUserBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      sessionStorage.clear();
      await supabase.auth.signOut();
      toast({ title: "Successfully signed out" });
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to sign out", variant: "destructive" });
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const loadLegacyContactsProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("name, bio, location, headline, skills")
          .eq("user_id", user.id)
          .eq("priority", -1)
          .limit(1)
          .single();

        if (data && !error) {
          setUserName(data.name || profile?.name || "");
          setUserLocation(data.location || "");
          setUserAffiliations(data.headline || profile?.headline || "");
          setUserTags(data.skills?.join(", ") || profile?.interests?.join(", ") || "");
          setUserBio(data.bio || "");
        } else {
          setUserName(profile?.name || "");
          setUserAffiliations(profile?.headline || "");
          setUserTags(profile?.interests?.join(", ") || "");
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      }
    };
    loadLegacyContactsProfile();
  }, [user, profile]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const skillsArray = userTags ? userTags.split(',').map(s => s.trim()).filter(Boolean) : [];

      // 1. Update the actual profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name: userName, 
          headline: userAffiliations, 
          interests: skillsArray 
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      // 2. Update the hidden NetGraph matching profile in the contacts table (priority: -1)
      const { data: contactCheck } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", user.id)
        .eq("priority", -1)
        .limit(1)
        .single();
        
      if (contactCheck) {
        const { error } = await supabase
          .from("contacts")
          .update({ name: userName, bio: userBio, location: userLocation, headline: userAffiliations, skills: skillsArray })
          .eq("id", contactCheck.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert({ name: userName, bio: userBio, location: userLocation, headline: userAffiliations, priority: -1, skills: skillsArray, user_id: user.id });
        if (error) throw error;
      }

      await refreshProfile();
      toast({ title: "Profile saved successfully!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-slate-800 flex items-center gap-2">
            <User className="h-6 w-6 text-primary" /> My Account
          </h2>
          <p className="text-muted-foreground mt-1">Manage your configuration and subscription settings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isLoggingOut} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 transition-colors">
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sign Out
        </Button>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        
        {/* Left Column: Account Settings */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-xl p-6 relative">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-400" /> Public Profile Options
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Your Name</Label>
                  <Input
                    placeholder="e.g. Jane Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-1.5 bg-white/60 backdrop-blur-md border border-white/40"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <Input
                    placeholder="e.g. San Francisco, CA"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="mt-1.5 bg-white/60 backdrop-blur-md border border-white/40"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Headline / Affiliations</Label>
                <Input
                  placeholder="e.g. Yale, OpenAI, Boston Children's Hospital"
                  value={userAffiliations}
                  onChange={(e) => setUserAffiliations(e.target.value)}
                  className="mt-1.5 bg-white/60 backdrop-blur-md border border-white/40"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Interests / Tags (Comma separated)</Label>
                <Input
                  placeholder="e.g. neuroscience, research, psychology, startups"
                  value={userTags}
                  onChange={(e) => setUserTags(e.target.value)}
                  className="mt-1.5 bg-white/60 backdrop-blur-md border border-white/40"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Bio</Label>
                <Textarea
                  placeholder="Paste your LinkedIn bio, current role, or interests here to help AI find the best matches..."
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  className="mt-1.5 min-h-[100px] resize-y bg-white/60 backdrop-blur-md border border-white/40"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={saveProfile} disabled={savingProfile} className="gap-2">
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Profile Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Subscription & Status */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-xl border border-primary/20 shadow-sm rounded-xl p-6 relative overflow-hidden">
            <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Current Plan
            </h3>
            
            <div className="mt-4">
              <div className="inline-block px-3 py-1 bg-white border border-primary/30 rounded-full text-primary font-semibold text-sm shadow-sm mb-3">
                {profile?.subscription_tier === 'pro' ? 'Pro Tier' : profile?.subscription_tier === 'recruiter' ? 'Recruiter Tier' : 'Free Tier'}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {profile?.subscription_tier === 'pro' 
                  ? "You have access to extended connection imports, faster AI matching engines, and premium networking graph features."
                  : "You are on the basic free plan. Upgrade to unlock bulk contact imports and faster AI tools."}
              </p>
            </div>
            
            <Sparkles className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/10" />
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider ml-1">Available Upgrades</h4>
            
            {!isPro && (
              <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl p-5 hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Pro</h4>
                  <span className="text-primary font-bold">$20<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• Import up to 500 contacts</li>
                  <li>• Faster AI Tailoring Models</li>
                  <li>• Connect directly on platform</li>
                </ul>
                <Button className="w-full h-8 text-xs font-medium" variant="outline">Upgrade to Pro</Button>
              </div>
            )}

            {profile?.subscription_tier !== 'recruiter' && (
              <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl p-5 hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Recruiter</h4>
                  <span className="text-primary font-bold">$99<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• Multiple linked accounts</li>
                  <li>• Set specific job descriptions</li>
                  <li>• Advanced exporting tools</li>
                </ul>
                <Button className="w-full h-8 text-xs font-medium" variant="outline">Upgrade to Recruiter</Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
