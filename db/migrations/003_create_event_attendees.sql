CREATE TABLE IF NOT EXISTS event_attendees (
    event_id VARCHAR(21) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_uid VARCHAR(128) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('going', 'maybe', 'declined')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_uid)
);

CREATE INDEX IF NOT EXISTS event_attendees_event_id_idx ON event_attendees(event_id);
