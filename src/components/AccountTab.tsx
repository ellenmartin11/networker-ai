import { useState, useEffect } from "react";
import { Loader2, Sparkles, User, Settings, CreditCard, ShieldCheck, LogOut, MessageSquare, AlertOctagon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Feedback State
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const submitFeedback = async () => {
    setSubmittingFeedback(true);
    await new Promise(res => setTimeout(res, 800)); // Simulate API payload
    toast({ title: "Thank you for your feedback!" });
    setSubmittingFeedback(false);
    setShowFeedbackDialog(false);
    setFeedbackText("");
    setNpsScore(null);
  };

  // Delete Account State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteUnderstandChecked, setDeleteUnderstandChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await new Promise(res => setTimeout(res, 1200)); // Simulate API payload
    toast({ title: "Account permanently deleted.", variant: "destructive" });
    setIsDeleting(false);
    setShowDeleteDialog(false);
    setDeleteConfirmationText("");
    setDeleteUnderstandChecked(false);
    handleSignOut(); // Sign out the deleted user
  };

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
          .order("created_at", { ascending: false })
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
        .order("created_at", { ascending: false })
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

          <div className="bg-red-50/50 backdrop-blur-xl border border-red-100 shadow-sm rounded-xl p-6 relative mt-6 hover:shadow-md transition-all">
            <h3 className="text-lg font-medium mb-1 flex items-center gap-2 text-red-800">
              <AlertOctagon className="h-5 w-5" /> Danger Zone
            </h3>
            <p className="text-sm text-red-600 mb-4 max-w-sm">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" size="sm" className="font-medium bg-red-600 hover:bg-red-700 shadow-sm">
              Delete Account
            </Button>
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
                {profile?.subscription_tier === 'pro' ? 'Pro Tier' : profile?.subscription_tier === 'recruiter' ? 'Recruiter Tier' : 'Explorer (Free)'}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {profile?.subscription_tier === 'pro'
                  ? "You have unlimited AI similarity searches per month, dynamic network graphs (up to 20 leads), access to NetCluster, and unlimited AI greetings."
                  : profile?.subscription_tier === 'recruiter'
                    ? "You have unlimited searches, bulk CSV uploads, CSV/CRM exporting, and multi-account support for teams."
                    : "You are on the basic Explorer plan. You get unlimited similarity searches, and top 5 leads and up to 20 imported contacts."}
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
                  <span className="text-primary font-bold">$3<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• 50 AI Similarity Searches per month</li>
                  <li>• Top 20 leads + Dynamic Network Graph view</li>
                  <li>• Unlimited AI Greeting Generator</li>
                  <li>• Copy/paste bio history support</li>
                </ul>
                <Button className="w-full h-8 text-xs font-medium" variant="outline">Upgrade to Pro</Button>
              </div>
            )}

            {profile?.subscription_tier !== 'recruiter' && (
              <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl p-5 hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Recruiter</h4>
                  <span className="text-primary font-bold">$20<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• Unlimited AI Similarity Searches</li>
                  <li>• Bulk CSV Connect Upload</li>
                  <li>• Export your leads to CSV or CRM</li>
                  <li>• Priority Match AI alerts for new connections</li>
                </ul>
                <Button className="w-full h-8 text-xs font-medium" variant="outline">Upgrade to Recruiter</Button>
              </div>
            )}
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl p-5 text-center mt-6">
            <MessageSquare className="h-6 w-6 text-slate-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">We'd love to hear from you</h4>
            <p className="text-xs text-slate-500 mb-4">Help us improve networker-ai.</p>
            <Button onClick={() => setShowFeedbackDialog(true)} variant="outline" className="w-full h-8 text-xs">Give Feedback</Button>
          </div>
        </div>
      </div>
      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-xl bg-white/95 backdrop-blur-xl border-white/40 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary font-medium">We'd love to hear from you!</DialogTitle>
            <DialogDescription className="text-slate-600">
              Your feedback is incredibly valuable in helping us improve networker-ai.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-4">
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
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowFeedbackDialog(false)} disabled={submittingFeedback}>Cancel</Button>
            <Button onClick={submitFeedback} disabled={submittingFeedback || !npsScore} className="gap-2">
              {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-red-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 font-medium flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" /> Delete Account
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2 space-y-2 text-left">
              <p>You are about to permanently delete your networker-ai account.</p>
              <ul className="list-disc pl-4 text-red-600/80 font-medium space-y-1">
                <li>All data stored about your networks will be erased.</li>
                <li>Your connections on networker-ai will immediately be unable to access any of your shared connections.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-2">
            <div className="flex items-start space-x-3 bg-red-50 p-3 rounded-lg border border-red-100">
              <Checkbox
                id="understand-delete"
                checked={deleteUnderstandChecked}
                onCheckedChange={(checked) => setDeleteUnderstandChecked(checked === true)}
                className="mt-0.5 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="understand-delete"
                  className="text-sm font-medium leading-tight cursor-pointer text-red-800"
                >
                  I understand that this action cannot be undone and all data will be permanently lost.
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700" htmlFor="confirm-delete">Please type <span className="font-bold text-red-600">DELETE</span> to confirm.</Label>
              <Input
                id="confirm-delete"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="border-red-200 focus-visible:ring-red-500 font-mono tracking-wider"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting} className="hover:bg-slate-100">Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              disabled={isDeleting || deleteConfirmationText !== "DELETE" || !deleteUnderstandChecked}
              className="gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
