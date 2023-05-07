DROP TABLE IF EXISTS sessions;
CREATE TABLE IF NOT EXISTS sessions (
  id integer PRIMARY KEY AUTOINCREMENT,
  session_uuid text NOT NULL,
  device_uuid text NOT NULL,
  session text NOT NULL,
  createdAt integer NOT NULL,
  modifiedAt integer NOT NULL,
  deletedAt integer NULL
);
CREATE INDEX idx_sessions_session_uuid ON sessions (session_uuid);