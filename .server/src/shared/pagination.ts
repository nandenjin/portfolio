export interface PaginationOptions {
  defaultLimit?: number
  maxLimit?: number
  defaultOffset?: number
}

const DEFAULT_LIMIT = 50
const DEFAULT_MAX_LIMIT = 100
const DEFAULT_OFFSET = 0

function toInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    return undefined
  }

  return parsed
}

export function parsePagination(
  getQuery: (name: string) => string | undefined,
  options: PaginationOptions = {},
): { limit: number; offset: number } {
  const defaultLimit = Math.max(options.defaultLimit ?? DEFAULT_LIMIT, 0)
  const maxLimit = Math.max(options.maxLimit ?? DEFAULT_MAX_LIMIT, 0)
  const defaultOffset = Math.max(options.defaultOffset ?? DEFAULT_OFFSET, 0)

  const parsedLimit = toInteger(getQuery("limit"))
  const parsedOffset = toInteger(getQuery("offset"))

  const limit =
    parsedLimit === undefined
      ? Math.min(defaultLimit, maxLimit)
      : Math.min(Math.max(parsedLimit, 0), maxLimit)

  const offset =
    parsedOffset === undefined ? defaultOffset : Math.max(parsedOffset, 0)

  return { limit, offset }
}
