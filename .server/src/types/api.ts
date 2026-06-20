export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface QueryResult<T> {
  data: T[]
  total: number
}
