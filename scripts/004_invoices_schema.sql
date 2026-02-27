-- Invoice feature schema

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  vehicle_info TEXT, -- e.g. "2022 BMW 330i"
  invoice_number TEXT, -- user-defined or auto-generated
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  subtotal NUMERIC(10, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoice sections (dynamic groups like "Labor", "Parts", "Diagnostics")
CREATE TABLE IF NOT EXISTS public.invoice_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoice_sections ENABLE ROW LEVEL SECURITY;

-- Invoice line items (belong to a section)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.invoice_sections(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit_price NUMERIC(10, 2) DEFAULT 0,
  amount NUMERIC(10, 2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own invoices"
  ON public.invoices FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own invoice sections"
  ON public.invoice_sections FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.invoices
    WHERE id = invoice_sections.invoice_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own invoice items"
  ON public.invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.invoice_sections s
    JOIN public.invoices i ON i.id = s.invoice_id
    WHERE s.id = invoice_items.section_id AND i.user_id = auth.uid()
  ));

-- Auto-generate invoice number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE WHEN invoice_number ~ '^INV-\d+$'
    THEN CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO next_num
  FROM public.invoices
  WHERE user_id = NEW.user_id;

  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || LPAD(next_num::TEXT, 4, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();
