import { works, indexById, paginate } from "../../shared/content"
import type { Work } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

interface ListParams extends PaginationParams {}

/** Lookup table for works, built once at module load. */
const worksById = indexById(works)

/**
 * Lists works, newest first by publication date.
 *
 * @param params - Pagination (`limit` up to 100, default 50; `offset`).
 * @returns The requested page and the total count.
 */
export function getWorks(params: ListParams): QueryResult<Work> {
  return paginate(works, params)
}

/**
 * Finds a work by id.
 *
 * @param id - The content directory name (slug).
 * @returns The item, or `null` if there is none with that id.
 */
export function getWorkById(id: string): Work | null {
  return worksById.get(id) ?? null
}
