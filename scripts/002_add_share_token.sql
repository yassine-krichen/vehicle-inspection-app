-- Add share token and publish status to inspections table

ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create index for faster lookups by share token
CREATE INDEX IF NOT EXISTS idx_inspections_share_token ON public.inspections(share_token) WHERE is_published = true;

-- Add RLS policy for public access to published inspections
CREATE POLICY "Anyone can view published inspections" ON public.inspections 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Anyone can view published inspection results" ON public.inspection_results 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.inspections 
  WHERE id = inspection_results.inspection_id 
  AND is_published = true
));
