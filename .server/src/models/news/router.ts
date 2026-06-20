import { Hono } from "hono"
import { getNews, getNewsById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"
import { toApiJsonLd } from "../../shared/jsonld"
import { parsePagination } from "../../shared/pagination"

const router = new Hono()

// GET /news
router.get("news", (c) => {
  const { limit, offset } = parsePagination((name) => c.req.query(name))

  const result = getNews({ limit, offset })
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

// GET /news/:id
router.get("news/:id", (c) => {
  const id = c.req.param("id")
  const news = getNewsById(id)

  if (!news) {
    return notFound(c, `News with id '${id}' not found`)
  }

  const lang = c.req.query("lang")
  const origin = new URL(c.req.url).origin
  return c.json(
    toApiJsonLd(news.jsonld, {
      lang,
      origin,
    }),
  )
})

export default router
