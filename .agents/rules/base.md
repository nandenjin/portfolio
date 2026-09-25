# Portfolio Repository Guide for AI Agents

This document provides rules and guidelines for AI agents to update this portfolio repository.

## Overview

This repository manages the master content for the portfolio of Kazumi Inada, an artist and technical director.

- **Frontend**: https://github.com/nandenjin/kzmi.jp (served at kzmi.jp and www.nandenjin.com)
- **API**: `.server/` builds the content into a JSON-LD API (Cloudflare Workers)

## Directory Structure

```
portfolio/
├── items/              # Every page, flat
│   └── slug/
│       ├── index.md    # Page content + JSON-LD
│       └── *.jpg       # Page assets
├── .server/            # JSON-LD API (build + Worker)
├── .scripts/           # Validation scripts
│   └── check-links.ts  # Link validation script
└── .github/workflows/  # CI/CD workflows
```

## Items

All pages (works, events, news, the about page) live side by side in `items/`.
There is no content type in the storage location or the URL: `items/<slug>/`
is published at `/<slug>`.

What kind of page an item is comes from the JSON-LD `@type`, and the frontend
chooses its layout and list (Works / Events / News) from it:

| `@type`                                                            | Shown as | Sort date       |
| ------------------------------------------------------------------ | -------- | --------------- |
| `NewsArticle`                                                      | News     | `datePublished` |
| `Event`, `ExhibitionEvent`                                         | Event    | `startDate`     |
| `CreativeWork`, `VisualArtwork`, `VideoObject`, `Photograph`, etc. | Work     | `datePublished` |
| `Person`                                                           | About    | -               |

Thematic grouping is done with `keywords` (tags).

### Slugs

- Alphanumeric characters, hyphens and underscores, unique across all items
- News articles keep a date prefix: `YYMMDD_slug` (e.g. `251203_information-design`)
- Works and events use a plain slug (e.g. `suzuna`, `kamine-expoc25`)
- One subject, one page: when a work and an event are the same thing, write one
  page instead of two
- Reserved (the build fails on them): `works`, `events`, `news`, `profile`,
  `health`, `static`, `cdn-cgi`, `sitemap.xml`

### `index.md`

Markdown body, followed by exactly one JSON-LD script:

```markdown
Japanese paragraph.

English paragraph.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": [
    { "@value": "日本語タイトル", "@language": "ja" },
    { "@value": "English Title", "@language": "en" }
  ],
  "description": [
    { "@value": "日本語の説明", "@language": "ja" },
    { "@value": "English description", "@language": "en" }
  ],
  "datePublished": "2025-01-01",
  "keywords": ["art", "video"],
  "image": ["/items/slug/thumbnail.jpg"],
  "url": "/items/slug/index.md",
  "mainEntityOfPage": "/items/slug/index.md"
}
</script>
```

Look at existing items of the same `@type` for the usual properties:

- News: `headline`, `description`, `datePublished`, `dateModified`, `keywords`, `mentions`
- Works: `name`, `description`, `creator`, `material`, `dateCreated`, `datePublished`, `keywords`
- Events: `name`, `description`, `startDate`, `endDate`, `location`, `workFeatured`, `sameAs`

The first entry of `image` is used as the thumbnail.

## Paths

Refer to anything in the repository by its file path from the repository root,
both in Markdown and in JSON-LD:

```markdown
[Link text](/items/suzuna/index.md)
![](/items/suzuna/thumbnail.jpg)
```

```json
"url": "/items/suzuna/index.md",
"workFeatured": [{ "@type": "CreativeWork", "url": "/items/suzuna/index.md" }]
```

The API build resolves page links to their public paths (`/suzuna`) and assets
to `/static/items/...`. These links also work when browsing the repository on
GitHub.

### Assets

- Store assets next to `index.md` in the item directory
- Thumbnail: `thumbnail.jpg`; other images: `00.jpg`, `01.jpg`, ... or descriptive names
- WebP or JPEG recommended; compress them, thumbnails especially

### Link Validation

`.scripts/check-links.ts` validates all internal links in Markdown files:

- Links and images in the body must exist
- Paths in JSON-LD must point to existing files (not directories)

## Old URLs

The site used to have typed URLs. The frontend redirects them permanently:

- `/works/<slug>`, `/events/<slug>`, `/news/<slug>` → `/<slug>`
- `/profile` → `/about`

Hence, never rename an existing slug without adding a redirect in the frontend.

## Code Quality & Formatting

All Markdown, JSON, and YAML files are formatted with Prettier (`.prettierrc.json`,
version `3.7.4`). `simple-git-hooks` and `lint-staged` format staged files on commit.

## Workflow

### Adding an Item

1. Pick the slug (`YYMMDD_slug` for news) and check it is not taken
2. Create `items/<slug>/index.md` with the body and the JSON-LD
3. Place assets in `items/<slug>/`
4. Link related items (e.g. a news article to its event, an event to its works via `workFeatured`)
5. Validate links and commit

### CI

- `checks`: link validation
- `server`: typecheck and build of the API

## Best Practices

- **Bilingual**: Give `name` / `headline` / `description` in both `ja` and `en`, and write English paragraphs after Japanese ones in the body
- **Dates**: `YYYY-MM-DD` (ISO 8601); the `YYMMDD` prefix of a news slug matches its `datePublished`
- **Tags**: Reuse existing `keywords` (`art`, `stage`, `video`, `photo`, `talk`, `education`, ...)
- **Links**: Keep internal links valid; verify external links when possible

## Validation Checklist

- [ ] Slug follows the conventions and is unique
- [ ] `index.md` has one JSON-LD script with `@type`, `url` and `mainEntityOfPage`
- [ ] Written in both Japanese and English
- [ ] Internal links and images use file paths (`/items/slug/index.md`, `/items/slug/image.jpg`)
- [ ] Date format is correct
- [ ] Tags are appropriate

## Copyright Notice

All content is the copyrighted work of Kazumi Inada and protected by copyright law. Respect copyright notices when adding or updating content.

## Contact

For questions or clarifications:

- Email: hello@nandenjin.com
- GitHub Issues: https://github.com/nandenjin/portfolio/issues
