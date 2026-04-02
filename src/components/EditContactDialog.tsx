import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Loader2, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EditContactDialogProps {
    contactId: string;
    onContactUpdated: () => void;
}

interface ContactTag {
    id: string;
    name: string;
    color: string;
}

export function EditContactDialog({ contactId, onContactUpdated }: EditContactDialogProps) {
    const { user } = useAuth();
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
    // NetCluster: predefined tags only
    const [availableTags, setAvailableTags] = useState<ContactTag[]>([]);
    const [selectedNetClusterTags, setSelectedNetClusterTags] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadContact();
            loadAvailableTags();
        }
    }, [open]);

    const loadAvailableTags = async () => {
        if (!user) return;
        const { data } = await (supabase as any)
            .from("contact_tags")
            .select("id, name, color")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });
        if (data) setAvailableTags(data as ContactTag[]);
    };

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
                setSelectedNetClusterTags((data as any).netcluster_tags || []);
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to load contact", variant: "destructive" });
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const toggleNetClusterTag = (tagName: string, checked: boolean) => {
        setSelectedNetClusterTags((prev) =>
            checked ? [...new Set([...prev, tagName])] : prev.filter((t) => t !== tagName)
        );
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
                    netcluster_tags: selectedNetClusterTags,
                } as any)
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
            <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
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
                                <Label>Tags (Comma separated)</Label>
                                <p className="text-[11px] text-muted-foreground mb-1">Used by NetGraph AI matching — flexible formatting.</p>
                                <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="e.g. neuroscience, research, psychology" className="mt-1 bg-muted border-border" />
                            </div>
                        </div>

                        {/* NetCluster Tags — predefined only */}
                        <div className="rounded-lg border border-violet-200/60 bg-violet-50/50 p-3.5 space-y-2.5">
                            <div className="flex items-center gap-2">
                                <Layers className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                                <Label className="text-sm font-semibold text-violet-800">NetCluster Tags</Label>
                            </div>
                            <p className="text-[11px] text-violet-600/80 leading-relaxed">
                                Used by NetCluster graph clustering — strict predefined tags only.{" "}
                                {availableTags.length === 0 && (
                                    <span>
                                        <a href="/netcluster" className="underline underline-offset-2 hover:text-violet-800 font-medium" target="_blank" rel="noopener noreferrer">
                                            Create tags in NetCluster
                                        </a>{" "}first.
                                    </span>
                                )}
                            </p>
                            {availableTags.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">No tags defined yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag) => {
                                        const checked = selectedNetClusterTags.includes(tag.name);
                                        return (
                                            <label
                                                key={tag.id}
                                                className={`flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-1 border text-xs font-medium transition-all select-none ${
                                                    checked
                                                        ? "border-transparent text-white shadow-sm"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                }`}
                                                style={checked ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(v) => toggleNetClusterTag(tag.name, v === true)}
                                                    className="hidden"
                                                />
                                                <div
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: checked ? "rgba(255,255,255,0.7)" : tag.color }}
                                                />
                                                {tag.name}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedNetClusterTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    {selectedNetClusterTags.map((t) => {
                                        const tag = availableTags.find((at) => at.name === t);
                                        return (
                                            <Badge
                                                key={t}
                                                variant="secondary"
                                                className="text-[10px] font-medium"
                                                style={{ backgroundColor: `${tag?.color}22`, color: tag?.color, borderColor: `${tag?.color}44` }}
                                            >
                                                {t}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
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
