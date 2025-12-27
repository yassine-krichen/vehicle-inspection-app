-- Function to rotate share token (generates new UUID)
-- SECURITY: Only allows owner to rotate their own inspection tokens
CREATE OR REPLACE FUNCTION rotate_share_token(inspection_id UUID, requesting_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token UUID;
  current_owner UUID;
BEGIN
  -- Check if requesting user owns this inspection
  SELECT user_id INTO current_owner
  FROM public.inspections
  WHERE id = inspection_id;
  
  IF current_owner IS NULL THEN
    RAISE EXCEPTION 'Inspection not found';
  END IF;
  
  IF current_owner != requesting_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this inspection';
  END IF;
  
  -- Generate and update token
  new_token := gen_random_uuid();
  
  UPDATE public.inspections
  SET share_token = new_token
  WHERE id = inspection_id;
  
  RETURN new_token;
END;
$$;
