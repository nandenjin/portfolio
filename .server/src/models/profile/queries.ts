import { profile } from "../../shared/content"
import type { Profile } from "../../types/content"

/**
 * Returns the profile document.
 *
 * @returns The profile, or `null` if it is unavailable.
 */
export function getProfile(): Profile | null {
  return profile
}
