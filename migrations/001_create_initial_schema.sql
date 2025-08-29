-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Emplacement Table
CREATE TABLE Emplacement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    accessMethod JSONB, -- Storing access methods as JSONB
    exitMethod JSONB    -- Storing exit methods as JSONB
);

-- 2. Admin Table
CREATE TABLE Admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    passwordHash TEXT NOT NULL -- Store hashed passwords
);

-- 3. Personnel Table
CREATE TABLE Personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(255) UNIQUE NOT NULL,
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    photoUrl TEXT,
    qrCode VARCHAR(255) UNIQUE NOT NULL,
    pin VARCHAR(6) NOT NULL, -- 6-digit PIN
    expirationDate TIMESTAMP WITH TIME ZONE NOT NULL,
    assignedEmplacementId UUID REFERENCES Emplacement(id) ON DELETE SET NULL, -- Can be NULL if not yet assigned
    phone VARCHAR(50),
    service VARCHAR(255),
    -- Assuming you have a way to handle vector types in PostgreSQL,
    -- e.g., using pgvector extension. For now, we'll simulate.
    -- If pgvector is not installed, you might need to represent these as TEXT or ARRAY of floats.
    -- For demonstration, let's use TEXT for now, assuming they'd be serialized arrays.
    -- To properly handle VECTOR, you'd need the 'pgvector' extension installed and configured.
    -- For this example, let's define them as TEXT to hold stringified vectors.
    -- If you install pgvector, you would use: photoEmbeddings VECTOR(512), fingerprintEmbeddings VECTOR(256)
    photoEmbeddings VECTOR(512), -- Stores stringified array or JSON array
    fingerprintEmbeddings VECTOR(256), -- Stores stringified array or JSON array
    isActive BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. Guard Table
CREATE TABLE Guard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    assignedEmplacementId UUID REFERENCES Emplacement(id) ON DELETE SET NULL,
    phone VARCHAR(50)
);

-- 5. KioskDevice Table
CREATE TABLE KioskDevice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignedEmplacementId UUID REFERENCES Emplacement(id) ON DELETE SET NULL,
    isOnline BOOLEAN DEFAULT FALSE NOT NULL
);

-- 6. GuardKioskAssignment Table (Join Table)
CREATE TABLE GuardKioskAssignment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardId UUID REFERENCES Guard(id) ON DELETE CASCADE,
    kioskDeviceId UUID REFERENCES KioskDevice(id) ON DELETE CASCADE,
    UNIQUE (guardId, kioskDeviceId) -- A guard can only be assigned to a specific kiosk once
);

-- 7. Request Table
CREATE TABLE Request (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('access', 'exit')),
    personnelId UUID REFERENCES Personnel(id) ON DELETE CASCADE,
    emplacementId UUID REFERENCES Emplacement(id) ON DELETE CASCADE,
    method JSONB, -- The method used for the request (e.g., QR, PIN, Face)
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL
);

-- 8. Log Table
CREATE TABLE Log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('access', 'exit')),
    personnelId UUID REFERENCES Personnel(id) ON DELETE SET NULL, -- Use SET NULL if personnel can be deleted but log remains
    emplacementId UUID REFERENCES Emplacement(id) ON DELETE SET NULL,
    method JSONB,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    hash TEXT UNIQUE NOT NULL -- Hash of the log entry for blockchain integrity
);

-- 9. Blockchain Table (before Block, as Block references it)
CREATE TABLE Blockchain (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL DEFAULT 'MainChain',
    headHash TEXT NOT NULL,
    validatorPublicKey TEXT NOT NULL,
    validatorSignatureAlgo VARCHAR(50) NOT NULL DEFAULT 'ECDSA',
    validatorSignature TEXT NOT NULL
);

-- 10. Block Table
CREATE TABLE Block (
    "index" SERIAL PRIMARY KEY, -- Using SERIAL for auto-incrementing integer index
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previousHash TEXT NOT NULL,
    personnelId UUID REFERENCES Personnel(id) ON DELETE SET NULL,
    hash TEXT UNIQUE NOT NULL, -- Hash of this specific block
    logType VARCHAR(10) NOT NULL CHECK (logType IN ('access', 'exit')),
    logId UUID UNIQUE REFERENCES Log(id) ON DELETE SET NULL -- Nullable if a block can exist without a direct log association or if log is deleted
);

-- 11. DailySummary Table
CREATE TABLE DailySummary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL, -- Daily summary, so date should be unique
    totalEntries INT DEFAULT 0 NOT NULL,
    failedEntries INT DEFAULT 0 NOT NULL,
    topAlertZones JSONB,
    reviewed BOOLEAN DEFAULT FALSE NOT NULL,
    summary TEXT -- Generated by LLM
);

-- Initial insertion for Blockchain (optional, but ensures a starting point)
INSERT INTO Blockchain (name, headHash, validatorPublicKey, validatorSignature)
VALUES ('MainChain', 'genesis_block_hash_placeholder', 'your_validator_public_key_placeholder', 'your_validator_signature_placeholder')
ON CONFLICT (name) DO NOTHING; -- Prevents re-insertion on subsequent runs