# Publish Blog to Web — Obsidian Plugin

Publish notes directly from Obsidian to one or more websites running the `/api/publish` endpoint.

## Setup

1. **Install dependencies** — `cd publish-blog-to-web && npm install`
2. **Build** — `npm run build` (produces `main.js`)
3. **Install in Obsidian** — Copy `manifest.json` and `main.js` into your vault at `.obsidian/plugins/publish-blog-to-web/`
4. **Enable** — Open Obsidian Settings → Community Plugins → enable "Devin Marshall Blog Publisher"
5. **Configure** — Add one or more sites in the plugin settings (name, URL, API key)

## Multi-Site Support

Add as many sites as you need in Settings. Each site has its own name, URL, and API key.

- **1 site configured** — commands publish directly to it
- **2+ sites configured** — a picker appears so you can choose the target

To add a site to your other projects, deploy the same `/api/publish` route and set a `PUBLISH_API_KEY` in that project's `.env.local`.

Copy that value into the plugin settings in Obsidian (Settings → Publish Blog to Web → API Key for your site).

If you ever need to generate a new one (e.g. for a second site like lifescape.x), just run this in a terminal to get a random secure key:

```
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

## Commands

| Command | Behaviour |
|---------|-----------|
| **Publish to Blog** | Uses frontmatter `status` or the default status from settings |
| **Publish as Draft** | Forces `status: draft` regardless of frontmatter |
| **Publish Live** | Forces `status: published` regardless of frontmatter |

## Frontmatter

Add YAML frontmatter to control post metadata:

```yaml
---
title: My Post Title
slug: my-post-title
excerpt: A short summary
type: blog
status: draft
tags: [javascript, web]
pillar: Technology
coverImage: https://example.com/image.jpg
featured: false
---
```

- **title** — defaults to the file name if omitted
- **slug** — auto-generated from title if omitted
- **status** — `draft` or `published` (overridden by specific commands)
- All other fields are optional

## Upsert Behaviour

Publishing a note with the same slug as an existing entry will **update** that entry instead of creating a duplicate.
