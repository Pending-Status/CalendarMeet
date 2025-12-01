CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
    firebase_uid VARCHAR(128) PRIMARY KEY,
    email CITEXT UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    major VARCHAR(255),
    year VARCHAR(64),
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    friends TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
