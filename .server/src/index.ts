import { Hono } from "hono"
import type { Context } from "hono"
import { cors } from "hono/cors"
import { router as worksRouter } from "./models/works/index.js"
import { router as eventsRouter } from "./models/events/index.js"
import { router as newsRouter } from "./models/news/index.js"
import { getProfile } from "./models/profile/index.js"
import { internalError, notFound } from "./shared/error.js"
import { toApiJsonLd } from "./shared/jsonld.js"
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

// API routes - no prefix
app.route("/", worksRouter)
app.route("/", eventsRouter)
app.route("/", newsRouter)

const handleProfileRoot = (c: Context<Env>) => {
  const profile = getProfile()
  if (!profile) {
    return notFound(c, "Profile not found")
  }

  const lang = c.req.query("lang")
  const origin = new URL(c.req.url).origin
  return c.json(
    toApiJsonLd(profile.jsonld, {
      lang,
      origin,
    }),
  )
}

app.get("/", handleProfileRoot)

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

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
