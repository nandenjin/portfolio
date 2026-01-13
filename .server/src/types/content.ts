export interface Work {
  id: string
  title_en: string
  title_ja: string
  creator: string
  materials: string
  year: number
  tags: string[]
  thumbnail: string | null
  release: string
  info?: string | null
  body_html: string
  created_at?: string
}

export interface Event {
  id: string
  is_exhibition: boolean
  title_ja: string
  title_en: string
  session_start: string
  session_end: string
  locations: EventLocation[]
  related_works: string[]
  thumbnail: string | null
  external_infos?: EventExternalInfo[] | null
  body_html: string
  created_at?: string
}

export interface EventLocation {
  title_ja?: string
  title_en?: string
  lat?: number
  lng?: number
  address?: string
}

export interface EventExternalInfo {
  title_ja?: string
  title_en?: string
  url?: string
}

export interface News {
  id: string
  title_en: string
  title_ja: string
  tags: string[]
  release: string
  body_html: string
  created_at?: string
}

export interface WorkFrontmatter {
  title_en: string
  title_ja: string
  creator: string
  materials: string
  year: number
  tags?: string
  thumbnail?: string
  release: string
  info?: string
}

export interface EventFrontmatter {
  is_exhibition?: boolean
  title_ja: string
  title_en: string
  session_start: string
  session_end: string
  locations?: EventLocation[]
  related_works?: string[]
  thumbnail?: string
  external_infos?: EventExternalInfo[]
}

export interface NewsFrontmatter {
  title_en: string
  title_ja: string
  tags?: string
  release: string
}
