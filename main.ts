import {
  Plugin,
  PluginSettingTab,
  App,
  Setting,
  Notice,
  requestUrl,
  MarkdownView,
  Modal,
  SuggestModal,
  TFile,
} from "obsidian";

type DestinationType = "custom-api" | "devto" | "mastodon" | "bluesky" | "medium" | "reddit" | "threads" | "linkedin" | "ecency";

interface Destination {
  name: string;
  type: DestinationType;
  // custom-api
  url: string;
  apiKey: string;
  // mastodon
  instanceUrl?: string;
  accessToken?: string;
  // bluesky
  handle?: string;
  appPassword?: string;
  // medium
  mediumToken?: string;
  mediumAuthorId?: string;
  // reddit
  redditClientId?: string;
  redditClientSecret?: string;
  redditRefreshToken?: string;
  redditUsername?: string;
  redditDefaultSubreddit?: string;
  // threads
  threadsUserId?: string;
  threadsAccessToken?: string;
  // linkedin
  linkedinAccessToken?: string;
  linkedinPersonUrn?: string;
  // ecency / hive
  hiveUsername?: string;
  hivePostingKey?: string;
  hiveCommunity?: string;
}

interface PossePublisherSettings {
  destinations: Destination[];
  canonicalBaseUrl: string;
  defaultStatus: "draft" | "published";
  confirmBeforePublish: boolean;
  stripObsidianSyntax: boolean;
}

const DEFAULT_SETTINGS: PossePublisherSettings = {
  destinations: [],
  canonicalBaseUrl: "",
  defaultStatus: "draft",
  confirmBeforePublish: true,
  stripObsidianSyntax: true,
};

interface Frontmatter {
  title?: string;
  slug?: string;
  excerpt?: string;
  type?: string;
  status?: string;
  tags?: string[];
  pillar?: string;
  coverImage?: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  videoUrl?: string;
  canonicalUrl?: string;
}

/** Extract body content below the YAML frontmatter fence. */
function extractBody(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

/**
 * Build a Frontmatter object from Obsidian's cached metadata.
 * Falls back gracefully when fields are absent.
 */
function buildFrontmatter(cache: Record<string, unknown> | undefined): Frontmatter {
  if (!cache) return {};
  const fm: Frontmatter = {};

  if (typeof cache.title === "string") fm.title = cache.title;
  if (typeof cache.slug === "string") fm.slug = cache.slug;
  if (typeof cache.excerpt === "string") fm.excerpt = cache.excerpt;
  if (typeof cache.type === "string") fm.type = cache.type;
  if (typeof cache.status === "string") fm.status = cache.status;
  if (typeof cache.pillar === "string") fm.pillar = cache.pillar;
  if (typeof cache.coverImage === "string") fm.coverImage = cache.coverImage;
  if (typeof cache.metaTitle === "string") fm.metaTitle = cache.metaTitle;
  if (typeof cache.metaDescription === "string") fm.metaDescription = cache.metaDescription;
  if (typeof cache.ogImage === "string") fm.ogImage = cache.ogImage;
  if (typeof cache.videoUrl === "string") fm.videoUrl = cache.videoUrl;

  if (typeof cache.featured === "boolean") fm.featured = cache.featured;
  else if (cache.featured === "true") fm.featured = true;

  if (Array.isArray(cache.tags)) {
    fm.tags = cache.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
  } else if (typeof cache.tags === "string") {
    fm.tags = cache.tags
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
  }

  if (typeof cache.canonicalUrl === "string") fm.canonicalUrl = cache.canonicalUrl;

  return fm;
}

/** Convert a title string to a URL-safe slug, handling diacritics. */
export function toSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Pre-process Obsidian-specific markdown before sending to the blog API.
 * Strips wiki-links, embeds, comments, and dataview blocks.
 */
export function preprocessContent(body: string): string {
  // Remove Obsidian comments: %%...%%
  body = body.replace(/%%[\s\S]*?%%/g, "");

  // Convert wiki-link embeds: ![[file]] → (removed)
  body = body.replace(/!\[\[([^\]]+)\]\]/g, "");

  // Convert wiki-links with alias: [[target|alias]] → alias
  body = body.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");

  // Convert wiki-links without alias: [[target]] → target
  body = body.replace(/\[\[([^\]]+)\]\]/g, "$1");

  // Remove dataview code blocks
  body = body.replace(/```dataview[\s\S]*?```/g, "");
  body = body.replace(/```dataviewjs[\s\S]*?```/g, "");

  // Clean up excess blank lines left by removals
  body = body.replace(/\n{3,}/g, "\n\n");

  return body.trim();
}

/** Escape HTML special characters. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert basic Markdown to HTML. Handles headings, bold, italic, inline code,
 * links, images, lists, blockquotes, horizontal rules, fenced code blocks, and paragraphs.
 * No external dependencies — regex only.
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Fenced code blocks (process first to avoid mangling their contents)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(code.trim())}</code></pre>`
  );

  // Headings
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^[-*_]{3,}\s*$/gm, "<hr>");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Bold + italic (order: triple → double → single)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered list items
  html = html.replace(/^[-*+] (.+)$/gm, "<li>$1</li>");

  // Ordered list items
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Wrap <li> runs in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Paragraphs (double newline → paragraph block)
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

/**
 * Strip all Markdown syntax to produce plain text suitable for
 * character-limited platforms (Threads, Mastodon preview, etc.).
 */
export function markdownToPlainText(markdown: string): string {
  let text = markdown;
  // Fenced code blocks → keep content
  text = text.replace(/```\w*\n([\s\S]*?)```/g, "$1");
  // Remove heading markers
  text = text.replace(/^#{1,6} /gm, "");
  // Bold/italic markers
  text = text.replace(/\*{1,3}|_{1,3}/g, "");
  // Inline code → unwrap
  text = text.replace(/`([^`]+)`/g, "$1");
  // Images → alt text
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  // Links → link text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Blockquotes
  text = text.replace(/^> /gm, "");
  // List markers
  text = text.replace(/^[-*+\d.] /gm, "");
  // Horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

const FRONTMATTER_TEMPLATE = `---
title: 
slug: 
excerpt: 
type: blog
status: draft
tags: []
pillar: 
coverImage: 
featured: false
metaTitle: 
metaDescription: 
ogImage: 
videoUrl: 
canonicalUrl: 
syndication: []
---

`;

export default class PossePublisherPlugin extends Plugin {
  settings: PossePublisherSettings = DEFAULT_SETTINGS;
  private statusBarEl: HTMLElement | null = null;

  async onload() {
    await this.loadSettings();
    this.migrateSettings();

    this.statusBarEl = this.addStatusBarItem();

    this.addRibbonIcon("send", "Posse publish", () => {
      this.pickSiteAndPublish();
    });

    this.addCommand({
      id: "posse-publish",
      name: "Posse publish",
      callback: () => this.pickSiteAndPublish(),
    });

    this.addCommand({
      id: "posse-publish-draft",
      name: "Posse publish as draft",
      callback: () => this.pickSiteAndPublish("draft"),
    });

    this.addCommand({
      id: "posse-publish-live",
      name: "Posse publish live",
      callback: () => this.pickSiteAndPublish("published"),
    });

    this.addCommand({
      id: "posse-insert-template",
      name: "Posse insert frontmatter template",
      editorCallback: (editor) => {
        const content = editor.getValue();
        if (content.trimStart().startsWith("---")) {
          new Notice("Frontmatter already exists in this note");
          return;
        }
        editor.setCursor(0, 0);
        editor.replaceRange(FRONTMATTER_TEMPLATE, { line: 0, ch: 0 });
        // Place cursor on the title line
        editor.setCursor(1, 7);
      },
    });

    this.addCommand({
      id: "posse-to-all",
      name: "Posse to all destinations",
      callback: () => this.posseToAll(),
    });

    this.addCommand({
      id: "posse-status",
      name: "Posse status — view syndication",
      callback: () => this.posseStatus(),
    });

    this.addSettingTab(new PossePublisherSettingTab(this.app, this));
  }

  onunload() {
    this.statusBarEl = null;
  }

  /** Migrate from single-site settings (v1) to multi-site (v2) */
  private migrateSettings() {
    const raw = this.settings as unknown as Record<string, unknown>;
    // Migrate v1 single-site format
    if (typeof raw.siteUrl === "string" && raw.siteUrl) {
      this.settings.destinations = [
        {
          name: "Default",
          type: "custom-api",
          url: raw.siteUrl,
          apiKey: (raw.apiKey as string) || "",
        },
      ];
      delete raw.siteUrl;
      delete raw.apiKey;
      void this.saveSettings();
    }
    // Migrate sites → destinations key
    if (Array.isArray(raw.sites) && !Array.isArray(this.settings.destinations)) {
      this.settings.destinations = raw.sites as Destination[];
      delete raw.sites;
      void this.saveSettings();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!Array.isArray(this.settings.destinations)) {
      this.settings.destinations = [];
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private pickSiteAndPublish(overrideStatus?: "draft" | "published") {
    const { destinations } = this.settings;
    if (destinations.length === 0) {
      new Notice("Add at least one destination in settings");
      return;
    }
    if (destinations.length === 1) {
      void this.preparePublish(destinations[0], overrideStatus);
      return;
    }
    new SitePickerModal(this.app, destinations, (dest) => {
      void this.preparePublish(dest, overrideStatus);
    }).open();
  }

  /**
   * Build the publish payload from the active file and settings.
   * Shared by preparePublish() and posseToAll() to avoid duplication.
   */
  private async buildPayload(
    file: TFile,
    overrideStatus?: "draft" | "published",
  ): Promise<Record<string, unknown>> {
    const content = await this.app.vault.cachedRead(file);
    const fileCache = this.app.metadataCache.getFileCache(file);
    const frontmatter = buildFrontmatter(fileCache?.frontmatter);
    const body = extractBody(content);
    const processedBody = this.settings.stripObsidianSyntax ? preprocessContent(body) : body;
    const title = frontmatter.title || file.basename || "Untitled";
    const slug = frontmatter.slug || toSlug(title);
    const status = overrideStatus || frontmatter.status || this.settings.defaultStatus;
    const postType = frontmatter.type || "blog";
    // Use frontmatter canonicalUrl override if present; otherwise auto-generate
    const canonicalUrl =
      frontmatter.canonicalUrl ||
      (this.settings.canonicalBaseUrl
        ? `${this.settings.canonicalBaseUrl.replace(/\/$/, "")}/${postType}/${slug}`
        : "");
    return {
      title,
      slug,
      body: processedBody,
      excerpt: frontmatter.excerpt || "",
      type: postType,
      status,
      tags: frontmatter.tags || [],
      pillar: frontmatter.pillar || "",
      featured: frontmatter.featured || false,
      coverImage: frontmatter.coverImage || "",
      metaTitle: frontmatter.metaTitle || "",
      metaDescription: frontmatter.metaDescription || "",
      ogImage: frontmatter.ogImage || "",
      videoUrl: frontmatter.videoUrl || "",
      ...(canonicalUrl && { canonicalUrl }),
    };
  }

  private async preparePublish(destination: Destination, overrideStatus?: "draft" | "published") {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice("Open a Markdown file first");
      return;
    }

    if (!this.hasValidCredentials(destination)) {
      new Notice(`Configure credentials for "${destination.name}" in settings`);
      return;
    }

    const payload = await this.buildPayload(view.file, overrideStatus);

    if (this.settings.confirmBeforePublish) {
      new ConfirmPublishModal(this.app, payload, destination, () => {
        void this.publishToDestination(destination, payload, view.file!);
      }).open();
    } else {
      void this.publishToDestination(destination, payload, view.file);
    }
  }

  /** Route a publish to the correct platform handler. */
  private async publishToDestination(
    destination: Destination,
    payload: Record<string, unknown>,
    file: TFile,
  ) {
    switch (destination.type) {
      case "devto":
        return this.publishToDevTo(destination, payload, file);
      case "mastodon":
        return this.publishToMastodon(destination, payload, file);
      case "bluesky":
        return this.publishToBluesky(destination, payload, file);
      case "medium":
      case "reddit":
      case "threads":
      case "linkedin":
      case "ecency":
        new Notice(`${destination.name}: ${destination.type} support is coming in a future update`);
        return;
      default:
        return this.publishToCustomApi(destination, payload, file);
    }
  }

  /** Publish to a custom /api/publish endpoint. */
  private async publishToCustomApi(
    destination: Destination,
    payload: Record<string, unknown>,
    file: TFile,
  ) {
    const title = payload.title as string;
    const status = payload.status as string;
    try {
      new Notice(`POSSEing "${title}" → ${destination.name}...`);
      const url = `${destination.url.replace(/\/$/, "")}/api/publish`;
      const response = await requestUrl({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publish-key": destination.apiKey,
        },
        body: JSON.stringify(payload),
      });
      if (response.status >= 200 && response.status < 300) {
        let verb = "POSSEd";
        try { if (response.json?.upserted) verb = "Updated"; } catch { /* non-JSON */ }
        new Notice(`${verb} "${title}" on ${destination.name} as ${status}`);
        this.showStatusBarSuccess(destination.name);
        let syndicationUrl: string;
        try {
          syndicationUrl = response.json?.url ||
            `${destination.url.replace(/\/$/, "")}/${payload.slug as string}`;
        } catch {
          syndicationUrl = `${destination.url.replace(/\/$/, "")}/${payload.slug as string}`;
        }
        await this.writeSyndication(file, destination.name, syndicationUrl);
      } else {
        let errorDetail: string;
        try { errorDetail = response.json?.error || String(response.status); }
        catch { errorDetail = String(response.status); }
        new Notice(`POSSE to ${destination.name} failed: ${errorDetail}`);
      }
    } catch (err) {
      new Notice(`POSSE error (${destination.name}): ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  /** Publish to Dev.to via their articles API. */
  private async publishToDevTo(
    destination: Destination,
    payload: Record<string, unknown>,
    file: TFile,
  ) {
    const title = payload.title as string;
    try {
      new Notice(`POSSEing "${title}" → Dev.to (${destination.name})...`);
      const tags = ((payload.tags as string[]) || [])
        .slice(0, 4)
        .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const article: Record<string, unknown> = {
        title,
        body_markdown: payload.body as string,
        published: payload.status === "published",
        tags,
        description: (payload.excerpt as string) || "",
      };
      if (payload.canonicalUrl) article.canonical_url = payload.canonicalUrl;
      if (payload.coverImage) article.main_image = payload.coverImage;
      const response = await requestUrl({
        url: "https://dev.to/api/articles",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": destination.apiKey,
        },
        body: JSON.stringify({ article }),
      });
      if (response.status >= 200 && response.status < 300) {
        const articleUrl: string = response.json?.url || "https://dev.to";
        new Notice(`POSSEd "${title}" to Dev.to`);
        this.showStatusBarSuccess("Dev.to");
        await this.writeSyndication(file, destination.name, articleUrl);
      } else {
        let errorDetail: string;
        try { errorDetail = response.json?.error || String(response.status); }
        catch { errorDetail = String(response.status); }
        new Notice(`Dev.to POSSE failed: ${errorDetail}`);
      }
    } catch (err) {
      new Notice(`Dev.to error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  /** Publish to Mastodon by posting a status with the canonical link. */
  private async publishToMastodon(
    destination: Destination,
    payload: Record<string, unknown>,
    file: TFile,
  ) {
    const title = payload.title as string;
    try {
      new Notice(`POSSEing "${title}" → Mastodon (${destination.name})...`);
      const excerpt = (payload.excerpt as string) || "";
      const canonicalUrl = (payload.canonicalUrl as string) || "";
      const statusText = [title, excerpt, canonicalUrl].filter(Boolean).join("\n\n");
      const instanceUrl = (destination.instanceUrl || "").replace(/\/$/, "");
      const response = await requestUrl({
        url: `${instanceUrl}/api/v1/statuses`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${destination.accessToken}`,
        },
        body: JSON.stringify({ status: statusText, visibility: "public" }),
      });
      if (response.status >= 200 && response.status < 300) {
        const statusUrl: string = response.json?.url || instanceUrl;
        new Notice(`POSSEd "${title}" to Mastodon`);
        this.showStatusBarSuccess("Mastodon");
        await this.writeSyndication(file, destination.name, statusUrl);
      } else {
        let errorDetail: string;
        try { errorDetail = response.json?.error || String(response.status); }
        catch { errorDetail = String(response.status); }
        new Notice(`Mastodon POSSE failed: ${errorDetail}`);
      }
    } catch (err) {
      new Notice(`Mastodon error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  /** Publish to Bluesky via AT Protocol. */
  private async publishToBluesky(
    destination: Destination,
    payload: Record<string, unknown>,
    file: TFile,
  ) {
    const title = payload.title as string;
    try {
      new Notice(`POSSEing "${title}" → Bluesky (${destination.name})...`);

      // Authenticate
      const authResponse = await requestUrl({
        url: "https://bsky.social/xrpc/com.atproto.server.createSession",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: destination.handle,
          password: destination.appPassword,
        }),
      });
      if (authResponse.status < 200 || authResponse.status >= 300) {
        new Notice(`Bluesky auth failed: ${authResponse.status}`);
        return;
      }
      const { did, accessJwt } = authResponse.json as { did: string; accessJwt: string };

      // Build post text (300 char limit)
      const canonicalUrl = (payload.canonicalUrl as string) || "";
      const excerpt = (payload.excerpt as string) || "";
      const baseText = [title, excerpt].filter(Boolean).join(" — ");
      const maxText = 300 - (canonicalUrl ? canonicalUrl.length + 1 : 0);
      const text = (baseText.length > maxText
        ? baseText.substring(0, maxText - 1) + "…"
        : baseText
      ) + (canonicalUrl ? ` ${canonicalUrl}` : "");

      const postRecord: Record<string, unknown> = {
        $type: "app.bsky.feed.post",
        text,
        createdAt: new Date().toISOString(),
        langs: ["en"],
      };
      if (canonicalUrl) {
        const urlStart = text.lastIndexOf(canonicalUrl);
        postRecord.facets = [{
          index: { byteStart: new TextEncoder().encode(text.substring(0, urlStart)).length,
                   byteEnd:   new TextEncoder().encode(text.substring(0, urlStart + canonicalUrl.length)).length },
          features: [{ $type: "app.bsky.richtext.facet#link", uri: canonicalUrl }],
        }];
      }

      const createResponse = await requestUrl({
        url: "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessJwt}`,
        },
        body: JSON.stringify({
          repo: did,
          collection: "app.bsky.feed.post",
          record: postRecord,
        }),
      });
      if (createResponse.status >= 200 && createResponse.status < 300) {
        const uri: string = createResponse.json?.uri || "";
        const postUrl = uri
          ? `https://bsky.app/profile/${destination.handle}/post/${uri.split("/").pop()}`
          : "https://bsky.app";
        new Notice(`POSSEd "${title}" to Bluesky`);
        this.showStatusBarSuccess("Bluesky");
        await this.writeSyndication(file, destination.name, postUrl);
      } else {
        let errorDetail: string;
        try { errorDetail = String(createResponse.json?.message || createResponse.status); }
        catch { errorDetail = String(createResponse.status); }
        new Notice(`Bluesky POSSE failed: ${errorDetail}`);
      }
    } catch (err) {
      new Notice(`Bluesky error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  /** POSSE to all configured destinations at once. */
  private async posseToAll(overrideStatus?: "draft" | "published") {
    const { destinations } = this.settings;
    if (destinations.length === 0) {
      new Notice("Add at least one destination in settings");
      return;
    }
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice("Open a Markdown file first");
      return;
    }
    const payload = await this.buildPayload(view.file, overrideStatus);
    new Notice(`POSSEing "${String(payload.title)}" to ${destinations.length} destination(s)...`);
    for (const dest of destinations) {
      if (this.hasValidCredentials(dest)) {
        await this.publishToDestination(dest, payload, view.file);
      } else {
        new Notice(`Skipping "${dest.name}" — credentials not configured`);
      }
    }
  }

  /** Check whether a destination has the required credentials configured. */
  hasValidCredentials(dest: Destination): boolean {
    switch (dest.type) {
      case "devto":    return !!dest.apiKey;
      case "mastodon": return !!(dest.instanceUrl && dest.accessToken);
      case "bluesky":  return !!(dest.handle && dest.appPassword);
      case "medium":   return !!dest.mediumToken;
      case "reddit":   return !!(dest.redditClientId && dest.redditClientSecret && dest.redditRefreshToken);
      case "threads":  return !!(dest.threadsUserId && dest.threadsAccessToken);
      case "linkedin": return !!(dest.linkedinAccessToken && dest.linkedinPersonUrn);
      case "ecency":   return !!(dest.hiveUsername && dest.hivePostingKey);
      default:         return !!(dest.url && dest.apiKey);
    }
  }

  /** Write a syndication entry back into the note's frontmatter. Updates the URL if the destination already exists. */
  private async writeSyndication(file: TFile, name: string, url: string) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!Array.isArray(fm.syndication)) fm.syndication = [];
      const entries = fm.syndication as Array<{ name?: string; url?: string }>;
      const existing = entries.find((s) => s.name === name);
      if (existing) {
        existing.url = url;
      } else {
        entries.push({ url, name });
      }
    });
  }

  private showStatusBarSuccess(siteName: string) {
    if (!this.statusBarEl) return;
    this.statusBarEl.setText(`POSSEd ✓ ${siteName}`);
    window.setTimeout(() => {
      if (this.statusBarEl) this.statusBarEl.setText("");
    }, 5000);
  }

  /** Show current syndication status for the active note. */
  private posseStatus() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice("Open a Markdown file first");
      return;
    }
    const fileCache = this.app.metadataCache.getFileCache(view.file);
    const syndication = fileCache?.frontmatter?.syndication;
    const title = fileCache?.frontmatter?.title || view.file.basename;
    new PosseStatusModal(this.app, title, syndication).open();
  }
}

/* ─── Confirmation Modal ──────────────────────────────────────────── */

class ConfirmPublishModal extends Modal {
  private payload: Record<string, unknown>;
  private destination: Destination;
  private onConfirm: () => void;

  constructor(
    app: App,
    payload: Record<string, unknown>,
    destination: Destination,
    onConfirm: () => void,
  ) {
    super(app);
    this.payload = payload;
    this.destination = destination;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("posse-publisher-confirm-modal");

    contentEl.createEl("h3", { text: "Confirm posse" });
    contentEl.createEl("p", {
      text: `You are about to POSSE to ${this.destination.name}:`,
    });

    const summary = contentEl.createDiv({ cls: "publish-summary" });
    summary.createEl("div", { text: `Title: ${String(this.payload.title)}` });
    summary.createEl("div", { text: `Slug: ${String(this.payload.slug)}` });
    summary.createEl("div", { text: `Status: ${String(this.payload.status)}` });
    summary.createEl("div", { text: `Type: ${String(this.payload.type)}` });

    const buttons = contentEl.createDiv({ cls: "modal-button-container" });

    const cancelBtn = buttons.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());

    const confirmBtn = buttons.createEl("button", {
      text: "POSSE",
      cls: "mod-cta",
    });
    confirmBtn.addEventListener("click", () => {
      this.close();
      this.onConfirm();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

/* ─── Site Picker Modal ───────────────────────────────────────────── */

class SitePickerModal extends SuggestModal<Destination> {
  private destinations: Destination[];
  private onChoose: (destination: Destination) => void;

  constructor(app: App, destinations: Destination[], onChoose: (destination: Destination) => void) {
    super(app);
    this.destinations = destinations;
    this.onChoose = onChoose;
    this.setPlaceholder("Choose a destination to posse to...");
  }

  getSuggestions(query: string): Destination[] {
    const lower = query.toLowerCase();
    return this.destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.url.toLowerCase().includes(lower),
    );
  }

  renderSuggestion(destination: Destination, el: HTMLElement) {
    el.createEl("div", { text: destination.name, cls: "suggestion-title" });
    el.createEl("small", { text: destination.url, cls: "suggestion-note" });
  }

  onChooseSuggestion(destination: Destination) {
    this.onChoose(destination);
  }
}

/* ─── Settings Tab ────────────────────────────────────────────────── */

class PossePublisherSettingTab extends PluginSettingTab {
  plugin: PossePublisherPlugin;

  constructor(app: App, plugin: PossePublisherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Your canonical site").setHeading();

    new Setting(containerEl)
      .setName("Canonical base URL")
      .setDesc("Your own site's root URL. Every published post will include a canonical URL pointing here — the original you own.")
      .addText((text) =>
        text
          .setPlaceholder("https://yoursite.com")
          .setValue(this.plugin.settings.canonicalBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.canonicalBaseUrl = value;
            if (value && !value.startsWith("https://") && !value.startsWith("http://localhost")) {
              new Notice("Warning: canonical base URL should start with HTTPS://");
            }
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl).setName("Destinations").setHeading();

    this.plugin.settings.destinations.forEach((destination, index) => {
      const destContainer = containerEl.createDiv({
        cls: "posse-publisher-site",
      });
      new Setting(destContainer).setName(destination.name || `Destination ${index + 1}`).setHeading();

      new Setting(destContainer)
        .setName("Destination name")
        .setDesc("A label for this destination (e.g. My blog)")
        .addText((text) =>
          text
            .setPlaceholder("My site")
            .setValue(destination.name)
            .onChange(async (value) => {
              this.plugin.settings.destinations[index].name = value;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(destContainer)
        .setName("Type")
        .setDesc("Platform to publish to")
        .addDropdown((dd) =>
          dd
            .addOption("custom-api", "Custom API")
            .addOption("devto", "Dev.to")
            .addOption("mastodon", "Mastodon")
            .addOption("bluesky", "Bluesky")
            .addOption("medium", "Medium")
            .addOption("reddit", "Reddit")
            .addOption("threads", "Threads")
            .addOption("linkedin", "LinkedIn")
            .addOption("ecency", "Hive")
            .setValue(destination.type || "custom-api")
            .onChange(async (value) => {
              this.plugin.settings.destinations[index].type = value as DestinationType;
              await this.plugin.saveSettings();
              this.display();
            }),
        );

      const destType = destination.type || "custom-api";

      if (destType === "custom-api") {
        new Setting(destContainer)
          .setName("Site URL")
          .setDesc("Your site's base URL (must start with HTTPS://)")
          .addText((text) =>
            text
              .setPlaceholder("https://example.com")
              .setValue(destination.url || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].url = value;
                if (value && !value.startsWith("https://") && !value.startsWith("http://localhost")) {
                  new Notice("Warning: destination URL should start with HTTPS://");
                }
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("API key")
          .setDesc("`PUBLISH_API_KEY` from your site's environment")
          .addText((text) => {
            text
              .setPlaceholder("Enter API key")
              .setValue(destination.apiKey || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].apiKey = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
      } else if (destType === "devto") {
        new Setting(destContainer)
          .setName("Dev.to API key")
          .setDesc("From https://dev.to/settings/extensions")
          .addText((text) => {
            text
              .setPlaceholder("Enter dev.to API key")
              .setValue(destination.apiKey || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].apiKey = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
      } else if (destType === "mastodon") {
        new Setting(destContainer)
          .setName("Instance URL")
          .setDesc("Your Mastodon instance (e.g. https://mastodon.social)")
          .addText((text) =>
            text
              .setPlaceholder("HTTPS://mastodon.social")
              .setValue(destination.instanceUrl || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].instanceUrl = value;
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("Access token")
          .setDesc("From your mastodon account: settings → development → new application")
          .addText((text) => {
            text
              .setPlaceholder("Enter access token")
              .setValue(destination.accessToken || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].accessToken = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
      } else if (destType === "bluesky") {
        new Setting(destContainer)
          .setName("Bluesky handle")
          .setDesc("Your handle (e.g. Yourname.bsky.social)")
          .addText((text) =>
            text
              .setPlaceholder("Yourname.bsky.social")
              .setValue(destination.handle || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].handle = value;
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("App password")
          .setDesc("From https://bsky.app/settings/app-passwords — NOT your login password")
          .addText((text) => {
            text
              .setPlaceholder("Xxxx-xxxx-xxxx-xxxx")
              .setValue(destination.appPassword || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].appPassword = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
      } else if (destType === "medium") {
        new Setting(destContainer)
          .setName("API notice")
          .setDesc("The medium API was archived in march 2023. It may still work but could be discontinued at any time.");
        new Setting(destContainer)
          .setName("Integration token")
          .setDesc("From medium.com → settings → security and apps → integration tokens")
          .addText((text) => {
            text
              .setPlaceholder("Enter medium integration token")
              .setValue(destination.mediumToken || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].mediumToken = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
      } else if (destType === "reddit") {
        new Setting(destContainer)
          .setName("Client ID")
          .setDesc("From reddit.com/prefs/apps — create a \"script\" type app")
          .addText((text) =>
            text
              .setPlaceholder("Client ID")
              .setValue(destination.redditClientId || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].redditClientId = value;
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("Client secret")
          .addText((text) => {
            text
              .setPlaceholder("Client secret")
              .setValue(destination.redditClientSecret || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].redditClientSecret = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
        new Setting(destContainer)
          .setName("Refresh token")
          .setDesc("Authorization refresh token for your Reddit account")
          .addText((text) => {
            text
              .setPlaceholder("Refresh token")
              .setValue(destination.redditRefreshToken || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].redditRefreshToken = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
        new Setting(destContainer)
          .setName("Reddit username")
          .addText((text) =>
            text
              .setPlaceholder("U/yourname")
              .setValue(destination.redditUsername || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].redditUsername = value;
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("Default subreddit")
          .setDesc("e.g. r/webdev — can be overridden per note with \"subreddit:\" frontmatter")
          .addText((text) =>
            text
              .setPlaceholder("R/subredditname")
              .setValue(destination.redditDefaultSubreddit || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].redditDefaultSubreddit = value;
                await this.plugin.saveSettings();
              }),
          );
      } else if (destType === "threads") {
        new Setting(destContainer)
          .setName("Threads user ID")
          .setDesc("Your numeric threads/instagram user ID")
          .addText((text) =>
            text
              .setPlaceholder("123456789")
              .setValue(destination.threadsUserId || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].threadsUserId = value;
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("Access token")
          .setDesc("Long-lived threads access token with threads_content_publish permission")
          .addText((text) => {
            text
              .setPlaceholder("Enter access token")
              .setValue(destination.threadsAccessToken || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].threadsAccessToken = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
      } else if (destType === "linkedin") {
        new Setting(destContainer)
          .setName("Access token")
          .setDesc("Authorization bearer token with w_member_social scope")
          .addText((text) => {
            text
              .setPlaceholder("Enter access token")
              .setValue(destination.linkedinAccessToken || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].linkedinAccessToken = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
        new Setting(destContainer)
          .setName("Person identifier")
          .setDesc("Your LinkedIn member identifier")
          .addText((text) =>
            text
              .setPlaceholder("Urn:li:person:...")
              .setValue(destination.linkedinPersonUrn || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].linkedinPersonUrn = value;
                await this.plugin.saveSettings();
              }),
          );
      } else if (destType === "ecency") {
        new Setting(destContainer)
          .setName("Hive username")
          .setDesc("Your hive/ecency account name (without @)")
          .addText((text) =>
            text
              .setPlaceholder("Yourusername")
              .setValue(destination.hiveUsername || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].hiveUsername = value;
                await this.plugin.saveSettings();
              }),
          );
        new Setting(destContainer)
          .setName("Posting key")
          .setDesc("Your hive private posting key (not the owner or active key)")
          .addText((text) => {
            text
              .setPlaceholder("5k...")
              .setValue(destination.hivePostingKey || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].hivePostingKey = value;
                await this.plugin.saveSettings();
              });
            text.inputEl.type = "password";
            text.inputEl.autocomplete = "off";
          });
        new Setting(destContainer)
          .setName("Community")
          .setDesc("Hive community tag to post in (e.g. Hive-174301 for ocd)")
          .addText((text) =>
            text
              .setPlaceholder("Hive-174301")
              .setValue(destination.hiveCommunity || "")
              .onChange(async (value) => {
                this.plugin.settings.destinations[index].hiveCommunity = value;
                await this.plugin.saveSettings();
              }),
          );
      }

      new Setting(destContainer)
        .addButton((btn) =>
          btn.setButtonText("Test connection").onClick(() => {
            if (!this.plugin.hasValidCredentials(destination)) {
              new Notice("Configure credentials first");
              return;
            }
            if (destType === "custom-api") {
              const url = `${destination.url.replace(/\/$/, "")}/api/publish`;
              requestUrl({
                url,
                method: "OPTIONS",
                headers: { "x-publish-key": destination.apiKey },
              }).then((response) => {
                if (response.status >= 200 && response.status < 400) {
                  new Notice(`Connection to ${destination.name || destination.url} successful`);
                } else {
                  new Notice(`${destination.name || destination.url} responded with ${response.status}`);
                }
              }).catch(() => {
                new Notice(`Could not reach ${destination.name || destination.url}`);
              });
            } else {
              new Notice(`Credentials look configured for ${destination.name}. Publish to test.`);
            }
          }),
        )
        .addButton((btn) =>
          btn
            .setButtonText("Remove destination")
            .setWarning()
            .onClick(() => {
              const confirmEl = destContainer.createDiv({
                cls: "setting-item",
              });
              confirmEl.createEl("span", {
                text: `Remove "${destination.name || "this destination"}"? `,
              });
              const yesBtn = confirmEl.createEl("button", {
                text: "Yes, remove",
                cls: "mod-warning",
              });
              const noBtn = confirmEl.createEl("button", { text: "Cancel" });
              yesBtn.addEventListener("click", () => {
                this.plugin.settings.destinations.splice(index, 1);
                void this.plugin.saveSettings().then(() => this.display());
              });
              noBtn.addEventListener("click", () => confirmEl.remove());
            }),
        );
    });

    new Setting(containerEl)
      .addButton((btn) =>
        btn
          .setButtonText("Add destination")
          .setCta()
          .onClick(() => {
            this.plugin.settings.destinations.push({
              name: "",
              type: "custom-api",
              url: "",
              apiKey: "",
            });
            void this.plugin.saveSettings().then(() => this.display());
          }),
      );

    new Setting(containerEl).setName("Defaults").setHeading();

    new Setting(containerEl)
      .setName("Default status")
      .setDesc("Default publish status when not specified in frontmatter")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("draft", "Draft")
          .addOption("published", "Published")
          .setValue(this.plugin.settings.defaultStatus)
          .onChange(async (value) => {
            this.plugin.settings.defaultStatus = value as
              | "draft"
              | "published";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Confirm before publishing")
      .setDesc("Show a confirmation modal with post details before publishing")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.confirmBeforePublish)
          .onChange(async (value) => {
            this.plugin.settings.confirmBeforePublish = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Strip wiki-links and embeds")
      .setDesc(
        "Convert wiki-links, remove embeds, comments, and dataview blocks before publishing",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.stripObsidianSyntax)
          .onChange(async (value) => {
            this.plugin.settings.stripObsidianSyntax = value;
            await this.plugin.saveSettings();
          }),
      );

    /* ── Support section ── */
    new Setting(containerEl).setName("Support").setHeading();
    containerEl.createEl("p", {
      text: "This plugin is free and open source. If it saves you time, consider supporting its development.",
      cls: "setting-item-description",
    });

    new Setting(containerEl)
      .setName("Buy me a coffee")
      .setDesc("One-time or recurring support")
      .addButton((btn) =>
        btn.setButtonText("Support").onClick(() => {
          window.open("https://buymeacoffee.com/theofficaldm", "_blank");
        }),
      );

    new Setting(containerEl)
      .setName("GitHub sponsors")
      .setDesc("Monthly sponsorship through GitHub")
      .addButton((btn) =>
        btn.setButtonText("Sponsor").onClick(() => {
          window.open("https://github.com/sponsors/TheOfficialDM", "_blank");
        }),
      );

    new Setting(containerEl)
      .setName("All funding options")
      .setDesc("devinmarshall.info/fund")
      .addButton((btn) =>
        btn.setButtonText("View").onClick(() => {
          window.open("https://devinmarshall.info/fund", "_blank");
        }),
      );
  }
}

/* ─── POSSE Status Modal ──────────────────────────────────────────── */

type SyndicationEntry = { url?: string; name?: string };

class PosseStatusModal extends Modal {
  private title: string;
  private syndication: unknown;

  constructor(app: App, title: string, syndication: unknown) {
    super(app);
    this.title = title;
    this.syndication = syndication;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("posse-publisher-confirm-modal");
    contentEl.createEl("h3", { text: "Posse status" });
    contentEl.createEl("p", { text: `Note: ${String(this.title)}` });

    const entries = Array.isArray(this.syndication)
      ? (this.syndication as SyndicationEntry[])
      : [];

    if (entries.length === 0) {
      contentEl.createEl("p", {
        text: "This note has not been syndicated to any destination yet.",
      });
    } else {
      contentEl.createEl("strong", { text: `Syndicated to ${entries.length} destination(s):` });
      const list = contentEl.createEl("ul");
      for (const entry of entries) {
        const li = list.createEl("li");
        if (entry.url) {
          const a = li.createEl("a", { text: entry.name || entry.url });
          a.href = entry.url;
          a.target = "_blank";
          a.rel = "noopener";
        } else {
          li.setText(entry.name || "Unknown");
        }
      }
    }

    const buttons = contentEl.createDiv({ cls: "modal-button-container" });
    const closeBtn = buttons.createEl("button", { text: "Close" });
    closeBtn.addEventListener("click", () => this.close());
  }

  onClose() {
    this.contentEl.empty();
  }
}
