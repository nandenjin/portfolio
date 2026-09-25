import { items, indexById, paginate } from "../../shared/content"
import type { Item } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

interface ListParams extends PaginationParams {}

/** Lookup table for items, built once at module load. */
const itemsById = indexById(items)

/**
 * Lists items, newest first.
 *
 * @param params - Pagination (`limit` up to 100, default 50; `offset`).
 * @returns The requested page and the total count.
 */
export function getItems(params: ListParams): QueryResult<Item> {
  return paginate(items, params)
}

/**
 * Finds an item by id.
 *
 * @param id - The content directory name (slug).
 * @returns The item, or `null` if there is none with that id.
 */
export function getItemById(id: string): Item | null {
  return itemsById.get(id) ?? null
}
