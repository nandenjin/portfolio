import { Hono } from "hono"
import { getNews, getNewsById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"

const router = new Hono()

// GET /v1/news.json
router.get("news.json", (c) => {
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100)
  const offset = parseInt(c.req.query("offset") || "0")

  const result = getNews({ limit, offset })

  setListHeaders(c, result.total, limit, offset)
  return c.json(result.data)
})

// GET /v1/news/:id.json
router.get("news/:id.json", (c) => {
  const id = c.req.param("id.json").replace(/\.json$/, "")
  const news = getNewsById(id)

  if (!news) {
    return notFound(c, `News with id '${id}' not found`)
  }

  return c.json(news)
})

export default router
