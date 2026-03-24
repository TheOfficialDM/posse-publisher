# Changelog

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
