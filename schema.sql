DROP TABLE IF EXISTS sessions;
CREATE TABLE IF NOT EXISTS sessions (
  id integer PRIMARY KEY AUTOINCREMENT,
  sessionUuid text NOT NULL,
  deviceUuid text NOT NULL,
  session text NOT NULL,
  createdAt integer NOT NULL,
  modifiedAt integer NOT NULL,
  deletedAt integer NULL
);
CREATE INDEX idx_sessions_session_uuid ON sessions (sessionUuid);