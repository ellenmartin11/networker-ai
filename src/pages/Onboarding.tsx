import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, X, Loader2 } from "lucide-react";

export default function Onboarding() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  const suggestedInterests = ["Psychology", "Neuroscience", "Machine Learning", "Data Science", "Design", "Product Management"];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    
    // If onboarding is already fully complete, they shouldn't be here
    if (profile && profile.headline !== null) {
      navigate("/product");
    }

    if (profile) {
      setName(profile.name || user.user_metadata?.full_name || "");
      setHeadline(profile.headline || "");
      setLinkedinUrl(profile.linkedin_url || "");
      if (profile.interests) setInterests(profile.interests);
    }
  }, [user, profile, authLoading, navigate]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleCustomInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest(newInterest);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          headline,
          linkedin_url: linkedinUrl,
          bio,
          interests,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success("Profile fully set up! Welcome to networker-ai.");
      navigate("/product");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] via-[#ebf4fa] to-[#e6e6f0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-8 space-y-2">
        <h2 className="text-primary font-medium text-center">Let's get you set up</h2>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>

      <Card className="w-full max-w-lg bg-white/60 backdrop-blur-xl border-white/40 shadow-xl">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Basic Info"}
            {step === 2 && "Professional Details"}
            {step === 3 && "Your Interests"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "What should people call you and what's your headline?"}
            {step === 2 && "Tell us about your background and link your profile."}
            {step === 3 && "Select areas you're interested in, or add your own separated by commas."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g. Data Scientist at TechCorp"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="bg-white/60"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="bg-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="A brief summary of your experience and what you're looking for..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-white/60 min-h-[120px]"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Selected Interests</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-md bg-white/40 border border-white/40">
                  {interests.length === 0 && <span className="text-sm text-muted-foreground">None selected yet.</span>}
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1 pl-3 pr-1.5 py-1 text-sm bg-primary/10 hover:bg-primary/20 transition-colors">
                      {interest}
                      <button onClick={() => removeInterest(interest)} className="hover:text-destructive transition-colors ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Add custom interest</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Quantum Computing (press Enter to add)"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleCustomInterestKeyDown}
                    className="bg-white/60"
                  />
                  <Button type="button" variant="outline" onClick={() => addInterest(newInterest)} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Suggestions</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.map((suggestion) => (
                    <Badge 
                      key={suggestion} 
                      variant="outline" 
                      className={`cursor-pointer hover:bg-primary/5 transition-colors ${interests.includes(suggestion) ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => addInterest(suggestion)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-6 border-t border-white/20">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext} disabled={loading}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
