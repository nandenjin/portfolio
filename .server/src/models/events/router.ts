import { Hono } from "hono"
import { getEvents, getEventById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"

const router = new Hono()

// GET /v1/events.json
router.get("events.json", (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100)
  const offset = parseInt(c.req.query("offset") || "0")

  const result = getEvents({ limit, offset })

  setListHeaders(c, result.total, limit, offset)
  return c.json(result.data)
})

// GET /v1/events/:id.json
router.get("events/:id.json", (c) => {
  const id = c.req.param("id.json").replace(/\.json$/, "")
  const event = getEventById(id)

  if (!event) {
    return notFound(c, `Event with id '${id}' not found`)
  }

  return c.json(event)
})

export default router
