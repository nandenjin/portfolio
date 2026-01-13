export const WORKS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  title_en TEXT,
  title_ja TEXT,
  creator TEXT,
  materials TEXT,
  year INTEGER,
  tags TEXT,
  thumbnail TEXT,
  release TEXT,
  info TEXT,
  body_html TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_works_release ON works(release DESC);
CREATE INDEX IF NOT EXISTS idx_works_year ON works(year DESC);
`
