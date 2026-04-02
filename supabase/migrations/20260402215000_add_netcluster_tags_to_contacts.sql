-- Add dedicated column for NetCluster tags, separate from the freeform skills/tags field.
-- netcluster_tags: strict, predefined-only tags used by NetCluster graph clustering.
-- skills: freeform comma-separated tags used by NetGraph AI matching (unchanged).

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS netcluster_tags TEXT[] DEFAULT '{}';
