BEGIN;

-- Add expirationdate to the join table
ALTER TABLE personnelemplacements
ADD COLUMN IF NOT EXISTS expirationdate TIMESTAMP WITH TIME ZONE;

-- Migrate existing expirationDate from personnel
UPDATE personnelemplacements pe
SET expirationdate = p.expirationdate
FROM personnel p
WHERE pe.personnelid = p.id;

-- Drop expirationDate from personnel table
ALTER TABLE personnel
DROP COLUMN IF EXISTS expirationdate;

COMMIT;
