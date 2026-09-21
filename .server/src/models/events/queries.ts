import { events, indexById, paginate } from "../../shared/content"
import type { Event } from "../../types/content"
import type { QueryResult, PaginationParams } from "../../types/api"

interface ListParams extends PaginationParams {}

/** Lookup table for events, built once at module load. */
const eventsById = indexById(events)

/**
 * Lists events, most recent session start first.
 *
 * @param params - Pagination (`limit` up to 100, default 50; `offset`).
 * @returns The requested page and the total count.
 */
export function getEvents(params: ListParams): QueryResult<Event> {
  return paginate(events, params)
}

/**
 * Finds a event by id.
 *
 * @param id - The content directory name (slug).
 * @returns The item, or `null` if there is none with that id.
 */
export function getEventById(id: string): Event | null {
  return eventsById.get(id) ?? null
}
