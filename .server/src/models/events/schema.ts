export const EVENTS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  is_exhibition INTEGER DEFAULT 0,
  title_ja TEXT,
  title_en TEXT,
  session_start TEXT,
  session_end TEXT,
  locations TEXT,
  related_works TEXT,
  thumbnail TEXT,
  external_infos TEXT,
  body_html TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_session_start ON events(session_start DESC);
`
