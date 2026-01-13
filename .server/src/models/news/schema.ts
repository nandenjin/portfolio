export const NEWS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title_en TEXT,
  title_ja TEXT,
  tags TEXT,
  release TEXT,
  body_html TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_release ON news(release DESC);
`
