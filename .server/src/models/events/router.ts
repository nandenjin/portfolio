import { Hono } from "hono"
import { getEvents, getEventById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"
import { toApiJsonLd } from "../../shared/jsonld"

const router = new Hono()

// GET /events
router.get("events", (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100)
  const offset = parseInt(c.req.query("offset") || "0")

  const result = getEvents({ limit, offset })
  const lang = c.req.query("lang")
  const origin = new URL(c.req.url).origin

  setListHeaders(c, result.total, limit, offset)
  return c.json(
    result.data.map((item) =>
      toApiJsonLd(item.jsonld, {
        lang,
        origin,
        includeBodyHtml: false,
      }),
    ),
  )
})

// GET /events/:id
router.get("events/:id", (c) => {
  const id = c.req.param("id")
  const event = getEventById(id)

  if (!event) {
    return notFound(c, `Event with id '${id}' not found`)
  }

  const lang = c.req.query("lang")
  const origin = new URL(c.req.url).origin
  return c.json(
    toApiJsonLd(event.jsonld, {
      lang,
      origin,
    }),
  )
})

export default router
