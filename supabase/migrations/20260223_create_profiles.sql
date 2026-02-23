-- Create profiles table (single user, no auth needed right now)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS since single user, no auth
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (single user app)
CREATE POLICY "Allow all access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Timestamp trigger using existing function
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
