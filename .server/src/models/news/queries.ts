import { getDb } from "../../shared/db-client"
import type { JsonLdBase, News } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

interface ListParams extends PaginationParams {}

function parseJsonLd(value: string | null): JsonLdBase {
  if (!value) {
    throw new Error("News JSON-LD is missing")
  }
  try {
    return JSON.parse(value) as JsonLdBase
  } catch {
    throw new Error("News JSON-LD is invalid")
  }
}

export function getNews(params: ListParams): QueryResult<News> {
  const db = getDb()
  const limit = Math.min(params.limit || 50, 100)
  const offset = params.offset || 0

  const query = "SELECT * FROM news ORDER BY release DESC LIMIT ? OFFSET ?"
  const rows = db.prepare(query).all(limit, offset) as any[]

  const countQuery = "SELECT COUNT(*) as total FROM news"
  const { total } = db.prepare(countQuery).get() as { total: number }

  const data = rows.map((row) => ({
    id: row.id,
    jsonld: parseJsonLd(row.jsonld),
    body_html: row.body_html,
    created_at: row.created_at,
  })) as News[]

  return { data, total }
}

export function getNewsById(id: string): News | null {
  const db = getDb()
  const row = db.prepare("SELECT * FROM news WHERE id = ?").get(id) as any

  if (!row) return null

  return {
    id: row.id,
    jsonld: parseJsonLd(row.jsonld),
    body_html: row.body_html,
    created_at: row.created_at,
  } as News
}
