import { getDb } from "../../shared/db-client"
import type { Work } from "../../types/content"
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

export function getWorks(params: ListParams): QueryResult<Work> {
  const db = getDb()
  const limit = Math.min(params.limit || 50, 100)
  const offset = params.offset || 0

  const query = "SELECT * FROM works ORDER BY release DESC LIMIT ? OFFSET ?"
  const rows = db.prepare(query).all(limit, offset) as any[]

  const countQuery = "SELECT COUNT(*) as total FROM works"
  const { total } = db.prepare(countQuery).get() as { total: number }

  const data = rows.map((row) => ({
    ...row,
    tags: parseJsonField<string[]>(row.tags),
    is_exhibition: undefined,
    locations: undefined,
    related_works: undefined,
    external_infos: undefined,
    session_start: undefined,
    session_end: undefined,
  })) as Work[]

  return { data, total }
}

export function getWorkById(id: string): Work | null {
  const db = getDb()
  const row = db.prepare("SELECT * FROM works WHERE id = ?").get(id) as any

  if (!row) return null

  return {
    ...row,
    tags: parseJsonField<string[]>(row.tags),
  } as Work
}
