import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tags, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ContactTag {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Teal",    value: "#14b8a6" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Rose",    value: "#f43f5e" },
  { label: "Violet",  value: "#8b5cf6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Sky",     value: "#0ea5e9" },
  { label: "Orange",  value: "#f97316" },
];

interface ManageTagsDialogProps {
  onTagsChanged: () => void;
}

export function ManageTagsDialog({ onTagsChanged }: ManageTagsDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].value);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTags = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("contact_tags")
      .select("id, name, color")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setTags(data as ContactTag[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchTags();
  }, [open, user]);

  const createTag = async () => {
    if (!newTagName.trim() || !user) return;
    setCreating(true);
    const { error } = await (supabase as any).from("contact_tags").insert({
      user_id: user.id,
      name: newTagName.trim(),
      color: newTagColor,
    });
    if (error) {
      toast.error(error.message.includes("unique") ? "A tag with that name already exists." : "Failed to create tag.");
    } else {
      toast.success(`Tag "${newTagName.trim()}" created!`);
      setNewTagName("");
      fetchTags();
      onTagsChanged();
    }
    setCreating(false);
  };

  const deleteTag = async (tag: ContactTag) => {
    if (!user) return;
    setDeletingId(tag.id);

    // Remove this tag from all contacts that have it in their netcluster_tags[]
    const { data: contacts } = await (supabase as any)
      .from("contacts")
      .select("id, netcluster_tags")
      .eq("user_id", user.id)
      .contains("netcluster_tags", [tag.name]);

    if (contacts && contacts.length > 0) {
      await Promise.all(
        contacts.map((c) =>
          (supabase as any)
            .from("contacts")
            .update({ netcluster_tags: ((c as any).netcluster_tags || []).filter((s: string) => s !== tag.name) })
            .eq("id", c.id)
        )
      );
    }

    const { error } = await (supabase as any).from("contact_tags").delete().eq("id", tag.id);
    if (error) {
      toast.error("Failed to delete tag.");
    } else {
      toast.success(`Tag "${tag.name}" deleted and removed from all contacts.`);
      fetchTags();
      onTagsChanged();
    }
    setDeletingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white/60 backdrop-blur-md border-white/40 shadow-sm hover:bg-white/80">
          <Tags className="h-4 w-4" />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/40 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Manage Tags
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-1">
          Define your tag taxonomy. Assign tags to contacts via NetCluster's contact panel.
        </p>

        {/* Create new tag */}
        <div className="space-y-3 pt-1">
          <Label className="text-sm font-medium">Create a new tag</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Yale Contacts"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
              className="flex-1 bg-white/60 border-white/40"
            />
            <Button
              onClick={createTag}
              disabled={creating || !newTagName.trim()}
              size="icon"
              className="shrink-0"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => setNewTagColor(c.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  newTagColor === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">Pick color</span>
          </div>
        </div>

        {/* Existing tags */}
        <div className="pt-2 space-y-2">
          <Label className="text-sm font-medium">Your tags</Label>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : tags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3 text-center bg-white/40 rounded-md border border-dashed border-white/60">
              No tags yet. Create your first one above.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2.5 rounded-md bg-white/50 border border-white/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium"
                      style={{ backgroundColor: `${tag.color}22`, color: tag.color, borderColor: `${tag.color}44` }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteTag(tag)}
                    disabled={deletingId === tag.id}
                  >
                    {deletingId === tag.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
