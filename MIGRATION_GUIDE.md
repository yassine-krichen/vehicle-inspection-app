# Database Migration Guide

## ⚠️ IMPORTANT: Security Update Required

The SQL function `rotate_share_token` has been updated to fix a critical security vulnerability. You **must** rerun the migration to apply this fix.

## Steps to Apply Security Fix

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `scripts/003_rotate_token_function.sql`
4. Paste and run the SQL query
5. Verify success message

### Option 2: Via Supabase CLI
```bash
# From project root
supabase db push --include-all

# Or apply specific migration
psql $DATABASE_URL -f scripts/003_rotate_token_function.sql
```

## What Changed

### Before (Vulnerable):
```sql
CREATE OR REPLACE FUNCTION rotate_share_token(inspection_id UUID)
-- Anyone could rotate any inspection's token!
```

### After (Secure):
```sql
CREATE OR REPLACE FUNCTION rotate_share_token(
  inspection_id UUID, 
  requesting_user_id UUID  -- ✅ New parameter
)
-- Verifies ownership before allowing token rotation
```

## Verification

After applying the migration, test the security fix:

1. Create an inspection as User A
2. Try to rotate its token as User B
3. Should receive error: "Unauthorized: You do not own this inspection"

## No Downtime Required

This is a **backward-compatible** change. The application will continue working during the migration.

---

*Migration created as part of production code review*
