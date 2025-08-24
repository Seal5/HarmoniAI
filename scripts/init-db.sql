-- HarmoniAI Database Initialization Script
-- This script sets up the PostgreSQL database with necessary extensions

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for text search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Set timezone
SET timezone = 'UTC';

-- Create additional roles if needed
-- Note: The main user 'harmoni' is already created by the Docker environment

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE harmonidb TO harmoni;

-- Create a read-only role for reporting
CREATE ROLE harmoni_readonly;
GRANT CONNECT ON DATABASE harmonidb TO harmoni_readonly;
GRANT USAGE ON SCHEMA public TO harmoni_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO harmoni_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO harmoni_readonly;

-- Create a backup role
CREATE ROLE harmoni_backup;
GRANT CONNECT ON DATABASE harmonidb TO harmoni_backup;
GRANT USAGE ON SCHEMA public TO harmoni_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO harmoni_backup;

-- Log initialization
INSERT INTO public.system_log (message, created_at) 
VALUES ('HarmoniAI database initialized successfully', NOW())
ON CONFLICT DO NOTHING;
