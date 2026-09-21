import { Hono } from "hono"
import type { Context } from "hono"
import { getProfile } from "./queries"
import { notFound } from "../../shared/error"

const router = new Hono()

function handleRootProfile(c: Context) {
  const profile = getProfile()

  if (!profile) {
    return notFound(c, "Profile not found")
  }

  return c.json(profile.jsonld)
}

// GET /v1 and GET /v1/
router.get("", handleRootProfile)
router.get("/", handleRootProfile)

export default router
