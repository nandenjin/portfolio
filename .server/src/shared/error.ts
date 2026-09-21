import type { Context } from "hono"
import type { ProblemDetails } from "../types/api.js"

const PROBLEM_BASE_URL = "https://www.nandenjin.com/probs"

export function notFound(c: Context, detail: string): Response {
  const problem: ProblemDetails = {
    type: `${PROBLEM_BASE_URL}/not-found`,
    title: "Not Found",
    status: 404,
    detail,
    instance: c.req.url,
  }

  return c.json(problem, 404, {
    "Content-Type": "application/problem+json",
  })
}

export function badRequest(c: Context, detail: string): Response {
  const problem: ProblemDetails = {
    type: `${PROBLEM_BASE_URL}/bad-request`,
    title: "Bad Request",
    status: 400,
    detail,
    instance: c.req.url,
  }

  return c.json(problem, 400, {
    "Content-Type": "application/problem+json",
  })
}

export function internalError(c: Context, detail: string): Response {
  const problem: ProblemDetails = {
    type: `${PROBLEM_BASE_URL}/internal-error`,
    title: "Internal Server Error",
    status: 500,
    detail,
    instance: c.req.url,
  }

  return c.json(problem, 500, {
    "Content-Type": "application/problem+json",
  })
}
