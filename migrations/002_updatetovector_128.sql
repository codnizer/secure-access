BEGIN;

-- Change photoEmbeddings vector dimension from 512 → 128
ALTER TABLE personnel DROP COLUMN photoembeddings;
ALTER TABLE personnel ADD COLUMN photoembeddings vector(128);

ALTER TABLE personnel DROP COLUMN fingerprintembeddings;
ALTER TABLE personnel ADD COLUMN fingerprintembeddings vector(128);

-- Drop the old single emplacement reference column
ALTER TABLE Personnel
    DROP COLUMN assignedEmplacementId;

-- Create join table for Personnel ↔ Emplacement relationships
CREATE TABLE PersonnelEmplacements (
    personnelId UUID REFERENCES Personnel(id) ON DELETE CASCADE,
    emplacementId UUID REFERENCES Emplacement(id) ON DELETE SET NULL,
    PRIMARY KEY (personnelId, emplacementId)
);

COMMIT;
