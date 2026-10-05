import { items, featuredOrder, indexById, paginate } from "../../shared/content"
import type { Item } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

/**
 * Orders of the item list:
 * - `featured`: featured works (`works.md`) first, then the rest newest first
 * - `date`: newest first (`startDate`, else `datePublished`)
 */
export const ORDERS = ["featured", "date"] as const
export type Order = (typeof ORDERS)[number]

interface ListParams extends PaginationParams {
  order: Order
}

/** Lookup table for items, built once at module load. */
const itemsById = indexById(items)

/** Items in each order, built once at module load. */
const itemsByOrder: Record<Order, Item[]> = {
  featured: featuredOrder.map((id) => itemsById.get(id) as Item),
  date: items,
}

/**
 * Lists items.
 *
 * @param params - Order, and pagination (`limit` up to 100, default 50;
 *   `offset`).
 * @returns The requested page and the total count.
 */
export function getItems(params: ListParams): QueryResult<Item> {
  return paginate(itemsByOrder[params.order], params)
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
