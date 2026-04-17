# Changelog

## Compatibility Notes

### April 2026 — devinmarshall.info `/api/publish` Response Update
The website's `/api/publish` endpoint now returns a top-level `url` field with the correct canonical path (e.g. `https://devinmarshall.info/content/blog/my-post-slug`). This fixes the syndication URL written back into Obsidian frontmatter, which previously fell back to `{destination.url}/{slug}` — a path that didn't resolve. No plugin-side changes are required; the plugin already reads `response.json.url` when present.

---

## 2.1.0

**Foundation for multi-platform syndication**

### Fixed
- `canonicalUrl` frontmatter field now respected as an override — previously ignored even when set explicitly in a note; auto-generation still applies when the field is absent
- `writeSyndication()` now updates the URL of an existing syndication entry on republish instead of silently skipping it
- Removed deprecated `baseUrl` from `tsconfig.json` (redundant with `moduleResolution: "bundler"`)

### New
- **5 new destination types** in settings UI: `medium`, `reddit`, `threads`, `linkedin`, `ecency` — full credential configuration available; platform publishing ships in upcoming releases
- `buildPayload()` — shared internal method replacing duplicated logic between `preparePublish()` and `posseToAll()`
- `markdownToHtml()` — zero-dependency Markdown→HTML converter for platforms that require HTML body content
- `markdownToPlainText()` — strips all Markdown syntax for character-limited platforms (Threads, LinkedIn)
- **Support section** added to plugin settings with Buy Me a Coffee, GitHub Sponsors, and Fund buttons
- **Support section** added to README with donation table and QR code

### Changed
- `manifest.json` `fundingUrl` updated to `https://devinmarshall.info/fund`
- `manifest.json` description updated to mention all planned syndication platforms
- README Destinations table updated to include all 9 platform types
- README intro updated to mention all supported platforms
- README legacy "Publish Blog to Web" duplicate content removed

---

## 2.0.0

**POSSE Publisher — Major rebrand & architecture upgrade**

> **Breaking change:** Plugin ID changed from `publish-blog-to-web` to `posse-publisher`. Settings will be reset in existing vaults. Re-add your destinations in the plugin settings after upgrading.

### New
- Rebranded to **POSSE Publisher** — aligns with IndieWeb POSSE philosophy (Publish on your Own Site, Syndicate Elsewhere)
- `canonicalBaseUrl` setting — declare your canonical site URL; every payload now includes `canonicalUrl`
- Syndication tracking — successful publish URLs written back to note frontmatter via `syndication:` field using `processFrontMatter()`
- Multi-destination publishing — native support for **Dev.to**, **Mastodon**, and **Bluesky** alongside custom API endpoints
- **POSSE to All** command — syndicate to every configured destination sequentially in one action, skipping any with unconfigured credentials
- **POSSE Status** command — modal showing where the current note has been published, with links to each syndicated copy
- Destination `type` field — `custom-api`, `devto`, `mastodon`, or `bluesky` — with type-specific credential UI in settings
- `canonicalUrl` and `syndication: []` added to the Insert Frontmatter Template

### Changed
- Class `PublishBlogToWebPlugin` → `PossePublisherPlugin`
- Command IDs: `publish-to-blog` → `posse-publish`, `publish-draft` → `posse-publish-draft`, etc.
- CSS classes: `.publish-blog-to-web-*` → `.posse-publisher-*`
- Settings migration added: `sites` key preserved, `siteUrl` v1 key still migrated

---

## 1.0.0

- Initial release
- Multi-site publishing with site picker modal
- Three commands: Publish to Blog, Publish as Draft, Publish Live
- YAML frontmatter parsing (title, slug, excerpt, type, status, tags, pillar, coverImage, featured, metaTitle, metaDescription, ogImage, videoUrl)
- Auto slug generation from title
- Upsert behaviour (updates existing posts by slug)
- Settings migration from single-site (v1) to multi-site (v2) format
- Obsidian-markdown preprocessing (strips wiki-links, embeds, comments, dataview blocks)
- Ribbon icon for quick publishing
- Insert Frontmatter Template command
- Pre-publish confirmation modal
- Status bar indicator on successful publish
- Test Connection button in settings
- API key masking in settings
