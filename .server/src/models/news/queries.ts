import { news, indexById, paginate } from "../../shared/content"
import type { News } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

interface ListParams extends PaginationParams {}

/** Lookup table for news articles, built once at module load. */
const newsById = indexById(news)

/**
 * Lists news articles, newest first by publication date.
 *
 * @param params - Pagination (`limit` up to 100, default 50; `offset`).
 * @returns The requested page and the total count.
 */
export function getNews(params: ListParams): QueryResult<News> {
  return paginate(news, params)
}

/**
 * Finds a news article by id.
 *
 * @param id - The content directory name (slug).
 * @returns The item, or `null` if there is none with that id.
 */
export function getNewsById(id: string): News | null {
  return newsById.get(id) ?? null
}
