-- Vehicle Inspection App Schema

-- Enable RLS
-- Profiles table to store mechanic information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  shop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  license_plate TEXT,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  odometer INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Inspection Items table (stores individual check results)
CREATE TABLE IF NOT EXISTS public.inspection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'Under the Car', 'Under the Hood', etc.
  item_name TEXT NOT NULL, -- 'Oil leaks', 'Engine oil level', etc.
  status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red', 'na')),
  measurement TEXT, -- For things like tire depth (e.g., '8/32')
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inspection_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own inspections" ON public.inspections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own inspection results" ON public.inspection_results FOR ALL 
USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_results.inspection_id AND user_id = auth.uid()));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
