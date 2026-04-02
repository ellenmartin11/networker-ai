-- NetCluster: canonical per-user tag taxonomy
-- Users pre-define tags (e.g., "Yale Contacts", "Family") here.
-- The actual assignment is stored in contacts.skills[].

CREATE TABLE public.contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own tags
CREATE POLICY "Users manage own contact tags"
  ON public.contact_tags
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
