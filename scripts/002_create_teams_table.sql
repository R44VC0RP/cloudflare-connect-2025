-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add team_id column to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE;

-- Create index on team_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_team_id ON registrations(team_id);
