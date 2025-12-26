-- Function to rotate share token (generates new UUID)
CREATE OR REPLACE FUNCTION rotate_share_token(inspection_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token UUID;
BEGIN
  new_token := gen_random_uuid();
  
  UPDATE public.inspections
  SET share_token = new_token
  WHERE id = inspection_id;
  
  RETURN new_token;
END;
$$;
