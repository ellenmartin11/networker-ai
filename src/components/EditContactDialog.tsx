import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditContactDialogProps {
    contactId: string;
    onContactUpdated: () => void;
}

export function EditContactDialog({ contactId, onContactUpdated }: EditContactDialogProps) {
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
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadContact();
        }
    }, [open]);

    const loadContact = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("contacts")
                .select("*")
                .eq("id", contactId)
                .single();

            if (error) throw error;
            if (data) {
                setName(data.name || "");
                setHeadline(data.headline || "");
                setCompany(data.company || "");
                setLocation(data.location || "");
                setBio(data.bio || "");
                setLinkedinUrl(data.linkedin_url || "");
                setSchoolsStr(data.schools?.join(", ") || "");
                setCompaniesStr(data.companies?.join(", ") || "");
                setTagsStr(data.skills?.join(", ") || "");
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to load contact", variant: "destructive" });
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const saveContact = async () => {
        if (!name.trim()) {
            toast({ title: "Name required", variant: "destructive" });
            return;
        }
        setSaving(true);

        const schools = schoolsStr ? schoolsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        const extraCompanies = companiesStr ? companiesStr.split(',').map(c => c.trim()).filter(Boolean) : [];
        const skills = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

        const finalCompanies = Array.from(new Set([...(company ? [company] : []), ...extraCompanies]));

        try {
            const { error } = await supabase
                .from("contacts")
                .update({
                    name,
                    headline,
                    company,
                    location,
                    bio,
                    linkedin_url: linkedinUrl || null,
                    companies: finalCompanies,
                    schools: schools,
                    skills: skills,
                })
                .eq("id", contactId);

            if (error) throw error;
            toast({ title: "Contact updated!" });
            setOpen(false);
            onContactUpdated();
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to update", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary flex-shrink-0">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">Edit Contact</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label>LinkedIn Bio</Label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="mt-1.5 min-h-[100px] bg-muted border-border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Name *</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-muted border-border" />
                            </div>
                            <div>
                                <Label>Current Company</Label>
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
                            Save Changes
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
