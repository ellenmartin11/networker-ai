import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddContactDialogProps {
  onContactAdded: () => void;
}

export function AddContactDialog({ onContactAdded }: AddContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [schoolsStr, setSchoolsStr] = useState("");
  const [companiesStr, setCompaniesStr] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const parseBio = async () => {
    if (!bio.trim()) return;
    setParsing(true);
    try {
      const res = await supabase.functions.invoke("parse-bio", {
        body: { bio },
      });
      if (res.error) throw res.error;
      const data = res.data;
      if (data.error) throw new Error(data.error);

      if (data.name) setName(data.name);
      if (data.headline) setHeadline(data.headline);
      if (data.company) setCompany(data.company);
      if (data.location) setLocation(data.location);
      toast({ title: "Bio parsed!", description: "Fields populated from bio." });
    } catch (e) {
      console.error(e);
      toast({ title: "Parse failed", description: e instanceof Error ? e.message : "Enter details manually.", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const saveContact = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSaving(true);

    // Parse comma separated strings into arrays, trimming whitespace
    const schools = schoolsStr ? schoolsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const extraCompanies = companiesStr ? companiesStr.split(',').map(c => c.trim()).filter(Boolean) : [];
    const skills = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    // If they typed a primary company, ensure it's in the arrays list too
    const finalCompanies = Array.from(new Set([...(company ? [company] : []), ...extraCompanies]));

    try {
      const { error } = await supabase.from("contacts").insert({
        name,
        headline,
        company,
        location,
        bio,
        linkedin_url: linkedinUrl || null,
        companies: finalCompanies,
        schools: schools,
        skills: skills,
      });
      if (error) throw error;
      toast({ title: "Contact added!" });
      setOpen(false);
      setBio(""); setName(""); setHeadline(""); setCompany(""); setLocation(""); setLinkedinUrl(""); setSchoolsStr(""); setCompaniesStr(""); setTagsStr("");
      onContactAdded();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Paste LinkedIn Bio</Label>
            <Textarea
              placeholder="Paste a LinkedIn bio or summary here..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 min-h-[100px] bg-muted border-border"
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={parseBio}
              disabled={parsing || !bio.trim()}
            >
              {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Parse with AI
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label>Headline</Label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label>Schools (Comma separated)</Label>
              <Input value={schoolsStr} onChange={(e) => setSchoolsStr(e.target.value)} placeholder="e.g. Yale, MIT" className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label>Past Companies (Comma separated)</Label>
              <Input value={companiesStr} onChange={(e) => setCompaniesStr(e.target.value)} placeholder="e.g. Google, OpenAI" className="mt-1 bg-muted border-border" />
            </div>
            <div className="col-span-2">
              <Label>Interests / Tags (Comma separated)</Label>
              <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="e.g. neuroscience, research, psychology" className="mt-1 bg-muted border-border" />
            </div>
          </div>
          <div>
            <Label>LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="mt-1 bg-muted border-border" />
          </div>
          <Button onClick={saveContact} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
