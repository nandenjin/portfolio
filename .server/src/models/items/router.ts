import { Hono } from "hono"
import { getItems, getItemById } from "./queries"
import { setListHeaders } from "../../shared/response"
import { notFound } from "../../shared/error"
import { toApiJsonLd } from "../../shared/jsonld"
import { parsePagination } from "../../shared/pagination"

const router = new Hono()

// GET / - every item, newest first
router.get("/", (c) => {
  const { limit, offset } = parsePagination((name) => c.req.query(name))

  const result = getItems({ limit, offset })
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

// GET /:id - an item, at the same path as its JSON-LD `url`
router.get("/:id", (c) => {
  const id = c.req.param("id")
  const item = getItemById(id)

  if (!item) {
    return notFound(c, `Item with id '${id}' not found`)
  }

  const lang = c.req.query("lang")
  const origin = new URL(c.req.url).origin
  return c.json(
    toApiJsonLd(item.jsonld, {
      lang,
      origin,
    }),
  )
})

export default router
