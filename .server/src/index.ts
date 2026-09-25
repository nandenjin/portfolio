import { Hono } from "hono"
import { cors } from "hono/cors"
import { router as itemsRouter } from "./models/items/index.js"
import { internalError } from "./shared/error.js"
import type { ProblemDetails } from "./types/api.js"
import { prettyJSON } from "hono/pretty-json"

/**
 * Worker environment. `CORS_ORIGIN` is the allowed origin for CORS
 * (defaults to `*` when unset).
 */
type Env = { Bindings: { CORS_ORIGIN?: string } }

/** The API app. Exported as the Worker's default fetch handler. */
const app = new Hono<Env>()

// CORS middleware
// Bindings are only available per request on Workers, not at module scope,
// so the origin is resolved lazily through the callback form.
app.use(cors({ origin: (_origin, c) => c.env.CORS_ORIGIN || "*" }))

// Pretty print JSON responses
app.use(prettyJSON({ force: true }))

// /static/* is served by Workers Static Assets before reaching this app.
// Do not enable `run_worker_first` in wrangler.jsonc: it would route image
// requests through the Worker and make them billable.

// Health check. Registered before the items so that `/health` is not an item
// (`build/parser.ts` rejects reserved slugs)
app.get("/health", (c) => c.json({ status: "ok" }))

// API routes - no prefix
app.route("/", itemsRouter)

// 404 handler
app.notFound((c) => {
  const problem: ProblemDetails = {
    type: "https://www.nandenjin.com/probs/not-found",
    title: "Not Found",
    status: 404,
    detail: "The requested endpoint does not exist",
    instance: c.req.url,
  }
  return c.json(problem, 404, {
    "Content-Type": "application/problem+json",
  })
})

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err)
  return internalError(c, err.message)
})

export default app
