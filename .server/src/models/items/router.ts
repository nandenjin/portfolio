import { Hono } from "hono"
import { getItems, getItemById, ORDERS, type Order } from "./queries"
import { setListHeaders } from "../../shared/response"
import { badRequest, notFound } from "../../shared/error"
import { toApiJsonLd } from "../../shared/jsonld"
import { parsePagination } from "../../shared/pagination"

const router = new Hono()

// GET / - every item, featured works first (`?order=featured`, the default)
// or newest first (`?order=date`)
router.get("/", (c) => {
  const { limit, offset } = parsePagination((name) => c.req.query(name))

  const order = c.req.query("order") ?? "featured"
  if (!isOrder(order)) {
    return badRequest(c, `order must be one of: ${ORDERS.join(", ")}`)
  }

  const result = getItems({ order, limit, offset })
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

function isOrder(value: string): value is Order {
  return (ORDERS as readonly string[]).includes(value)
}

export default router
