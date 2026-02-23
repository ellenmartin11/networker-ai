
-- Create contacts table (single user, no auth needed)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  headline TEXT,
  company TEXT,
  location TEXT,
  bio TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  schools TEXT[],
  companies TEXT[],
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS since single user, no auth
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (single user app)
CREATE POLICY "Allow all access" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
