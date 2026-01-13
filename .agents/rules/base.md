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
├── news/           # News articles
│   └── YYMMDD_slug/
│       ├── index.md    # Article content
│       └── *.jpg       # Article assets
├── works/          # Work information
│   └── slug/
│       ├── index.md    # Work content
│       └── *.jpg       # Work assets
├── events/         # Event and exhibition information
│   └── slug/
│       ├── index.md    # Event content
│       └── *.jpg       # Event assets
├── profile/        # Profile
│   └── index.md
├── .scripts/       # Validation scripts
│   └── check-links.ts  # Link validation script
└── .github/workflows/  # CI/CD workflows
```

## Content Types

### 1. News (`news/`)

#### Directory Naming Convention

Use `YYMMDD_slug/` format:

- `YY`: Last 2 digits of year
- `MM`: Month (2 digits)
- `DD`: Day (2 digits)
- `slug`: Short identifier composed of alphanumeric characters and hyphens

Example: `251203_information-design/`

Content is stored in `index.md` within each directory.

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

### 2. Works (`works/`)

#### Directory Naming Convention

Use `slug/` format (no date prefix):

- Short alphanumeric identifier with hyphens representing the work name
- Examples: `suzuna/`, `ushio-rpng/`, `room-of-observation/`

Content is stored in `index.md` within each directory.

#### Front Matter

```yaml
---
title_en: English Title
title_ja: 日本語タイトル
creator: Credit (creator/organization name)
materials: Media/materials used
year: Production year
tags: tag1 tag2 tag3
thumbnail: /works/slug/thumbnail.jpg
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

### 3. Events (`events/`)

#### Directory Naming Convention

Use `slug/` format:

- Short alphanumeric identifier with hyphens representing the event name
- Examples: `kamine-expoc25/`, `tmaf25/`

Content is stored in `index.md` within each directory.

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
thumbnail: /events/slug/image.jpg
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

Assets are stored alongside content within each directory:

```
news/YYMMDD_slug/
├── index.md
├── thumbnail.jpg
└── image.jpg

works/slug/
├── index.md
├── thumbnail.jpg
├── 00.jpg
└── 01.jpg

events/slug/
├── index.md
└── image.jpg
```

### Naming Convention

- Thumbnail: `thumbnail.jpg`
- Other images: Sequential numbers like `00.jpg`, `01.jpg`, `02.jpg`..., or descriptive alphanumeric names

### Path Reference

Reference with absolute path format in Markdown:

```markdown
![](/works/suzuna/thumbnail.jpg)
![](/events/kamine-expoc25/image.jpg)
```

## Internal Links

### Link Format

Internal links must be written as absolute paths:

```markdown
[Link text](/works/suzuna/)
[Exhibition details](/events/kamine-expoc25/)
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

1. **Create directory**: Create directory with appropriate naming convention
2. **Create index.md**: Create `index.md` file in the directory
3. **Write Front Matter**: Write proper Front Matter including required fields
4. **Write content**: Write content in both Japanese and English
5. **Place assets**: Place necessary images in the same directory
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
2. Create directory `news/YYMMDD_slug/`
3. Create `news/YYMMDD_slug/index.md`
4. Write Front Matter and content
5. Place images in `news/YYMMDD_slug/` if needed
6. Commit changes

### Adding a New Work

1. Determine work slug
2. Create directory `works/slug/`
3. Create `works/slug/index.md`
4. Write Front Matter and content
5. Place thumbnail and images in `works/slug/`
6. Commit changes

### Adding Event Information

1. Determine event slug
2. Create directory `events/slug/`
3. Create `events/slug/index.md`
4. Write Front Matter (venue info, schedule, etc.) and content
5. Place images in `events/slug/`
6. Create related news article in `news/` if needed
7. Commit changes

## Validation Checklist

When adding or updating content:

- [ ] Following file naming conventions
- [ ] All required Front Matter fields are filled in
- [ ] Written in both Japanese and English
- [ ] Internal links written with correct paths (absolute paths like `/works/slug/`)
- [ ] Image paths are correct (absolute paths like `/works/slug/image.jpg`)
- [ ] Index file (`index.md`) is updated (if applicable)
- [ ] Date format is correct
- [ ] Tags are appropriate

## Copyright Notice

All content is the copyrighted work of Kazumi Inada and protected by copyright law. Respect copyright notices when adding or updating content.

## Contact

For questions or clarifications:

- Email: hello@nandenjin.com
- GitHub Issues: https://github.com/nandenjin/portfolio/issues
