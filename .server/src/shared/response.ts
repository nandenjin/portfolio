import type { Context } from "hono"

export function setListHeaders(
  c: Context,
  total: number,
  limit: number,
  offset: number,
): void {
  c.header("X-Total-Count", total.toString())
  c.header("X-Limit", limit.toString())
  c.header("X-Offset", offset.toString())
}
