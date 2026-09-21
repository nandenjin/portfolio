import bundle from "../content.gen"
import type { QueryResult, PaginationParams } from "../types/api"

// Content is baked into the bundle at build time (see build/content-emit.ts).
// Lists are already sorted; here we only build id lookups once per isolate.
//
// The exported objects are shared across requests. Never mutate them: derive
// new values instead (as `toApiJsonLd` does).

/** The profile document. */
export const profile = bundle.profile

/** All works, newest first. */
export const works = bundle.works

/** All events, most recent session start first. */
export const events = bundle.events

/** All news articles, newest first. */
export const news = bundle.news

/**
 * Builds an `id` lookup table for a content list.
 *
 * Meant to be called once at module scope, so the cost is paid at isolate
 * startup and not per request.
 *
 * @param items - Content items with unique ids.
 * @returns A map from `id` to the item.
 */
export function indexById<T extends { id: string }>(
  items: T[],
): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

/**
 * Returns one page of an already-sorted list.
 *
 * `limit` falls back to 50 and is capped at 100; `offset` falls back to 0.
 * `total` is the size of the whole list, not of the returned page.
 *
 * @param items - Pre-sorted items.
 * @param params - Requested `limit` and `offset`.
 * @returns The page and the total item count.
 */
export function paginate<T>(
  items: T[],
  params: PaginationParams,
): QueryResult<T> {
  const limit = Math.min(params.limit || 50, 100)
  const offset = params.offset || 0

  return { data: items.slice(offset, offset + limit), total: items.length }
}
