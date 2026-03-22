export const PROFILE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  jsonld TEXT,
  body_html TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`
