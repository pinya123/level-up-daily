-- Drop the existing database if it exists
DROP DATABASE IF EXISTS level_up_daily;

-- Create a fresh database
CREATE DATABASE level_up_daily;

-- Connect to the new database
\c level_up_daily;

-- Create the uuid-ossp extension (needed for UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 