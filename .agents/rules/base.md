# Portfolio Repository Guide for AI Agents

This document provides rules and guidelines for AI agents to update this portfolio repository.

## Overview

This repository manages the master content for the portfolio of Kazumi Inada, an artist and technical director.

- **Public Site**: https://www.nandenjin.com
- **Build Repository**: https://github.com/nandenjin/nandenjin.com
- Pushing to this repository automatically triggers the CI/CD pipeline in the build repository

## Directory Structure

```
portfolio/
├── pages/          # Content files (Markdown)
│   ├── news/       # News articles
│   ├── works/      # Work information
│   ├── events/     # Event and exhibition information
│   └── profile/    # Profile
├── assets/         # Media files (images, videos, etc.)
│   ├── news/       # Assets for news articles
│   ├── works/      # Assets for works
│   ├── events/     # Assets for events
│   └── profile/    # Assets for profile
├── .scripts/       # Validation scripts
│   └── check-links.ts  # Link validation script
└── .github/workflows/  # CI/CD workflows
```

## Content Types

### 1. News (`pages/news/`)

#### File Naming Convention

Use `YYMMDD_slug.md` format:

- `YY`: Last 2 digits of year
- `MM`: Month (2 digits)
- `DD`: Day (2 digits)
- `slug`: Short identifier composed of alphanumeric characters and hyphens

Example: `251203_information-design.md`

#### Front Matter

```yaml
---
title_en: English title
title_ja: 日本語タイトル
tags: tag1 tag2 tag3
release: YYYY-MM-DD
---
```

#### Required Fields

- `title_en`: English title
- `title_ja`: Japanese title
- `release`: Release date (YYYY-MM-DD format)

#### Optional Fields

- `tags`: Space-separated list of tags
  - Examples: `talk`, `education`, `art`, `stage`, `video`, `photo`, etc.

#### Index File

Manually maintain a list in `pages/news/index.md` in chronological order (newest first). When adding a new article, add it to the **beginning** of this file.

List format:

```markdown
- [日本語タイトル / English Title](/pages/news/YYMMDD_slug.md)
```

### 2. Works (`pages/works/`)

#### File Naming Convention

Use `slug.md` format (no date prefix):

- Short alphanumeric identifier with hyphens representing the work name
- Examples: `suzuna.md`, `ushio-rpng.md`, `room-of-observation.md`

#### Front Matter

```yaml
---
title_en: English Title
title_ja: 日本語タイトル
creator: Credit (creator/organization name)
materials: Media/materials used
year: Production year
tags: tag1 tag2 tag3
thumbnail: /assets/works/slug/thumbnail.jpg
release: YYYY-MM-DD
---
```

#### Required Fields

- `title_en`: English title
- `title_ja`: Japanese title
- `release`: Release date (YYYY-MM-DD format)

#### Optional Fields

- `creator`: Credit
- `materials`: Media used (e.g., `Video, Photo`)
- `year`: Production year (e.g., `2025`)
- `tags`: Tag list (e.g., `stage video photo musubiza`)
- `thumbnail`: Thumbnail image path

#### Index File

Manually maintain a work list in `pages/works/index.md`. Add new works at the appropriate position (typically newest first).

### 3. Events (`pages/events/`)

#### File Naming Convention

Use `slug.md` format:

- Short alphanumeric identifier with hyphens representing the event name
- Examples: `kamine-expoc25.md`, `tmaf25.md`

#### Front Matter

```yaml
---
is_exhibition: true # For exhibitions
title_ja: 日本語タイトル
title_en: English Title
session_start: YYYY-MM-DD
session_end: YYYY-MM-DD
locations:
  - title_ja: 会場名(日本語)
    title_en: Venue Name (English)
    lat: Latitude
    lng: Longitude
    address: Address
related_works:
  - work-slug
thumbnail: /assets/events/slug/image.jpg
external_infos:
  - title_ja: 外部リンクタイトル
    url: https://example.com
---
```

#### Required Fields

- `title_ja`: Japanese title
- `title_en`: English title
- `session_start`: Start date
- `session_end`: End date

#### Optional Fields

- `is_exhibition`: Whether it's an exhibition (boolean)
- `locations`: Venue information (array)
- `related_works`: Related work slugs (array)
- `thumbnail`: Thumbnail image path
- `external_infos`: External link information (array)

## Asset Management

### Directory Structure

Assets corresponding to each content type are placed under `assets/`:

```
assets/
├── works/slug/
│   ├── thumbnail.jpg
│   ├── 00.jpg
│   └── 01.jpg
├── events/slug/
│   └── image.jpg
└── news/slug/
    └── image.jpg
```

### Naming Convention

- Thumbnail: `thumbnail.jpg`
- Other images: Sequential numbers like `00.jpg`, `01.jpg`, `02.jpg`..., or descriptive alphanumeric names

### Path Reference

Reference with absolute path format in Markdown:

```markdown
![](/assets/works/suzuna/thumbnail.jpg)
```

## Internal Links

### Link Format

Internal links must be written as absolute paths starting with `/pages/`:

```markdown
[Link text](/pages/works/suzuna.md)
[Exhibition details](/pages/events/kamine-expoc25.md)
```

### Link Validation

The `.scripts/check-links.ts` script validates all links in Markdown files:

- Checks existence of internal links (starting with `/` or `./`)
- Validates thumbnails and related works in Front Matter

## Code Quality & Formatting

### Prettier

All Markdown, JSON, and YAML files are formatted with Prettier.

- Configuration: `.prettierrc.json`
- Version: `3.7.4` (Do not use Prettier 2 or earlier)

### Pre-commit Hooks

`simple-git-hooks` and `lint-staged` automatically format files before commit:

```json
{
  "*.{js,ts,tsx,json,md,css,scss,html,yml,yaml}": "prettier --write"
}
```

## Workflow

### Content Addition Workflow

1. **Create file**: Create Markdown file in the appropriate directory following naming conventions
2. **Write Front Matter**: Write proper Front Matter including required fields
3. **Write content**: Write content in both Japanese and English
4. **Place assets**: Place necessary images in the appropriate directory under `assets/`
5. **Update index**: Add new entry to `index.md` file (for News and Works)
6. **Validate links**: Verify internal links are correct
7. **Commit**: Commit after automatic formatting by Prettier

### CI/CD

- **Trigger**: Push to `master` branch
- **Action**: Automatically triggers the Delivery workflow in the build repository (`nandenjin/nandenjin.com`)
- **Result**: Changes are automatically reflected on the website

## Best Practices

### 1. Bilingual Support (Japanese/English)

All content should be written in both Japanese and English:

- Write both `title_ja` and `title_en` in Front Matter
- Write English paragraphs after Japanese paragraphs in the content

### 2. Date Consistency

- File name date: `YYMMDD` format
- Front Matter date: `YYYY-MM-DD` format (ISO 8601)
- Always maintain consistency

### 3. Tag Usage

Check existing tags and use standardized tags whenever possible:

- `art`, `stage`, `video`, `photo`, `talk`, `education`, etc.

### 4. Image Optimization

- Compress to appropriate size
- WebP or JPEG format recommended
- Especially prioritize optimization for thumbnails

### 5. Link Accuracy

- Always validate internal links
- Verify external links when possible
- Avoid broken links

## Common Operations for AI Agents

### Adding a New News Article

1. Determine date and slug (`YYMMDD_slug`)
2. Create `pages/news/YYMMDD_slug.md`
3. Write Front Matter and content
4. Place images in `assets/news/slug/` if needed
5. Add new entry to the **beginning** of `pages/news/index.md`
6. Commit changes

### Adding a New Work

1. Determine work slug
2. Create `pages/works/slug.md`
3. Write Front Matter and content
4. Place thumbnail and images in `assets/works/slug/`
5. Commit changes

Note: Adding new entry in `/pages/works/index.md` should be executed manually by human, because this list is curated. Ask about it if it seems to be needed.

### Adding Event Information

1. Determine event slug
2. Create `pages/events/slug.md`
3. Write Front Matter (venue info, schedule, etc.) and content
4. Place images in `assets/events/slug/`
5. Create related news article in `pages/news/` if needed
6. Commit changes

## Validation Checklist

When adding or updating content:

- [ ] Following file naming conventions
- [ ] All required Front Matter fields are filled in
- [ ] Written in both Japanese and English
- [ ] Internal links written with correct paths (starting with `/pages/`)
- [ ] Image paths are correct (starting with `/assets/`)
- [ ] Index file (`index.md`) is updated (if applicable)
- [ ] Date format is correct
- [ ] Tags are appropriate

## Copyright Notice

All content is the copyrighted work of Kazumi Inada and protected by copyright law. Respect copyright notices when adding or updating content.

## Contact

For questions or clarifications:

- Email: hello@nandenjin.com
- GitHub Issues: https://github.com/nandenjin/portfolio/issues
