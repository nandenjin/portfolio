import { Hono } from "hono"
import { getWorks, getWorkById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"

const router = new Hono()

// GET /v1/works.json
router.get("works.json", (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100)
  const offset = parseInt(c.req.query("offset") || "0")

  const result = getWorks({ limit, offset })

  setListHeaders(c, result.total, limit, offset)
  return c.json(result.data)
})

// GET /v1/works/:id.json
router.get("works/:id{[a-zA-Z0-9_-]+\\.json}", (c) => {
  const id = c.req.param("id").replace(/\.json$/, "")
  const work = getWorkById(id)

  if (!work) {
    return notFound(c, `Work with id '${id}' not found`)
  }

  return c.json(work)
})

export default router
