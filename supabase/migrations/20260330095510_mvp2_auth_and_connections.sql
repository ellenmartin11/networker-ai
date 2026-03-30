-- MIGRATION: 20260330095510_mvp2_auth_and_connections.sql
-- 1. Updates to Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Add a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS for profiles properly
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, but only auth users can update their own
DROP POLICY IF EXISTS "Allow all access" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Updates to Contacts Table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid();

-- Assign existing contacts to the FIRST user who registers!
CREATE OR REPLACE FUNCTION public.assign_legacy_contacts()
RETURNS trigger AS $$
BEGIN
  -- If this is the first profile ever created, assign all orphaned contacts to it
  IF (SELECT count(*) FROM public.profiles) = 1 THEN
    UPDATE public.contacts SET user_id = new.id WHERE user_id IS NULL;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_first_profile_created ON public.profiles;
CREATE TRIGGER on_first_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.assign_legacy_contacts();

-- 3. New user_connections table (Moved up so contacts policy can reference it)
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  target_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  requester_shares_contacts BOOLEAN NOT NULL DEFAULT false,
  target_shares_contacts BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, target_id)
);

-- RLS for user_connections
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections."
ON public.user_connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = target_id
);

CREATE POLICY "Users can insert connections."
ON public.user_connections FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);

CREATE POLICY "Users can update their own connections."
ON public.user_connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = target_id
);

-- Timestamp trigger for user_connections
DROP TRIGGER IF EXISTS update_user_connections_updated_at ON public.user_connections;
CREATE TRIGGER update_user_connections_updated_at
BEFORE UPDATE ON public.user_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Contacts RLS policies
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON public.contacts;

-- Define a policy where users can select their own contacts, OR contacts of connections who share with them.
CREATE POLICY "Users can view their own contacts."
ON public.contacts FOR SELECT USING (
  auth.uid() = user_id
  OR 
  user_id IN (
    -- connections where target is current user and requester shares contacts
    SELECT requester_id FROM public.user_connections 
    WHERE target_id = auth.uid() AND requester_shares_contacts = true AND status = 'accepted'
    UNION
    -- connections where requester is current user and target shares contacts
    SELECT target_id FROM public.user_connections 
    WHERE requester_id = auth.uid() AND target_shares_contacts = true AND status = 'accepted'
  )
);

CREATE POLICY "Users can insert their own contacts."
ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts."
ON public.contacts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts."
ON public.contacts FOR DELETE USING (auth.uid() = user_id);
