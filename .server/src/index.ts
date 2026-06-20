import { Hono } from "hono"
import type { Context } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "@hono/node-server/serve-static"
import { serve } from "@hono/node-server"
import { router as worksRouter } from "./models/works/index.js"
import { router as eventsRouter } from "./models/events/index.js"
import { router as newsRouter } from "./models/news/index.js"
import { getProfile } from "./models/profile/index.js"
import { internalError, notFound } from "./shared/error.js"
import { toApiJsonLd } from "./shared/jsonld.js"
import type { ProblemDetails } from "./types/api.js"
import { prettyJSON } from "hono/pretty-json"

const app = new Hono()

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
)

// Pretty print JSON responses
app.use(prettyJSON({ force: true }))

// Static assets
app.use("/static/*", serveStatic({ root: "./dist" }))

// API routes - no prefix
app.route("/", worksRouter)
app.route("/", eventsRouter)
app.route("/", newsRouter)

const handleProfileRoot = (c: Context) => {
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

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
console.log(`Server starting on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
