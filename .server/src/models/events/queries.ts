import { getDb } from "../../shared/db-client"
import type { Event } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

interface ListParams extends PaginationParams {}

function parseJsonField<T>(value: string | null): T {
  if (!value) return [] as T
  try {
    return JSON.parse(value) as T
  } catch {
    return [] as T
  }
}

export function getEvents(params: ListParams): QueryResult<Event> {
  const db = getDb()
  const limit = Math.min(params.limit || 50, 100)
  const offset = params.offset || 0

  const query =
    "SELECT * FROM events ORDER BY session_start DESC LIMIT ? OFFSET ?"
  const rows = db.prepare(query).all(limit, offset) as any[]

  const countQuery = "SELECT COUNT(*) as total FROM events"
  const { total } = db.prepare(countQuery).get() as { total: number }

  const data = rows.map((row) => ({
    ...row,
    is_exhibition: row.is_exhibition === 1,
    locations: parseJsonField(row.locations),
    related_works: parseJsonField<string[]>(row.related_works),
    external_infos: row.external_infos
      ? parseJsonField(row.external_infos)
      : null,
  })) as Event[]

  return { data, total }
}

export function getEventById(id: string): Event | null {
  const db = getDb()
  const row = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as any

  if (!row) return null

  return {
    ...row,
    is_exhibition: row.is_exhibition === 1,
    locations: parseJsonField(row.locations),
    related_works: parseJsonField<string[]>(row.related_works),
    external_infos: row.external_infos
      ? parseJsonField(row.external_infos)
      : null,
  } as Event
}
