ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS include_in_network boolean DEFAULT true;
