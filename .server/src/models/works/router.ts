import { Hono } from "hono"
import { getWorks, getWorkById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"
import { toApiJsonLd } from "../../shared/jsonld"
import { parsePagination } from "../../shared/pagination"

const router = new Hono()

// GET /works
router.get("works", (c) => {
  const { limit, offset } = parsePagination((name) => c.req.query(name))

  const result = getWorks({ limit, offset })
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

// GET /works/:id
router.get("works/:id", (c) => {
  const id = c.req.param("id")
  const work = getWorkById(id)

  if (!work) {
    return notFound(c, `Work with id '${id}' not found`)
  }

  const lang = c.req.query("lang")
  const origin = new URL(c.req.url).origin
  return c.json(
    toApiJsonLd(work.jsonld, {
      lang,
      origin,
    }),
  )
})

export default router
