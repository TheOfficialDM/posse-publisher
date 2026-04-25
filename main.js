"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PossePublisherPlugin,
  markdownToHtml: () => markdownToHtml,
  markdownToPlainText: () => markdownToPlainText,
  preprocessContent: () => preprocessContent,
  toSlug: () => toSlug
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  destinations: [],
  canonicalBaseUrl: "",
  defaultStatus: "draft",
  confirmBeforePublish: true,
  stripObsidianSyntax: true,
  autoPublishOnSave: false,
  autoPublishDestination: ""
};
function extractBody(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return match ? match[1].trim() : content;
}
function buildFrontmatter(cache) {
  if (!cache) return {};
  const fm = {};
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
    fm.tags = cache.tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof cache.tags === "string") {
    fm.tags = cache.tags.replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof cache.canonicalUrl === "string") fm.canonicalUrl = cache.canonicalUrl;
  return fm;
}
function toSlug(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function preprocessContent(body) {
  body = body.replace(/%%[\s\S]*?%%/g, "");
  body = body.replace(/!\[\[([^\]]+)\]\]/g, "");
  body = body.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  body = body.replace(/\[\[([^\]]+)\]\]/g, "$1");
  body = body.replace(/```dataview[\s\S]*?```/g, "");
  body = body.replace(/```dataviewjs[\s\S]*?```/g, "");
  body = body.replace(/\n{3,}/g, "\n\n");
  return body.trim();
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function markdownToHtml(markdown) {
  let html = markdown;
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) => `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(code.trim())}</code></pre>`
  );
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^[-*_]{3,}\s*$/gm, "<hr>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^[-*+] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  html = html.split(/\n\n+/).map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr)/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).filter(Boolean).join("\n");
  return html;
}
function markdownToPlainText(markdown) {
  let text = markdown;
  text = text.replace(/```\w*\n([\s\S]*?)```/g, "$1");
  text = text.replace(/^#{1,6} /gm, "");
  text = text.replace(/\*{1,3}|_{1,3}/g, "");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/^> /gm, "");
  text = text.replace(/^[-*+\d.] /gm, "");
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}
var FRONTMATTER_TEMPLATE = `---
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
var PossePublisherPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.statusBarEl = null;
    this.autoPublishTimer = null;
    this.autoPublishRegistered = false;
  }
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
      callback: () => this.pickSiteAndPublish()
    });
    this.addCommand({
      id: "posse-publish-draft",
      name: "Posse publish as draft",
      callback: () => this.pickSiteAndPublish("draft")
    });
    this.addCommand({
      id: "posse-publish-live",
      name: "Posse publish live",
      callback: () => this.pickSiteAndPublish("published")
    });
    this.addCommand({
      id: "posse-insert-template",
      name: "Posse insert frontmatter template",
      editorCallback: (editor) => {
        const content = editor.getValue();
        if (content.trimStart().startsWith("---")) {
          new import_obsidian.Notice("Frontmatter already exists in this note");
          return;
        }
        editor.setCursor(0, 0);
        editor.replaceRange(FRONTMATTER_TEMPLATE, { line: 0, ch: 0 });
        editor.setCursor(1, 7);
      }
    });
    this.addCommand({
      id: "posse-to-all",
      name: "Posse to all destinations",
      callback: () => this.posseToAll()
    });
    this.addCommand({
      id: "posse-status",
      name: "Posse status \u2014 view syndication",
      callback: () => this.posseStatus()
    });
    this.addSettingTab(new PossePublisherSettingTab(this.app, this));
    this.registerAutoPublish();
  }
  onunload() {
    this.statusBarEl = null;
    if (this.autoPublishTimer) {
      clearTimeout(this.autoPublishTimer);
      this.autoPublishTimer = null;
    }
  }
  /**
   * Register (or skip) the vault 'modify' event listener for auto-publish.
   * Only publishes files that have `status: published` in frontmatter to
   * avoid accidentally pushing drafts. Debounces saves by 3 seconds so
   * rapid keystrokes don't trigger multiple API calls.
   */
  registerAutoPublish() {
    if (this.autoPublishRegistered) return;
    this.autoPublishRegistered = true;
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (!this.settings.autoPublishOnSave) return;
        if (!(file instanceof import_obsidian.TFile) || file.extension !== "md") return;
        const cache = this.app.metadataCache.getFileCache(file);
        const fm = cache?.frontmatter;
        if (!fm || fm.status !== "published") return;
        if (this.autoPublishTimer) clearTimeout(this.autoPublishTimer);
        this.autoPublishTimer = setTimeout(() => {
          this.autoPublishTimer = null;
          void this.autoPublishFile(file);
        }, 3e3);
      })
    );
  }
  /** Auto-publish a file to the configured destination (no confirmation modal). */
  async autoPublishFile(file) {
    const dest = this.resolveAutoPublishDestination();
    if (!dest) return;
    if (!this.hasValidCredentials(dest)) return;
    const payload = await this.buildPayload(file);
    if (!payload.title || payload.title === "Untitled") return;
    await this.publishToDestination(dest, payload, file);
  }
  /** Resolve which destination to use for auto-publish. */
  resolveAutoPublishDestination() {
    const { destinations, autoPublishDestination } = this.settings;
    if (destinations.length === 0) return null;
    if (autoPublishDestination) {
      const match = destinations.find((d) => d.name === autoPublishDestination);
      if (match) return match;
    }
    return destinations.find((d) => d.type === "custom-api") || null;
  }
  /** Migrate from single-site settings (v1) to multi-site (v2) */
  migrateSettings() {
    const raw = this.settings;
    if (typeof raw.siteUrl === "string" && raw.siteUrl) {
      this.settings.destinations = [
        {
          name: "Default",
          type: "custom-api",
          url: raw.siteUrl,
          apiKey: raw.apiKey || ""
        }
      ];
      delete raw.siteUrl;
      delete raw.apiKey;
      void this.saveSettings();
    }
    if (Array.isArray(raw.sites) && !Array.isArray(this.settings.destinations)) {
      this.settings.destinations = raw.sites;
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
  pickSiteAndPublish(overrideStatus) {
    const { destinations } = this.settings;
    if (destinations.length === 0) {
      new import_obsidian.Notice("Add at least one destination in settings");
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
  async buildPayload(file, overrideStatus) {
    const content = await this.app.vault.cachedRead(file);
    const fileCache = this.app.metadataCache.getFileCache(file);
    const frontmatter = buildFrontmatter(fileCache?.frontmatter);
    const body = extractBody(content);
    const processedBody = this.settings.stripObsidianSyntax ? preprocessContent(body) : body;
    const title = frontmatter.title || file.basename || "Untitled";
    const slug = toSlug(frontmatter.slug || title);
    const rawStatus = overrideStatus || frontmatter.status || this.settings.defaultStatus;
    const status = rawStatus === "publish" ? "published" : rawStatus === "archive" ? "archived" : ["draft", "published", "archived"].includes(rawStatus) ? rawStatus : this.settings.defaultStatus;
    const postType = frontmatter.type || "blog";
    const canonicalUrl = frontmatter.canonicalUrl || (this.settings.canonicalBaseUrl ? `${this.settings.canonicalBaseUrl.replace(/\/$/, "")}/${postType}/${slug}` : "");
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
      ...canonicalUrl && { canonicalUrl }
    };
  }
  async preparePublish(destination, overrideStatus) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || !view.file) {
      new import_obsidian.Notice("Open a Markdown file first");
      return;
    }
    if (!this.hasValidCredentials(destination)) {
      new import_obsidian.Notice(`Configure credentials for "${destination.name}" in settings`);
      return;
    }
    const payload = await this.buildPayload(view.file, overrideStatus);
    if (this.settings.confirmBeforePublish) {
      new ConfirmPublishModal(this.app, payload, destination, () => {
        void this.publishToDestination(destination, payload, view.file);
      }).open();
    } else {
      void this.publishToDestination(destination, payload, view.file);
    }
  }
  /** Route a publish to the correct platform handler. */
  async publishToDestination(destination, payload, file) {
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
        new import_obsidian.Notice(`${destination.name}: ${destination.type} support is coming in a future update`);
        return;
      default:
        return this.publishToCustomApi(destination, payload, file);
    }
  }
  /** Publish to a custom /api/publish endpoint. */
  async publishToCustomApi(destination, payload, file) {
    const title = payload.title;
    const status = payload.status;
    try {
      new import_obsidian.Notice(`POSSEing "${title}" \u2192 ${destination.name}...`);
      const url = `${destination.url.replace(/\/$/, "")}/api/publish`;
      const response = await (0, import_obsidian.requestUrl)({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publish-key": destination.apiKey
        },
        body: JSON.stringify(payload),
        throw: false
      });
      if (response.status >= 200 && response.status < 300) {
        let verb = "POSSEd";
        try {
          const json = response.json;
          if (json?.upserted) verb = "Updated";
        } catch {
        }
        new import_obsidian.Notice(`${verb} "${title}" on ${destination.name} as ${status}`);
        this.showStatusBarSuccess(destination.name);
        let syndicationUrl;
        try {
          const json = response.json;
          syndicationUrl = json?.url || `${destination.url.replace(/\/$/, "")}/${payload.slug}`;
        } catch {
          syndicationUrl = `${destination.url.replace(/\/$/, "")}/${payload.slug}`;
        }
        await this.writeSyndication(file, destination.name, syndicationUrl);
      } else {
        let errorDetail;
        try {
          const json = response.json;
          errorDetail = json?.error || String(response.status);
        } catch {
          errorDetail = String(response.status);
        }
        new import_obsidian.Notice(`POSSE to ${destination.name} failed: ${errorDetail}`);
      }
    } catch (err) {
      new import_obsidian.Notice(`POSSE error (${destination.name}): ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /** Publish to Dev.to via their articles API. */
  async publishToDevTo(destination, payload, file) {
    const title = payload.title;
    try {
      new import_obsidian.Notice(`POSSEing "${title}" \u2192 Dev.to (${destination.name})...`);
      const tags = (payload.tags || []).slice(0, 4).map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const article = {
        title,
        body_markdown: payload.body,
        published: payload.status === "published",
        tags,
        description: payload.excerpt || ""
      };
      if (payload.canonicalUrl) article.canonical_url = payload.canonicalUrl;
      if (payload.coverImage) article.main_image = payload.coverImage;
      const response = await (0, import_obsidian.requestUrl)({
        url: "https://dev.to/api/articles",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": destination.apiKey
        },
        body: JSON.stringify({ article }),
        throw: false
      });
      if (response.status >= 200 && response.status < 300) {
        const json = response.json;
        const articleUrl = json?.url || "https://dev.to";
        new import_obsidian.Notice(`POSSEd "${title}" to Dev.to`);
        this.showStatusBarSuccess("Dev.to");
        await this.writeSyndication(file, destination.name, articleUrl);
      } else {
        let errorDetail;
        try {
          const json = response.json;
          errorDetail = json?.error || String(response.status);
        } catch {
          errorDetail = String(response.status);
        }
        new import_obsidian.Notice(`Dev.to POSSE failed: ${errorDetail}`);
      }
    } catch (err) {
      new import_obsidian.Notice(`Dev.to error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /** Publish to Mastodon by posting a status with the canonical link. */
  async publishToMastodon(destination, payload, file) {
    const title = payload.title;
    try {
      new import_obsidian.Notice(`POSSEing "${title}" \u2192 Mastodon (${destination.name})...`);
      const excerpt = payload.excerpt || "";
      const canonicalUrl = payload.canonicalUrl || "";
      const statusText = [title, excerpt, canonicalUrl].filter(Boolean).join("\n\n");
      const instanceUrl = (destination.instanceUrl || "").replace(/\/$/, "");
      const response = await (0, import_obsidian.requestUrl)({
        url: `${instanceUrl}/api/v1/statuses`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${destination.accessToken}`
        },
        body: JSON.stringify({ status: statusText, visibility: "public" }),
        throw: false
      });
      if (response.status >= 200 && response.status < 300) {
        const json = response.json;
        const statusUrl = json?.url || instanceUrl;
        new import_obsidian.Notice(`POSSEd "${title}" to Mastodon`);
        this.showStatusBarSuccess("Mastodon");
        await this.writeSyndication(file, destination.name, statusUrl);
      } else {
        let errorDetail;
        try {
          const json = response.json;
          errorDetail = json?.error || String(response.status);
        } catch {
          errorDetail = String(response.status);
        }
        new import_obsidian.Notice(`Mastodon POSSE failed: ${errorDetail}`);
      }
    } catch (err) {
      new import_obsidian.Notice(`Mastodon error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /** Publish to Bluesky via AT Protocol. */
  async publishToBluesky(destination, payload, file) {
    const title = payload.title;
    try {
      new import_obsidian.Notice(`POSSEing "${title}" \u2192 Bluesky (${destination.name})...`);
      const authResponse = await (0, import_obsidian.requestUrl)({
        url: "https://bsky.social/xrpc/com.atproto.server.createSession",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: destination.handle,
          password: destination.appPassword
        }),
        throw: false
      });
      if (authResponse.status < 200 || authResponse.status >= 300) {
        new import_obsidian.Notice(`Bluesky auth failed: ${authResponse.status}`);
        return;
      }
      const { did, accessJwt } = authResponse.json;
      const canonicalUrl = payload.canonicalUrl || "";
      const excerpt = payload.excerpt || "";
      const baseText = [title, excerpt].filter(Boolean).join(" \u2014 ");
      const maxText = 300 - (canonicalUrl ? canonicalUrl.length + 1 : 0);
      const text = (baseText.length > maxText ? baseText.substring(0, maxText - 1) + "\u2026" : baseText) + (canonicalUrl ? ` ${canonicalUrl}` : "");
      const postRecord = {
        $type: "app.bsky.feed.post",
        text,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        langs: ["en"]
      };
      if (canonicalUrl) {
        const urlStart = text.lastIndexOf(canonicalUrl);
        postRecord.facets = [{
          index: {
            byteStart: new TextEncoder().encode(text.substring(0, urlStart)).length,
            byteEnd: new TextEncoder().encode(text.substring(0, urlStart + canonicalUrl.length)).length
          },
          features: [{ $type: "app.bsky.richtext.facet#link", uri: canonicalUrl }]
        }];
      }
      const createResponse = await (0, import_obsidian.requestUrl)({
        url: "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessJwt}`
        },
        body: JSON.stringify({
          repo: did,
          collection: "app.bsky.feed.post",
          record: postRecord
        }),
        throw: false
      });
      if (createResponse.status >= 200 && createResponse.status < 300) {
        const createJson = createResponse.json;
        const uri = createJson?.uri || "";
        const postUrl = uri ? `https://bsky.app/profile/${destination.handle}/post/${uri.split("/").pop()}` : "https://bsky.app";
        new import_obsidian.Notice(`POSSEd "${title}" to Bluesky`);
        this.showStatusBarSuccess("Bluesky");
        await this.writeSyndication(file, destination.name, postUrl);
      } else {
        let errorDetail;
        try {
          const createJson = createResponse.json;
          errorDetail = String(createJson?.message || createResponse.status);
        } catch {
          errorDetail = String(createResponse.status);
        }
        new import_obsidian.Notice(`Bluesky POSSE failed: ${errorDetail}`);
      }
    } catch (err) {
      new import_obsidian.Notice(`Bluesky error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
  /** POSSE to all configured destinations at once. */
  async posseToAll(overrideStatus) {
    const { destinations } = this.settings;
    if (destinations.length === 0) {
      new import_obsidian.Notice("Add at least one destination in settings");
      return;
    }
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || !view.file) {
      new import_obsidian.Notice("Open a Markdown file first");
      return;
    }
    const payload = await this.buildPayload(view.file, overrideStatus);
    new import_obsidian.Notice(`POSSEing "${String(payload.title)}" to ${destinations.length} destination(s)...`);
    for (const dest of destinations) {
      if (this.hasValidCredentials(dest)) {
        await this.publishToDestination(dest, payload, view.file);
      } else {
        new import_obsidian.Notice(`Skipping "${dest.name}" \u2014 credentials not configured`);
      }
    }
  }
  /** Check whether a destination has the required credentials configured. */
  hasValidCredentials(dest) {
    switch (dest.type) {
      case "devto":
        return !!dest.apiKey;
      case "mastodon":
        return !!(dest.instanceUrl && dest.accessToken);
      case "bluesky":
        return !!(dest.handle && dest.appPassword);
      case "medium":
        return !!dest.mediumToken;
      case "reddit":
        return !!(dest.redditClientId && dest.redditClientSecret && dest.redditRefreshToken);
      case "threads":
        return !!(dest.threadsUserId && dest.threadsAccessToken);
      case "linkedin":
        return !!(dest.linkedinAccessToken && dest.linkedinPersonUrn);
      case "ecency":
        return !!(dest.hiveUsername && dest.hivePostingKey);
      default:
        return !!(dest.url && dest.apiKey);
    }
  }
  /** Write a syndication entry back into the note's frontmatter. Updates the URL if the destination already exists. */
  async writeSyndication(file, name, url) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!Array.isArray(fm.syndication)) fm.syndication = [];
      const entries = fm.syndication;
      const existing = entries.find((s) => s.name === name);
      if (existing) {
        existing.url = url;
      } else {
        entries.push({ url, name });
      }
    });
  }
  showStatusBarSuccess(siteName) {
    if (!this.statusBarEl) return;
    this.statusBarEl.setText(`POSSEd \u2713 ${siteName}`);
    window.setTimeout(() => {
      if (this.statusBarEl) this.statusBarEl.setText("");
    }, 5e3);
  }
  /** Show current syndication status for the active note. */
  posseStatus() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || !view.file) {
      new import_obsidian.Notice("Open a Markdown file first");
      return;
    }
    const fileCache = this.app.metadataCache.getFileCache(view.file);
    const fm = fileCache?.frontmatter;
    const syndication = fm?.syndication;
    const title = fm?.title || view.file.basename;
    new PosseStatusModal(this.app, title, syndication).open();
  }
};
var ConfirmPublishModal = class extends import_obsidian.Modal {
  constructor(app, payload, destination, onConfirm) {
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
      text: `You are about to POSSE to ${this.destination.name}:`
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
      cls: "mod-cta"
    });
    confirmBtn.addEventListener("click", () => {
      this.close();
      this.onConfirm();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SitePickerModal = class extends import_obsidian.SuggestModal {
  constructor(app, destinations, onChoose) {
    super(app);
    this.destinations = destinations;
    this.onChoose = onChoose;
    this.setPlaceholder("Choose a destination to posse to...");
  }
  getSuggestions(query) {
    const lower = query.toLowerCase();
    return this.destinations.filter(
      (d) => d.name.toLowerCase().includes(lower) || d.url.toLowerCase().includes(lower)
    );
  }
  renderSuggestion(destination, el) {
    el.createEl("div", { text: destination.name, cls: "suggestion-title" });
    el.createEl("small", { text: destination.url, cls: "suggestion-note" });
  }
  onChooseSuggestion(destination) {
    this.onChoose(destination);
  }
};
var PossePublisherSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Your canonical site").setHeading();
    new import_obsidian.Setting(containerEl).setName("Canonical base URL").setDesc("Your own site's root URL. Every published post will include a canonical URL pointing here \u2014 the original you own.").addText(
      (text) => text.setPlaceholder("https://yoursite.com").setValue(this.plugin.settings.canonicalBaseUrl).onChange(async (value) => {
        this.plugin.settings.canonicalBaseUrl = value;
        if (value && !value.startsWith("https://") && !value.startsWith("http://localhost")) {
          new import_obsidian.Notice("Warning: canonical base URL should start with HTTPS://");
        }
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Destinations").setHeading();
    this.plugin.settings.destinations.forEach((destination, index) => {
      const destContainer = containerEl.createDiv({
        cls: "posse-publisher-site"
      });
      new import_obsidian.Setting(destContainer).setName(destination.name || `Destination ${index + 1}`).setHeading();
      new import_obsidian.Setting(destContainer).setName("Destination name").setDesc("A label for this destination (e.g. My blog)").addText(
        (text) => text.setPlaceholder("My site").setValue(destination.name).onChange(async (value) => {
          this.plugin.settings.destinations[index].name = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(destContainer).setName("Type").setDesc("Platform to publish to").addDropdown(
        (dd) => dd.addOption("custom-api", "Custom API").addOption("devto", "Dev.to").addOption("mastodon", "Mastodon").addOption("bluesky", "Bluesky").addOption("medium", "Medium").addOption("reddit", "Reddit").addOption("threads", "Threads").addOption("linkedin", "LinkedIn").addOption("ecency", "Ecency").setValue(destination.type || "custom-api").onChange(async (value) => {
          this.plugin.settings.destinations[index].type = value;
          await this.plugin.saveSettings();
          this.display();
        })
      );
      const destType = destination.type || "custom-api";
      if (destType === "custom-api") {
        new import_obsidian.Setting(destContainer).setName("Site URL").setDesc("Your site's base URL (must start with HTTPS://)").addText(
          (text) => text.setPlaceholder("https://example.com").setValue(destination.url || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].url = value;
            if (value && !value.startsWith("https://") && !value.startsWith("http://localhost")) {
              new import_obsidian.Notice("Warning: destination URL should start with HTTPS://");
            }
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("API key").setDesc("`PUBLISH_API_KEY` from your site's environment").addText((text) => {
          text.setPlaceholder("Enter API key").setValue(destination.apiKey || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].apiKey = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "devto") {
        new import_obsidian.Setting(destContainer).setName("Dev.to API key").setDesc("From https://dev.to/settings/extensions").addText((text) => {
          text.setPlaceholder("Enter dev.to API key").setValue(destination.apiKey || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].apiKey = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "mastodon") {
        new import_obsidian.Setting(destContainer).setName("Instance URL").setDesc("Your Mastodon instance (e.g. https://mastodon.social)").addText(
          (text) => text.setPlaceholder("HTTPS://mastodon.social").setValue(destination.instanceUrl || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].instanceUrl = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Access token").setDesc("From your mastodon account: settings \u2192 development \u2192 new application").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.accessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].accessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "bluesky") {
        new import_obsidian.Setting(destContainer).setName("Bluesky handle").setDesc("Your handle (e.g. Yourname.bsky.social)").addText(
          (text) => text.setPlaceholder("Yourname.bsky.social").setValue(destination.handle || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].handle = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("App password").setDesc("From https://bsky.app/settings/app-passwords \u2014 NOT your login password").addText((text) => {
          text.setPlaceholder("Xxxx-xxxx-xxxx-xxxx").setValue(destination.appPassword || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].appPassword = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "medium") {
        new import_obsidian.Setting(destContainer).setName("API notice").setDesc("The medium API was archived in march 2023. It may still work but could be discontinued at any time.");
        new import_obsidian.Setting(destContainer).setName("Integration token").setDesc("From medium.com \u2192 settings \u2192 security and apps \u2192 integration tokens").addText((text) => {
          text.setPlaceholder("Enter medium integration token").setValue(destination.mediumToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].mediumToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "reddit") {
        new import_obsidian.Setting(destContainer).setName("Client ID").setDesc('From reddit.com/prefs/apps \u2014 create a "script" type app').addText(
          (text) => text.setPlaceholder("Client ID").setValue(destination.redditClientId || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditClientId = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Client secret").addText((text) => {
          text.setPlaceholder("Client secret").setValue(destination.redditClientSecret || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditClientSecret = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Refresh token").setDesc("Authorization refresh token for your Reddit account").addText((text) => {
          text.setPlaceholder("Refresh token").setValue(destination.redditRefreshToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditRefreshToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Reddit username").addText(
          (text) => text.setPlaceholder("U/yourname").setValue(destination.redditUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Default subreddit").setDesc('e.g. r/webdev \u2014 can be overridden per note with "subreddit:" frontmatter').addText(
          (text) => text.setPlaceholder("R/subredditname").setValue(destination.redditDefaultSubreddit || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditDefaultSubreddit = value;
            await this.plugin.saveSettings();
          })
        );
      } else if (destType === "threads") {
        new import_obsidian.Setting(destContainer).setName("Threads user ID").setDesc("Your numeric threads/instagram user ID").addText(
          (text) => text.setPlaceholder("123456789").setValue(destination.threadsUserId || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].threadsUserId = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Access token").setDesc("Long-lived threads access token with threads_content_publish permission").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.threadsAccessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].threadsAccessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "linkedin") {
        new import_obsidian.Setting(destContainer).setName("Access token").setDesc("Authorization bearer token with w_member_social scope").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.linkedinAccessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].linkedinAccessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Person identifier").setDesc("Your LinkedIn member identifier").addText(
          (text) => text.setPlaceholder("Urn:li:person:...").setValue(destination.linkedinPersonUrn || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].linkedinPersonUrn = value;
            await this.plugin.saveSettings();
          })
        );
      } else if (destType === "ecency") {
        new import_obsidian.Setting(destContainer).setName("Username").setDesc("Your account name on https://ecency.com (without @)").addText(
          (text) => text.setPlaceholder("Your username").setValue(destination.hiveUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hiveUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Posting key").setDesc("Your private posting key from https://ecency.com (not the owner or active key)").addText((text) => {
          text.setPlaceholder("5k...").setValue(destination.hivePostingKey || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hivePostingKey = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Community").setDesc("Hive community tag to post in (e.g. Hive-174301 for ocd)").addText(
          (text) => text.setPlaceholder("Hive-174301").setValue(destination.hiveCommunity || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hiveCommunity = value;
            await this.plugin.saveSettings();
          })
        );
      }
      new import_obsidian.Setting(destContainer).addButton(
        (btn) => btn.setButtonText("Test connection").onClick(() => {
          if (!this.plugin.hasValidCredentials(destination)) {
            new import_obsidian.Notice("Configure credentials first");
            return;
          }
          if (destType === "custom-api") {
            const url = `${destination.url.replace(/\/$/, "")}/api/publish`;
            (0, import_obsidian.requestUrl)({
              url,
              method: "OPTIONS",
              headers: { "x-publish-key": destination.apiKey },
              throw: false
            }).then((response) => {
              if (response.status >= 200 && response.status < 400) {
                new import_obsidian.Notice(`Connection to ${destination.name || destination.url} successful`);
              } else {
                new import_obsidian.Notice(`${destination.name || destination.url} responded with ${response.status}`);
              }
            }).catch(() => {
              new import_obsidian.Notice(`Could not reach ${destination.name || destination.url}`);
            });
          } else {
            new import_obsidian.Notice(`Credentials look configured for ${destination.name}. Publish to test.`);
          }
        })
      ).addButton(
        (btn) => btn.setButtonText("Remove destination").setWarning().onClick(() => {
          const confirmEl = destContainer.createDiv({
            cls: "setting-item"
          });
          confirmEl.createEl("span", {
            text: `Remove "${destination.name || "this destination"}"? `
          });
          const yesBtn = confirmEl.createEl("button", {
            text: "Yes, remove",
            cls: "mod-warning"
          });
          const noBtn = confirmEl.createEl("button", { text: "Cancel" });
          yesBtn.addEventListener("click", () => {
            this.plugin.settings.destinations.splice(index, 1);
            void this.plugin.saveSettings().then(() => this.display());
          });
          noBtn.addEventListener("click", () => confirmEl.remove());
        })
      );
    });
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText("Add destination").setCta().onClick(() => {
        this.plugin.settings.destinations.push({
          name: "",
          type: "custom-api",
          url: "",
          apiKey: ""
        });
        void this.plugin.saveSettings().then(() => this.display());
      })
    );
    new import_obsidian.Setting(containerEl).setName("Defaults").setHeading();
    new import_obsidian.Setting(containerEl).setName("Default status").setDesc("Default publish status when not specified in frontmatter").addDropdown(
      (dropdown) => dropdown.addOption("draft", "Draft").addOption("published", "Published").setValue(this.plugin.settings.defaultStatus).onChange(async (value) => {
        this.plugin.settings.defaultStatus = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Confirm before publishing").setDesc("Show a confirmation modal with post details before publishing").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.confirmBeforePublish).onChange(async (value) => {
        this.plugin.settings.confirmBeforePublish = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Strip wiki-links and embeds").setDesc(
      "Convert wiki-links, remove embeds, comments, and dataview blocks before publishing"
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.stripObsidianSyntax).onChange(async (value) => {
        this.plugin.settings.stripObsidianSyntax = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Auto-publish").setHeading();
    new import_obsidian.Setting(containerEl).setName("Auto-publish on save").setDesc(
      "Automatically re-publish to your site when you save a note that has status: published in its frontmatter. Drafts are never auto-published. Changes are debounced (3s delay) to avoid rapid-fire requests."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoPublishOnSave).onChange(async (value) => {
        this.plugin.settings.autoPublishOnSave = value;
        await this.plugin.saveSettings();
      })
    );
    const customApiDests = this.plugin.settings.destinations.filter((d) => d.type === "custom-api");
    if (customApiDests.length > 1) {
      new import_obsidian.Setting(containerEl).setName("Auto-publish destination").setDesc("Which custom-api destination to auto-publish to. Leave empty to use the first one.").addDropdown((dd) => {
        dd.addOption("", "First custom-api destination");
        for (const d of customApiDests) {
          dd.addOption(d.name, d.name);
        }
        dd.setValue(this.plugin.settings.autoPublishDestination).onChange(async (value) => {
          this.plugin.settings.autoPublishDestination = value;
          await this.plugin.saveSettings();
        });
      });
    }
    new import_obsidian.Setting(containerEl).setName("Support").setHeading();
    containerEl.createEl("p", {
      text: "This plugin is free and open source. If it saves you time, consider supporting its development.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("Buy me a coffee").setDesc("One-time or recurring support").addButton(
      (btn) => btn.setButtonText("Support").onClick(() => {
        window.open("https://buymeacoffee.com/theofficaldm", "_blank");
      })
    );
    new import_obsidian.Setting(containerEl).setName("GitHub sponsors").setDesc("Monthly sponsorship through GitHub").addButton(
      (btn) => btn.setButtonText("Sponsor").onClick(() => {
        window.open("https://github.com/sponsors/TheOfficialDM", "_blank");
      })
    );
    new import_obsidian.Setting(containerEl).setName("All funding options").setDesc("devinmarshall.info/fund").addButton(
      (btn) => btn.setButtonText("View").onClick(() => {
        window.open("https://devinmarshall.info/fund", "_blank");
      })
    );
  }
};
var PosseStatusModal = class extends import_obsidian.Modal {
  constructor(app, title, syndication) {
    super(app);
    this.title = title;
    this.syndication = syndication;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("posse-publisher-confirm-modal");
    contentEl.createEl("h3", { text: "Posse status" });
    contentEl.createEl("p", { text: `Note: ${String(this.title)}` });
    const entries = Array.isArray(this.syndication) ? this.syndication : [];
    if (entries.length === 0) {
      contentEl.createEl("p", {
        text: "This note has not been syndicated to any destination yet."
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
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  markdownToHtml,
  markdownToPlainText,
  preprocessContent,
  toSlug
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiIHwgXCJtZWRpdW1cIiB8IFwicmVkZGl0XCIgfCBcInRocmVhZHNcIiB8IFwibGlua2VkaW5cIiB8IFwiZWNlbmN5XCI7XHJcblxyXG5pbnRlcmZhY2UgRGVzdGluYXRpb24ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB0eXBlOiBEZXN0aW5hdGlvblR5cGU7XHJcbiAgLy8gY3VzdG9tLWFwaVxyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG4gIC8vIG1hc3RvZG9uXHJcbiAgaW5zdGFuY2VVcmw/OiBzdHJpbmc7XHJcbiAgYWNjZXNzVG9rZW4/OiBzdHJpbmc7XHJcbiAgLy8gYmx1ZXNreVxyXG4gIGhhbmRsZT86IHN0cmluZztcclxuICBhcHBQYXNzd29yZD86IHN0cmluZztcclxuICAvLyBtZWRpdW1cclxuICBtZWRpdW1Ub2tlbj86IHN0cmluZztcclxuICBtZWRpdW1BdXRob3JJZD86IHN0cmluZztcclxuICAvLyByZWRkaXRcclxuICByZWRkaXRDbGllbnRJZD86IHN0cmluZztcclxuICByZWRkaXRDbGllbnRTZWNyZXQ/OiBzdHJpbmc7XHJcbiAgcmVkZGl0UmVmcmVzaFRva2VuPzogc3RyaW5nO1xyXG4gIHJlZGRpdFVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHJlZGRpdERlZmF1bHRTdWJyZWRkaXQ/OiBzdHJpbmc7XHJcbiAgLy8gdGhyZWFkc1xyXG4gIHRocmVhZHNVc2VySWQ/OiBzdHJpbmc7XHJcbiAgdGhyZWFkc0FjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGxpbmtlZGluXHJcbiAgbGlua2VkaW5BY2Nlc3NUb2tlbj86IHN0cmluZztcclxuICBsaW5rZWRpblBlcnNvblVybj86IHN0cmluZztcclxuICAvLyBlY2VuY3kgLyBoaXZlXHJcbiAgaGl2ZVVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIGhpdmVQb3N0aW5nS2V5Pzogc3RyaW5nO1xyXG4gIGhpdmVDb21tdW5pdHk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxuICBhdXRvUHVibGlzaE9uU2F2ZTogYm9vbGVhbjtcclxuICBhdXRvUHVibGlzaERlc3RpbmF0aW9uOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSB7XHJcbiAgZGVzdGluYXRpb25zOiBbXSxcclxuICBjYW5vbmljYWxCYXNlVXJsOiBcIlwiLFxyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIixcclxuICBjb25maXJtQmVmb3JlUHVibGlzaDogdHJ1ZSxcclxuICBzdHJpcE9ic2lkaWFuU3ludGF4OiB0cnVlLFxyXG4gIGF1dG9QdWJsaXNoT25TYXZlOiBmYWxzZSxcclxuICBhdXRvUHVibGlzaERlc3RpbmF0aW9uOiBcIlwiLFxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEZyb250bWF0dGVyIHtcclxuICB0aXRsZT86IHN0cmluZztcclxuICBzbHVnPzogc3RyaW5nO1xyXG4gIGV4Y2VycHQ/OiBzdHJpbmc7XHJcbiAgdHlwZT86IHN0cmluZztcclxuICBzdGF0dXM/OiBzdHJpbmc7XHJcbiAgdGFncz86IHN0cmluZ1tdO1xyXG4gIHBpbGxhcj86IHN0cmluZztcclxuICBjb3ZlckltYWdlPzogc3RyaW5nO1xyXG4gIGZlYXR1cmVkPzogYm9vbGVhbjtcclxuICBtZXRhVGl0bGU/OiBzdHJpbmc7XHJcbiAgbWV0YURlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIG9nSW1hZ2U/OiBzdHJpbmc7XHJcbiAgdmlkZW9Vcmw/OiBzdHJpbmc7XHJcbiAgY2Fub25pY2FsVXJsPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogRXh0cmFjdCBib2R5IGNvbnRlbnQgYmVsb3cgdGhlIFlBTUwgZnJvbnRtYXR0ZXIgZmVuY2UuICovXHJcbmZ1bmN0aW9uIGV4dHJhY3RCb2R5KGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9eLS0tXFxyP1xcbltcXHNcXFNdKj9cXHI/XFxuLS0tXFxyP1xcbj8oW1xcc1xcU10qKSQvKTtcclxuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50cmltKCkgOiBjb250ZW50O1xyXG59XHJcblxyXG4vKipcclxuICogQnVpbGQgYSBGcm9udG1hdHRlciBvYmplY3QgZnJvbSBPYnNpZGlhbidzIGNhY2hlZCBtZXRhZGF0YS5cclxuICogRmFsbHMgYmFjayBncmFjZWZ1bGx5IHdoZW4gZmllbGRzIGFyZSBhYnNlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZEZyb250bWF0dGVyKGNhY2hlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCk6IEZyb250bWF0dGVyIHtcclxuICBpZiAoIWNhY2hlKSByZXR1cm4ge307XHJcbiAgY29uc3QgZm06IEZyb250bWF0dGVyID0ge307XHJcblxyXG4gIGlmICh0eXBlb2YgY2FjaGUudGl0bGUgPT09IFwic3RyaW5nXCIpIGZtLnRpdGxlID0gY2FjaGUudGl0bGU7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5zbHVnID09PSBcInN0cmluZ1wiKSBmbS5zbHVnID0gY2FjaGUuc2x1ZztcclxuICBpZiAodHlwZW9mIGNhY2hlLmV4Y2VycHQgPT09IFwic3RyaW5nXCIpIGZtLmV4Y2VycHQgPSBjYWNoZS5leGNlcnB0O1xyXG4gIGlmICh0eXBlb2YgY2FjaGUudHlwZSA9PT0gXCJzdHJpbmdcIikgZm0udHlwZSA9IGNhY2hlLnR5cGU7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5zdGF0dXMgPT09IFwic3RyaW5nXCIpIGZtLnN0YXR1cyA9IGNhY2hlLnN0YXR1cztcclxuICBpZiAodHlwZW9mIGNhY2hlLnBpbGxhciA9PT0gXCJzdHJpbmdcIikgZm0ucGlsbGFyID0gY2FjaGUucGlsbGFyO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuY292ZXJJbWFnZSA9PT0gXCJzdHJpbmdcIikgZm0uY292ZXJJbWFnZSA9IGNhY2hlLmNvdmVySW1hZ2U7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5tZXRhVGl0bGUgPT09IFwic3RyaW5nXCIpIGZtLm1ldGFUaXRsZSA9IGNhY2hlLm1ldGFUaXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFEZXNjcmlwdGlvbiA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YURlc2NyaXB0aW9uID0gY2FjaGUubWV0YURlc2NyaXB0aW9uO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUub2dJbWFnZSA9PT0gXCJzdHJpbmdcIikgZm0ub2dJbWFnZSA9IGNhY2hlLm9nSW1hZ2U7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS52aWRlb1VybCA9PT0gXCJzdHJpbmdcIikgZm0udmlkZW9VcmwgPSBjYWNoZS52aWRlb1VybDtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5mZWF0dXJlZCA9PT0gXCJib29sZWFuXCIpIGZtLmZlYXR1cmVkID0gY2FjaGUuZmVhdHVyZWQ7XHJcbiAgZWxzZSBpZiAoY2FjaGUuZmVhdHVyZWQgPT09IFwidHJ1ZVwiKSBmbS5mZWF0dXJlZCA9IHRydWU7XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGNhY2hlLnRhZ3MpKSB7XHJcbiAgICBmbS50YWdzID0gY2FjaGUudGFncy5tYXAoKHQ6IHVua25vd24pID0+IFN0cmluZyh0KS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBjYWNoZS50YWdzID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICBmbS50YWdzID0gY2FjaGUudGFnc1xyXG4gICAgICAucmVwbGFjZSgvXlxcW3xcXF0kL2csIFwiXCIpXHJcbiAgICAgIC5zcGxpdChcIixcIilcclxuICAgICAgLm1hcCgodDogc3RyaW5nKSA9PiB0LnRyaW0oKSlcclxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgY2FjaGUuY2Fub25pY2FsVXJsID09PSBcInN0cmluZ1wiKSBmbS5jYW5vbmljYWxVcmwgPSBjYWNoZS5jYW5vbmljYWxVcmw7XHJcblxyXG4gIHJldHVybiBmbTtcclxufVxyXG5cclxuLyoqIENvbnZlcnQgYSB0aXRsZSBzdHJpbmcgdG8gYSBVUkwtc2FmZSBzbHVnLCBoYW5kbGluZyBkaWFjcml0aWNzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9TbHVnKHRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiB0aXRsZVxyXG4gICAgLm5vcm1hbGl6ZShcIk5GRFwiKVxyXG4gICAgLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpXHJcbiAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgXCItXCIpXHJcbiAgICAucmVwbGFjZSgvXi18LSQvZywgXCJcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQcmUtcHJvY2VzcyBPYnNpZGlhbi1zcGVjaWZpYyBtYXJrZG93biBiZWZvcmUgc2VuZGluZyB0byB0aGUgYmxvZyBBUEkuXHJcbiAqIFN0cmlwcyB3aWtpLWxpbmtzLCBlbWJlZHMsIGNvbW1lbnRzLCBhbmQgZGF0YXZpZXcgYmxvY2tzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHByZXByb2Nlc3NDb250ZW50KGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgLy8gUmVtb3ZlIE9ic2lkaWFuIGNvbW1lbnRzOiAlJS4uLiUlXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvJSVbXFxzXFxTXSo/JSUvZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rIGVtYmVkczogIVtbZmlsZV1dIFx1MjE5MiAocmVtb3ZlZClcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8hXFxbXFxbKFteXFxdXSspXFxdXFxdL2csIFwiXCIpO1xyXG5cclxuICAvLyBDb252ZXJ0IHdpa2ktbGlua3Mgd2l0aCBhbGlhczogW1t0YXJnZXR8YWxpYXNdXSBcdTIxOTIgYWxpYXNcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9cXFtcXFsoW15cXF18XSspXFx8KFteXFxdXSspXFxdXFxdL2csIFwiJDJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRob3V0IGFsaWFzOiBbW3RhcmdldF1dIFx1MjE5MiB0YXJnZXRcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9cXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCIkMVwiKTtcclxuXHJcbiAgLy8gUmVtb3ZlIGRhdGF2aWV3IGNvZGUgYmxvY2tzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdbXFxzXFxTXSo/YGBgL2csIFwiXCIpO1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL2BgYGRhdGF2aWV3anNbXFxzXFxTXSo/YGBgL2csIFwiXCIpO1xyXG5cclxuICAvLyBDbGVhbiB1cCBleGNlc3MgYmxhbmsgbGluZXMgbGVmdCBieSByZW1vdmFsc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XHJcblxyXG4gIHJldHVybiBib2R5LnRyaW0oKTtcclxufVxyXG5cclxuLyoqIEVzY2FwZSBIVE1MIHNwZWNpYWwgY2hhcmFjdGVycy4gKi9cclxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHN0clxyXG4gICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxyXG4gICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcclxuICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYmFzaWMgTWFya2Rvd24gdG8gSFRNTC4gSGFuZGxlcyBoZWFkaW5ncywgYm9sZCwgaXRhbGljLCBpbmxpbmUgY29kZSxcclxuICogbGlua3MsIGltYWdlcywgbGlzdHMsIGJsb2NrcXVvdGVzLCBob3Jpem9udGFsIHJ1bGVzLCBmZW5jZWQgY29kZSBibG9ja3MsIGFuZCBwYXJhZ3JhcGhzLlxyXG4gKiBObyBleHRlcm5hbCBkZXBlbmRlbmNpZXMgXHUyMDE0IHJlZ2V4IG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFya2Rvd25Ub0h0bWwobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgbGV0IGh0bWwgPSBtYXJrZG93bjtcclxuXHJcbiAgLy8gRmVuY2VkIGNvZGUgYmxvY2tzIChwcm9jZXNzIGZpcnN0IHRvIGF2b2lkIG1hbmdsaW5nIHRoZWlyIGNvbnRlbnRzKVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL2BgYChcXHcqKVxcbihbXFxzXFxTXSo/KWBgYC9nLCAoXzogc3RyaW5nLCBsYW5nOiBzdHJpbmcsIGNvZGU6IHN0cmluZykgPT5cclxuICAgIGA8cHJlPjxjb2RlJHtsYW5nID8gYCBjbGFzcz1cImxhbmd1YWdlLSR7bGFuZ31cImAgOiBcIlwifT4ke2VzY2FwZUh0bWwoY29kZS50cmltKCkpfTwvY29kZT48L3ByZT5gXHJcbiAgKTtcclxuXHJcbiAgLy8gSGVhZGluZ3NcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjIyMjICguKykkL2dtLCBcIjxoNj4kMTwvaDY+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjIyAoLispJC9nbSwgXCI8aDU+JDE8L2g1PlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjIyAoLispJC9nbSwgXCI8aDQ+JDE8L2g0PlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjICguKykkL2dtLCBcIjxoMz4kMTwvaDM+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyAoLispJC9nbSwgXCI8aDI+JDE8L2gyPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyAoLispJC9nbSwgXCI8aDE+JDE8L2gxPlwiKTtcclxuXHJcbiAgLy8gSG9yaXpvbnRhbCBydWxlc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15bLSpfXXszLH1cXHMqJC9nbSwgXCI8aHI+XCIpO1xyXG5cclxuICAvLyBCbG9ja3F1b3Rlc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14+ICguKykkL2dtLCBcIjxibG9ja3F1b3RlPiQxPC9ibG9ja3F1b3RlPlwiKTtcclxuXHJcbiAgLy8gQm9sZCArIGl0YWxpYyAob3JkZXI6IHRyaXBsZSBcdTIxOTIgZG91YmxlIFx1MjE5MiBzaW5nbGUpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFwqXFwqXFwqKC4rPylcXCpcXCpcXCovZywgXCI8c3Ryb25nPjxlbT4kMTwvZW0+PC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcKlxcKiguKz8pXFwqXFwqL2csIFwiPHN0cm9uZz4kMTwvc3Ryb25nPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXCooLis/KVxcKi9nLCBcIjxlbT4kMTwvZW0+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL19fXyguKz8pX19fL2csIFwiPHN0cm9uZz48ZW0+JDE8L2VtPjwvc3Ryb25nPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9fXyguKz8pX18vZywgXCI8c3Ryb25nPiQxPC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL18oLis/KV8vZywgXCI8ZW0+JDE8L2VtPlwiKTtcclxuXHJcbiAgLy8gSW5saW5lIGNvZGVcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9gKFteYF0rKWAvZywgXCI8Y29kZT4kMTwvY29kZT5cIik7XHJcblxyXG4gIC8vIEltYWdlcyAoYmVmb3JlIGxpbmtzKVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2csICc8aW1nIHNyYz1cIiQyXCIgYWx0PVwiJDFcIj4nKTtcclxuXHJcbiAgLy8gTGlua3NcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXFsoW15cXF1dKylcXF1cXCgoW14pXSspXFwpL2csICc8YSBocmVmPVwiJDJcIj4kMTwvYT4nKTtcclxuXHJcbiAgLy8gVW5vcmRlcmVkIGxpc3QgaXRlbXNcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eWy0qK10gKC4rKSQvZ20sIFwiPGxpPiQxPC9saT5cIik7XHJcblxyXG4gIC8vIE9yZGVyZWQgbGlzdCBpdGVtc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXGQrXFwuICguKykkL2dtLCBcIjxsaT4kMTwvbGk+XCIpO1xyXG5cclxuICAvLyBXcmFwIDxsaT4gcnVucyBpbiA8dWw+XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKDxsaT5bXFxzXFxTXSo/PFxcL2xpPlxcbj8pKy9nLCAobWF0Y2gpID0+IGA8dWw+JHttYXRjaH08L3VsPmApO1xyXG5cclxuICAvLyBQYXJhZ3JhcGhzIChkb3VibGUgbmV3bGluZSBcdTIxOTIgcGFyYWdyYXBoIGJsb2NrKVxyXG4gIGh0bWwgPSBodG1sXHJcbiAgICAuc3BsaXQoL1xcblxcbisvKVxyXG4gICAgLm1hcCgoYmxvY2spID0+IHtcclxuICAgICAgY29uc3QgdHJpbW1lZCA9IGJsb2NrLnRyaW0oKTtcclxuICAgICAgaWYgKCF0cmltbWVkKSByZXR1cm4gXCJcIjtcclxuICAgICAgaWYgKC9ePChoWzEtNl18dWx8b2x8bGl8YmxvY2txdW90ZXxwcmV8aHIpLy50ZXN0KHRyaW1tZWQpKSByZXR1cm4gdHJpbW1lZDtcclxuICAgICAgcmV0dXJuIGA8cD4ke3RyaW1tZWQucmVwbGFjZSgvXFxuL2csIFwiPGJyPlwiKX08L3A+YDtcclxuICAgIH0pXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAuam9pbihcIlxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGh0bWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdHJpcCBhbGwgTWFya2Rvd24gc3ludGF4IHRvIHByb2R1Y2UgcGxhaW4gdGV4dCBzdWl0YWJsZSBmb3JcclxuICogY2hhcmFjdGVyLWxpbWl0ZWQgcGxhdGZvcm1zIChUaHJlYWRzLCBNYXN0b2RvbiBwcmV2aWV3LCBldGMuKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93blRvUGxhaW5UZXh0KG1hcmtkb3duOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGxldCB0ZXh0ID0gbWFya2Rvd247XHJcbiAgLy8gRmVuY2VkIGNvZGUgYmxvY2tzIFx1MjE5MiBrZWVwIGNvbnRlbnRcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9gYGBcXHcqXFxuKFtcXHNcXFNdKj8pYGBgL2csIFwiJDFcIik7XHJcbiAgLy8gUmVtb3ZlIGhlYWRpbmcgbWFya2Vyc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14jezEsNn0gL2dtLCBcIlwiKTtcclxuICAvLyBCb2xkL2l0YWxpYyBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwqezEsM318X3sxLDN9L2csIFwiXCIpO1xyXG4gIC8vIElubGluZSBjb2RlIFx1MjE5MiB1bndyYXBcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9gKFteYF0rKWAvZywgXCIkMVwiKTtcclxuICAvLyBJbWFnZXMgXHUyMTkyIGFsdCB0ZXh0XHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKFteKV0rXFwpL2csIFwiJDFcIik7XHJcbiAgLy8gTGlua3MgXHUyMTkyIGxpbmsgdGV4dFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKFteKV0rXFwpL2csIFwiJDFcIik7XHJcbiAgLy8gQmxvY2txdW90ZXNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9ePiAvZ20sIFwiXCIpO1xyXG4gIC8vIExpc3QgbWFya2Vyc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL15bLSorXFxkLl0gL2dtLCBcIlwiKTtcclxuICAvLyBIb3Jpem9udGFsIHJ1bGVzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlstKl9dezMsfVxccyokL2dtLCBcIlwiKTtcclxuICAvLyBDb2xsYXBzZSBtdWx0aXBsZSBibGFuayBsaW5lc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XHJcbiAgcmV0dXJuIHRleHQudHJpbSgpO1xyXG59XHJcblxyXG5jb25zdCBGUk9OVE1BVFRFUl9URU1QTEFURSA9IGAtLS1cclxudGl0bGU6IFxyXG5zbHVnOiBcclxuZXhjZXJwdDogXHJcbnR5cGU6IGJsb2dcclxuc3RhdHVzOiBkcmFmdFxyXG50YWdzOiBbXVxyXG5waWxsYXI6IFxyXG5jb3ZlckltYWdlOiBcclxuZmVhdHVyZWQ6IGZhbHNlXHJcbm1ldGFUaXRsZTogXHJcbm1ldGFEZXNjcmlwdGlvbjogXHJcbm9nSW1hZ2U6IFxyXG52aWRlb1VybDogXHJcbmNhbm9uaWNhbFVybDogXHJcbnN5bmRpY2F0aW9uOiBbXVxyXG4tLS1cclxuXHJcbmA7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3NzZVB1Ymxpc2hlclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcbiAgc2V0dGluZ3M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4gIHByaXZhdGUgc3RhdHVzQmFyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBhdXRvUHVibGlzaFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgYXV0b1B1Ymxpc2hSZWdpc3RlcmVkID0gZmFsc2U7XHJcblxyXG4gIGFzeW5jIG9ubG9hZCgpIHtcclxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcbiAgICB0aGlzLm1pZ3JhdGVTZXR0aW5ncygpO1xyXG5cclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcclxuXHJcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJzZW5kXCIsIFwiUG9zc2UgcHVibGlzaFwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgcHVibGlzaFwiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2gtZHJhZnRcIixcclxuICAgICAgbmFtZTogXCJQb3NzZSBwdWJsaXNoIGFzIGRyYWZ0XCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcImRyYWZ0XCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1saXZlXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgcHVibGlzaCBsaXZlXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcInB1Ymxpc2hlZFwiKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLWluc2VydC10ZW1wbGF0ZVwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIGluc2VydCBmcm9udG1hdHRlciB0ZW1wbGF0ZVwiLFxyXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcclxuICAgICAgICBpZiAoY29udGVudC50cmltU3RhcnQoKS5zdGFydHNXaXRoKFwiLS0tXCIpKSB7XHJcbiAgICAgICAgICBuZXcgTm90aWNlKFwiRnJvbnRtYXR0ZXIgYWxyZWFkeSBleGlzdHMgaW4gdGhpcyBub3RlXCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDAsIDApO1xyXG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoRlJPTlRNQVRURVJfVEVNUExBVEUsIHsgbGluZTogMCwgY2g6IDAgfSk7XHJcbiAgICAgICAgLy8gUGxhY2UgY3Vyc29yIG9uIHRoZSB0aXRsZSBsaW5lXHJcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcigxLCA3KTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXRvLWFsbFwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIHRvIGFsbCBkZXN0aW5hdGlvbnNcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VUb0FsbCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2Utc3RhdHVzXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2Ugc3RhdHVzIFx1MjAxNCB2aWV3IHN5bmRpY2F0aW9uXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBvc3NlU3RhdHVzKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBvc3NlUHVibGlzaGVyU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuICAgIHRoaXMucmVnaXN0ZXJBdXRvUHVibGlzaCgpO1xyXG4gIH1cclxuXHJcbiAgb251bmxvYWQoKSB7XHJcbiAgICB0aGlzLnN0YXR1c0JhckVsID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmF1dG9QdWJsaXNoVGltZXIpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b1B1Ymxpc2hUaW1lcik7XHJcbiAgICAgIHRoaXMuYXV0b1B1Ymxpc2hUaW1lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWdpc3RlciAob3Igc2tpcCkgdGhlIHZhdWx0ICdtb2RpZnknIGV2ZW50IGxpc3RlbmVyIGZvciBhdXRvLXB1Ymxpc2guXHJcbiAgICogT25seSBwdWJsaXNoZXMgZmlsZXMgdGhhdCBoYXZlIGBzdGF0dXM6IHB1Ymxpc2hlZGAgaW4gZnJvbnRtYXR0ZXIgdG9cclxuICAgKiBhdm9pZCBhY2NpZGVudGFsbHkgcHVzaGluZyBkcmFmdHMuIERlYm91bmNlcyBzYXZlcyBieSAzIHNlY29uZHMgc29cclxuICAgKiByYXBpZCBrZXlzdHJva2VzIGRvbid0IHRyaWdnZXIgbXVsdGlwbGUgQVBJIGNhbGxzLlxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyQXV0b1B1Ymxpc2goKSB7XHJcbiAgICBpZiAodGhpcy5hdXRvUHVibGlzaFJlZ2lzdGVyZWQpIHJldHVybjtcclxuICAgIHRoaXMuYXV0b1B1Ymxpc2hSZWdpc3RlcmVkID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcbiAgICAgIHRoaXMuYXBwLnZhdWx0Lm9uKFwibW9kaWZ5XCIsIChmaWxlKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzLmF1dG9QdWJsaXNoT25TYXZlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gXCJtZFwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE9ubHkgYXV0by1wdWJsaXNoIGlmIHRoZSBub3RlIGhhcyBzdGF0dXM6IHB1Ymxpc2hlZFxyXG4gICAgICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XHJcbiAgICAgICAgY29uc3QgZm0gPSBjYWNoZT8uZnJvbnRtYXR0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKCFmbSB8fCBmbS5zdGF0dXMgIT09IFwicHVibGlzaGVkXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRGVib3VuY2UgXHUyMDE0IHdhaXQgM3MgYWZ0ZXIgbGFzdCBzYXZlIGJlZm9yZSBwdWJsaXNoaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1B1Ymxpc2hUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b1B1Ymxpc2hUaW1lcik7XHJcbiAgICAgICAgdGhpcy5hdXRvUHVibGlzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF1dG9QdWJsaXNoVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgdm9pZCB0aGlzLmF1dG9QdWJsaXNoRmlsZShmaWxlKTtcclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgICAgfSksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqIEF1dG8tcHVibGlzaCBhIGZpbGUgdG8gdGhlIGNvbmZpZ3VyZWQgZGVzdGluYXRpb24gKG5vIGNvbmZpcm1hdGlvbiBtb2RhbCkuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBhdXRvUHVibGlzaEZpbGUoZmlsZTogVEZpbGUpIHtcclxuICAgIGNvbnN0IGRlc3QgPSB0aGlzLnJlc29sdmVBdXRvUHVibGlzaERlc3RpbmF0aW9uKCk7XHJcbiAgICBpZiAoIWRlc3QpIHJldHVybjtcclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3QpKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKGZpbGUpO1xyXG4gICAgLy8gU2tpcCBmaWxlcyB3aXRob3V0IGEgdGl0bGUgKGxpa2VseSBub3QgcmVhbCBjb250ZW50KVxyXG4gICAgaWYgKCFwYXlsb2FkLnRpdGxlIHx8IHBheWxvYWQudGl0bGUgPT09IFwiVW50aXRsZWRcIikgcmV0dXJuO1xyXG5cclxuICAgIGF3YWl0IHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdCwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgfVxyXG5cclxuICAvKiogUmVzb2x2ZSB3aGljaCBkZXN0aW5hdGlvbiB0byB1c2UgZm9yIGF1dG8tcHVibGlzaC4gKi9cclxuICBwcml2YXRlIHJlc29sdmVBdXRvUHVibGlzaERlc3RpbmF0aW9uKCk6IERlc3RpbmF0aW9uIHwgbnVsbCB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucywgYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbiB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAvLyBJZiBhIHNwZWNpZmljIGRlc3RpbmF0aW9uIGlzIG5hbWVkLCBmaW5kIGl0XHJcbiAgICBpZiAoYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbikge1xyXG4gICAgICBjb25zdCBtYXRjaCA9IGRlc3RpbmF0aW9ucy5maW5kKChkKSA9PiBkLm5hbWUgPT09IGF1dG9QdWJsaXNoRGVzdGluYXRpb24pO1xyXG4gICAgICBpZiAobWF0Y2gpIHJldHVybiBtYXRjaDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGYWxsYmFjazogZmlyc3QgY3VzdG9tLWFwaSBkZXN0aW5hdGlvblxyXG4gICAgcmV0dXJuIGRlc3RpbmF0aW9ucy5maW5kKChkKSA9PiBkLnR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgLy8gTWlncmF0ZSB2MSBzaW5nbGUtc2l0ZSBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIixcclxuICAgICAgICAgIHVybDogcmF3LnNpdGVVcmwsXHJcbiAgICAgICAgICBhcGlLZXk6IChyYXcuYXBpS2V5IGFzIHN0cmluZykgfHwgXCJcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVVcmw7XHJcbiAgICAgIGRlbGV0ZSByYXcuYXBpS2V5O1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBNaWdyYXRlIHNpdGVzIFx1MjE5MiBkZXN0aW5hdGlvbnMga2V5XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcuc2l0ZXMpICYmICFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IHJhdy5zaXRlcyBhcyBEZXN0aW5hdGlvbltdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVzO1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpIGFzIFBhcnRpYWw8UG9zc2VQdWJsaXNoZXJTZXR0aW5ncz4pO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGlja1NpdGVBbmRQdWJsaXNoKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdm9pZCB0aGlzLnByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uc1swXSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBuZXcgU2l0ZVBpY2tlck1vZGFsKHRoaXMuYXBwLCBkZXN0aW5hdGlvbnMsIChkZXN0KSA9PiB7XHJcbiAgICAgIHZvaWQgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0LCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICB9KS5vcGVuKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZCB0aGUgcHVibGlzaCBwYXlsb2FkIGZyb20gdGhlIGFjdGl2ZSBmaWxlIGFuZCBzZXR0aW5ncy5cclxuICAgKiBTaGFyZWQgYnkgcHJlcGFyZVB1Ymxpc2goKSBhbmQgcG9zc2VUb0FsbCgpIHRvIGF2b2lkIGR1cGxpY2F0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgYnVpbGRQYXlsb2FkKFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgICBvdmVycmlkZVN0YXR1cz86IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCIsXHJcbiAgKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xyXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcclxuICAgIGNvbnN0IGZyb250bWF0dGVyID0gYnVpbGRGcm9udG1hdHRlcihmaWxlQ2FjaGU/LmZyb250bWF0dGVyKTtcclxuICAgIGNvbnN0IGJvZHkgPSBleHRyYWN0Qm9keShjb250ZW50KTtcclxuICAgIGNvbnN0IHByb2Nlc3NlZEJvZHkgPSB0aGlzLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXggPyBwcmVwcm9jZXNzQ29udGVudChib2R5KSA6IGJvZHk7XHJcbiAgICBjb25zdCB0aXRsZSA9IGZyb250bWF0dGVyLnRpdGxlIHx8IGZpbGUuYmFzZW5hbWUgfHwgXCJVbnRpdGxlZFwiO1xyXG4gICAgY29uc3Qgc2x1ZyA9IHRvU2x1Zyhmcm9udG1hdHRlci5zbHVnIHx8IHRpdGxlKTtcclxuICAgIGNvbnN0IHJhd1N0YXR1cyA9IG92ZXJyaWRlU3RhdHVzIHx8IGZyb250bWF0dGVyLnN0YXR1cyB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRTdGF0dXM7XHJcbiAgICAvLyBOb3JtYWxpemUgY29tbW9uIGFsaWFzZXMgXHUyMTkyIGNhbm9uaWNhbCBBUEkgdmFsdWVzXHJcbiAgICBjb25zdCBzdGF0dXMgPVxyXG4gICAgICByYXdTdGF0dXMgPT09IFwicHVibGlzaFwiID8gXCJwdWJsaXNoZWRcIiA6XHJcbiAgICAgIHJhd1N0YXR1cyA9PT0gXCJhcmNoaXZlXCIgPyBcImFyY2hpdmVkXCIgOlxyXG4gICAgICAoW1wiZHJhZnRcIiwgXCJwdWJsaXNoZWRcIiwgXCJhcmNoaXZlZFwiXSBhcyBzdHJpbmdbXSkuaW5jbHVkZXMocmF3U3RhdHVzKSA/IHJhd1N0YXR1cyA6XHJcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVmYXVsdFN0YXR1cztcclxuICAgIGNvbnN0IHBvc3RUeXBlID0gZnJvbnRtYXR0ZXIudHlwZSB8fCBcImJsb2dcIjtcclxuICAgIC8vIFVzZSBmcm9udG1hdHRlciBjYW5vbmljYWxVcmwgb3ZlcnJpZGUgaWYgcHJlc2VudDsgb3RoZXJ3aXNlIGF1dG8tZ2VuZXJhdGVcclxuICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9XHJcbiAgICAgIGZyb250bWF0dGVyLmNhbm9uaWNhbFVybCB8fFxyXG4gICAgICAodGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsXHJcbiAgICAgICAgPyBgJHt0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3Bvc3RUeXBlfS8ke3NsdWd9YFxyXG4gICAgICAgIDogXCJcIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgc2x1ZyxcclxuICAgICAgYm9keTogcHJvY2Vzc2VkQm9keSxcclxuICAgICAgZXhjZXJwdDogZnJvbnRtYXR0ZXIuZXhjZXJwdCB8fCBcIlwiLFxyXG4gICAgICB0eXBlOiBwb3N0VHlwZSxcclxuICAgICAgc3RhdHVzLFxyXG4gICAgICB0YWdzOiBmcm9udG1hdHRlci50YWdzIHx8IFtdLFxyXG4gICAgICBwaWxsYXI6IGZyb250bWF0dGVyLnBpbGxhciB8fCBcIlwiLFxyXG4gICAgICBmZWF0dXJlZDogZnJvbnRtYXR0ZXIuZmVhdHVyZWQgfHwgZmFsc2UsXHJcbiAgICAgIGNvdmVySW1hZ2U6IGZyb250bWF0dGVyLmNvdmVySW1hZ2UgfHwgXCJcIixcclxuICAgICAgbWV0YVRpdGxlOiBmcm9udG1hdHRlci5tZXRhVGl0bGUgfHwgXCJcIixcclxuICAgICAgbWV0YURlc2NyaXB0aW9uOiBmcm9udG1hdHRlci5tZXRhRGVzY3JpcHRpb24gfHwgXCJcIixcclxuICAgICAgb2dJbWFnZTogZnJvbnRtYXR0ZXIub2dJbWFnZSB8fCBcIlwiLFxyXG4gICAgICB2aWRlb1VybDogZnJvbnRtYXR0ZXIudmlkZW9VcmwgfHwgXCJcIixcclxuICAgICAgLi4uKGNhbm9uaWNhbFVybCAmJiB7IGNhbm9uaWNhbFVybCB9KSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgb3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgTWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICBuZXcgTm90aWNlKGBDb25maWd1cmUgY3JlZGVudGlhbHMgZm9yIFwiJHtkZXN0aW5hdGlvbi5uYW1lfVwiIGluIHNldHRpbmdzYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5idWlsZFBheWxvYWQodmlldy5maWxlLCBvdmVycmlkZVN0YXR1cyk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2gpIHtcclxuICAgICAgbmV3IENvbmZpcm1QdWJsaXNoTW9kYWwodGhpcy5hcHAsIHBheWxvYWQsIGRlc3RpbmF0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgdm9pZCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUhKTtcclxuICAgICAgfSkub3BlbigpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdm9pZCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJvdXRlIGEgcHVibGlzaCB0byB0aGUgY29ycmVjdCBwbGF0Zm9ybSBoYW5kbGVyLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGVzdGluYXRpb24oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgc3dpdGNoIChkZXN0aW5hdGlvbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJkZXZ0b1wiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0RldlRvKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcIm1hc3RvZG9uXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvTWFzdG9kb24oZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwiYmx1ZXNreVwiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0JsdWVza3koZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwibWVkaXVtXCI6XHJcbiAgICAgIGNhc2UgXCJyZWRkaXRcIjpcclxuICAgICAgY2FzZSBcInRocmVhZHNcIjpcclxuICAgICAgY2FzZSBcImxpbmtlZGluXCI6XHJcbiAgICAgIGNhc2UgXCJlY2VuY3lcIjpcclxuICAgICAgICBuZXcgTm90aWNlKGAke2Rlc3RpbmF0aW9uLm5hbWV9OiAke2Rlc3RpbmF0aW9uLnR5cGV9IHN1cHBvcnQgaXMgY29taW5nIGluIGEgZnV0dXJlIHVwZGF0ZWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9DdXN0b21BcGkoZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gYSBjdXN0b20gL2FwaS9wdWJsaXNoIGVuZHBvaW50LiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQ3VzdG9tQXBpKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICBjb25zdCBzdGF0dXMgPSBwYXlsb2FkLnN0YXR1cyBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyICR7ZGVzdGluYXRpb24ubmFtZX0uLi5gKTtcclxuICAgICAgY29uc3QgdXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYXBpL3B1Ymxpc2hgO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJ4LXB1Ymxpc2gta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxyXG4gICAgICAgIHRocm93OiBmYWxzZSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGxldCB2ZXJiID0gXCJQT1NTRWRcIjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBpZiAoanNvbj8udXBzZXJ0ZWQpIHZlcmIgPSBcIlVwZGF0ZWRcIjtcclxuICAgICAgICB9IGNhdGNoIHsgLyogbm9uLUpTT04gKi8gfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYCR7dmVyYn0gXCIke3RpdGxlfVwiIG9uICR7ZGVzdGluYXRpb24ubmFtZX0gYXMgJHtzdGF0dXN9YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhkZXN0aW5hdGlvbi5uYW1lKTtcclxuICAgICAgICBsZXQgc3luZGljYXRpb25Vcmw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBzeW5kaWNhdGlvblVybCA9IChqc29uPy51cmwgYXMgc3RyaW5nKSB8fFxyXG4gICAgICAgICAgICBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3BheWxvYWQuc2x1ZyBhcyBzdHJpbmd9YDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHN5bmRpY2F0aW9uVXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwYXlsb2FkLnNsdWcgYXMgc3RyaW5nfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBzeW5kaWNhdGlvblVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZXJyb3JEZXRhaWwgPSAoanNvbj8uZXJyb3IgYXMgc3RyaW5nKSB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFIHRvICR7ZGVzdGluYXRpb24ubmFtZX0gZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0UgZXJyb3IgKCR7ZGVzdGluYXRpb24ubmFtZX0pOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIERldi50byB2aWEgdGhlaXIgYXJ0aWNsZXMgQVBJLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGV2VG8oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgRGV2LnRvICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCB0YWdzID0gKChwYXlsb2FkLnRhZ3MgYXMgc3RyaW5nW10pIHx8IFtdKVxyXG4gICAgICAgIC5zbGljZSgwLCA0KVxyXG4gICAgICAgIC5tYXAoKHQpID0+IHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywgXCJcIikpO1xyXG4gICAgICBjb25zdCBhcnRpY2xlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcclxuICAgICAgICB0aXRsZSxcclxuICAgICAgICBib2R5X21hcmtkb3duOiBwYXlsb2FkLmJvZHkgYXMgc3RyaW5nLFxyXG4gICAgICAgIHB1Ymxpc2hlZDogcGF5bG9hZC5zdGF0dXMgPT09IFwicHVibGlzaGVkXCIsXHJcbiAgICAgICAgdGFncyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCIsXHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChwYXlsb2FkLmNhbm9uaWNhbFVybCkgYXJ0aWNsZS5jYW5vbmljYWxfdXJsID0gcGF5bG9hZC5jYW5vbmljYWxVcmw7XHJcbiAgICAgIGlmIChwYXlsb2FkLmNvdmVySW1hZ2UpIGFydGljbGUubWFpbl9pbWFnZSA9IHBheWxvYWQuY292ZXJJbWFnZTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9kZXYudG8vYXBpL2FydGljbGVzXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiYXBpLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFydGljbGUgfSksXHJcbiAgICAgICAgdGhyb3c6IGZhbHNlLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgYXJ0aWNsZVVybDogc3RyaW5nID0gKGpzb24/LnVybCBhcyBzdHJpbmcpIHx8IFwiaHR0cHM6Ly9kZXYudG9cIjtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIERldi50b2ApO1xyXG4gICAgICAgIHRoaXMuc2hvd1N0YXR1c0JhclN1Y2Nlc3MoXCJEZXYudG9cIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIGFydGljbGVVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBqc29uID0gcmVzcG9uc2UuanNvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgIGVycm9yRGV0YWlsID0gKGpzb24/LmVycm9yIGFzIHN0cmluZykgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7XHJcbiAgICAgICAgfSBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBEZXYudG8gUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgRGV2LnRvIGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIE1hc3RvZG9uIGJ5IHBvc3RpbmcgYSBzdGF0dXMgd2l0aCB0aGUgY2Fub25pY2FsIGxpbmsuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9NYXN0b2RvbihcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBNYXN0b2RvbiAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuICAgICAgY29uc3QgZXhjZXJwdCA9IChwYXlsb2FkLmV4Y2VycHQgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSAocGF5bG9hZC5jYW5vbmljYWxVcmwgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBzdGF0dXNUZXh0ID0gW3RpdGxlLCBleGNlcnB0LCBjYW5vbmljYWxVcmxdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXFxuXCIpO1xyXG4gICAgICBjb25zdCBpbnN0YW5jZVVybCA9IChkZXN0aW5hdGlvbi5pbnN0YW5jZVVybCB8fCBcIlwiKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBgJHtpbnN0YW5jZVVybH0vYXBpL3YxL3N0YXR1c2VzYCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtkZXN0aW5hdGlvbi5hY2Nlc3NUb2tlbn1gLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdGF0dXM6IHN0YXR1c1RleHQsIHZpc2liaWxpdHk6IFwicHVibGljXCIgfSksXHJcbiAgICAgICAgdGhyb3c6IGZhbHNlLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzVXJsOiBzdHJpbmcgPSAoanNvbj8udXJsIGFzIHN0cmluZykgfHwgaW5zdGFuY2VVcmw7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0VkIFwiJHt0aXRsZX1cIiB0byBNYXN0b2RvbmApO1xyXG4gICAgICAgIHRoaXMuc2hvd1N0YXR1c0JhclN1Y2Nlc3MoXCJNYXN0b2RvblwiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgc3RhdHVzVXJsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZXJyb3JEZXRhaWw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBlcnJvckRldGFpbCA9IChqc29uPy5lcnJvciBhcyBzdHJpbmcpIHx8IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgTWFzdG9kb24gUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgTWFzdG9kb24gZXJyb3I6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gQmx1ZXNreSB2aWEgQVQgUHJvdG9jb2wuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9CbHVlc2t5KFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIEJsdWVza3kgKCR7ZGVzdGluYXRpb24ubmFtZX0pLi4uYCk7XHJcblxyXG4gICAgICAvLyBBdXRoZW50aWNhdGVcclxuICAgICAgY29uc3QgYXV0aFJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vYnNreS5zb2NpYWwveHJwYy9jb20uYXRwcm90by5zZXJ2ZXIuY3JlYXRlU2Vzc2lvblwiLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIGlkZW50aWZpZXI6IGRlc3RpbmF0aW9uLmhhbmRsZSxcclxuICAgICAgICAgIHBhc3N3b3JkOiBkZXN0aW5hdGlvbi5hcHBQYXNzd29yZCxcclxuICAgICAgICB9KSxcclxuICAgICAgICB0aHJvdzogZmFsc2UsXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoYXV0aFJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCBhdXRoUmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgYXV0aCBmYWlsZWQ6ICR7YXV0aFJlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgeyBkaWQsIGFjY2Vzc0p3dCB9ID0gYXV0aFJlc3BvbnNlLmpzb24gYXMgeyBkaWQ6IHN0cmluZzsgYWNjZXNzSnd0OiBzdHJpbmcgfTtcclxuXHJcbiAgICAgIC8vIEJ1aWxkIHBvc3QgdGV4dCAoMzAwIGNoYXIgbGltaXQpXHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGV4Y2VycHQgPSAocGF5bG9hZC5leGNlcnB0IGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3QgYmFzZVRleHQgPSBbdGl0bGUsIGV4Y2VycHRdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFx1MjAxNCBcIik7XHJcbiAgICAgIGNvbnN0IG1heFRleHQgPSAzMDAgLSAoY2Fub25pY2FsVXJsID8gY2Fub25pY2FsVXJsLmxlbmd0aCArIDEgOiAwKTtcclxuICAgICAgY29uc3QgdGV4dCA9IChiYXNlVGV4dC5sZW5ndGggPiBtYXhUZXh0XHJcbiAgICAgICAgPyBiYXNlVGV4dC5zdWJzdHJpbmcoMCwgbWF4VGV4dCAtIDEpICsgXCJcdTIwMjZcIlxyXG4gICAgICAgIDogYmFzZVRleHRcclxuICAgICAgKSArIChjYW5vbmljYWxVcmwgPyBgICR7Y2Fub25pY2FsVXJsfWAgOiBcIlwiKTtcclxuXHJcbiAgICAgIGNvbnN0IHBvc3RSZWNvcmQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xyXG4gICAgICAgICR0eXBlOiBcImFwcC5ic2t5LmZlZWQucG9zdFwiLFxyXG4gICAgICAgIHRleHQsXHJcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgbGFuZ3M6IFtcImVuXCJdLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoY2Fub25pY2FsVXJsKSB7XHJcbiAgICAgICAgY29uc3QgdXJsU3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKGNhbm9uaWNhbFVybCk7XHJcbiAgICAgICAgcG9zdFJlY29yZC5mYWNldHMgPSBbe1xyXG4gICAgICAgICAgaW5kZXg6IHsgYnl0ZVN0YXJ0OiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGV4dC5zdWJzdHJpbmcoMCwgdXJsU3RhcnQpKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICBieXRlRW5kOiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh0ZXh0LnN1YnN0cmluZygwLCB1cmxTdGFydCArIGNhbm9uaWNhbFVybC5sZW5ndGgpKS5sZW5ndGggfSxcclxuICAgICAgICAgIGZlYXR1cmVzOiBbeyAkdHlwZTogXCJhcHAuYnNreS5yaWNodGV4dC5mYWNldCNsaW5rXCIsIHVyaTogY2Fub25pY2FsVXJsIH1dLFxyXG4gICAgICAgIH1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8ucmVwby5jcmVhdGVSZWNvcmRcIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHthY2Nlc3NKd3R9YCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIHJlcG86IGRpZCxcclxuICAgICAgICAgIGNvbGxlY3Rpb246IFwiYXBwLmJza3kuZmVlZC5wb3N0XCIsXHJcbiAgICAgICAgICByZWNvcmQ6IHBvc3RSZWNvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdGhyb3c6IGZhbHNlLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QgY3JlYXRlSnNvbiA9IGNyZWF0ZVJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgdXJpOiBzdHJpbmcgPSAoY3JlYXRlSnNvbj8udXJpIGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgICBjb25zdCBwb3N0VXJsID0gdXJpXHJcbiAgICAgICAgICA/IGBodHRwczovL2Jza3kuYXBwL3Byb2ZpbGUvJHtkZXN0aW5hdGlvbi5oYW5kbGV9L3Bvc3QvJHt1cmkuc3BsaXQoXCIvXCIpLnBvcCgpfWBcclxuICAgICAgICAgIDogXCJodHRwczovL2Jza3kuYXBwXCI7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0VkIFwiJHt0aXRsZX1cIiB0byBCbHVlc2t5YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIkJsdWVza3lcIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHBvc3RVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBjcmVhdGVKc29uID0gY3JlYXRlUmVzcG9uc2UuanNvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgIGVycm9yRGV0YWlsID0gU3RyaW5nKChjcmVhdGVKc29uPy5tZXNzYWdlIGFzIHN0cmluZykgfHwgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcoY3JlYXRlUmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBlcnJvcjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUE9TU0UgdG8gYWxsIGNvbmZpZ3VyZWQgZGVzdGluYXRpb25zIGF0IG9uY2UuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwb3NzZVRvQWxsKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcbiAgICBpZiAoIXZpZXcgfHwgIXZpZXcuZmlsZSkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiT3BlbiBhIE1hcmtkb3duIGZpbGUgZmlyc3RcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCB0aGlzLmJ1aWxkUGF5bG9hZCh2aWV3LmZpbGUsIG92ZXJyaWRlU3RhdHVzKTtcclxuICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHtTdHJpbmcocGF5bG9hZC50aXRsZSl9XCIgdG8gJHtkZXN0aW5hdGlvbnMubGVuZ3RofSBkZXN0aW5hdGlvbihzKS4uLmApO1xyXG4gICAgZm9yIChjb25zdCBkZXN0IG9mIGRlc3RpbmF0aW9ucykge1xyXG4gICAgICBpZiAodGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3QpKSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wdWJsaXNoVG9EZXN0aW5hdGlvbihkZXN0LCBwYXlsb2FkLCB2aWV3LmZpbGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFNraXBwaW5nIFwiJHtkZXN0Lm5hbWV9XCIgXHUyMDE0IGNyZWRlbnRpYWxzIG5vdCBjb25maWd1cmVkYCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBDaGVjayB3aGV0aGVyIGEgZGVzdGluYXRpb24gaGFzIHRoZSByZXF1aXJlZCBjcmVkZW50aWFscyBjb25maWd1cmVkLiAqL1xyXG4gIGhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdDogRGVzdGluYXRpb24pOiBib29sZWFuIHtcclxuICAgIHN3aXRjaCAoZGVzdC50eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJkZXZ0b1wiOiAgICByZXR1cm4gISFkZXN0LmFwaUtleTtcclxuICAgICAgY2FzZSBcIm1hc3RvZG9uXCI6IHJldHVybiAhIShkZXN0Lmluc3RhbmNlVXJsICYmIGRlc3QuYWNjZXNzVG9rZW4pO1xyXG4gICAgICBjYXNlIFwiYmx1ZXNreVwiOiAgcmV0dXJuICEhKGRlc3QuaGFuZGxlICYmIGRlc3QuYXBwUGFzc3dvcmQpO1xyXG4gICAgICBjYXNlIFwibWVkaXVtXCI6ICAgcmV0dXJuICEhZGVzdC5tZWRpdW1Ub2tlbjtcclxuICAgICAgY2FzZSBcInJlZGRpdFwiOiAgIHJldHVybiAhIShkZXN0LnJlZGRpdENsaWVudElkICYmIGRlc3QucmVkZGl0Q2xpZW50U2VjcmV0ICYmIGRlc3QucmVkZGl0UmVmcmVzaFRva2VuKTtcclxuICAgICAgY2FzZSBcInRocmVhZHNcIjogIHJldHVybiAhIShkZXN0LnRocmVhZHNVc2VySWQgJiYgZGVzdC50aHJlYWRzQWNjZXNzVG9rZW4pO1xyXG4gICAgICBjYXNlIFwibGlua2VkaW5cIjogcmV0dXJuICEhKGRlc3QubGlua2VkaW5BY2Nlc3NUb2tlbiAmJiBkZXN0LmxpbmtlZGluUGVyc29uVXJuKTtcclxuICAgICAgY2FzZSBcImVjZW5jeVwiOiAgIHJldHVybiAhIShkZXN0LmhpdmVVc2VybmFtZSAmJiBkZXN0LmhpdmVQb3N0aW5nS2V5KTtcclxuICAgICAgZGVmYXVsdDogICAgICAgICByZXR1cm4gISEoZGVzdC51cmwgJiYgZGVzdC5hcGlLZXkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFdyaXRlIGEgc3luZGljYXRpb24gZW50cnkgYmFjayBpbnRvIHRoZSBub3RlJ3MgZnJvbnRtYXR0ZXIuIFVwZGF0ZXMgdGhlIFVSTCBpZiB0aGUgZGVzdGluYXRpb24gYWxyZWFkeSBleGlzdHMuICovXHJcbiAgcHJpdmF0ZSBhc3luYyB3cml0ZVN5bmRpY2F0aW9uKGZpbGU6IFRGaWxlLCBuYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGZtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4ge1xyXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZm0uc3luZGljYXRpb24pKSBmbS5zeW5kaWNhdGlvbiA9IFtdO1xyXG4gICAgICBjb25zdCBlbnRyaWVzID0gZm0uc3luZGljYXRpb24gYXMgQXJyYXk8eyBuYW1lPzogc3RyaW5nOyB1cmw/OiBzdHJpbmcgfT47XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gZW50cmllcy5maW5kKChzKSA9PiBzLm5hbWUgPT09IG5hbWUpO1xyXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgICBleGlzdGluZy51cmwgPSB1cmw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZW50cmllcy5wdXNoKHsgdXJsLCBuYW1lIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd1N0YXR1c0JhclN1Y2Nlc3Moc2l0ZU5hbWU6IHN0cmluZykge1xyXG4gICAgaWYgKCF0aGlzLnN0YXR1c0JhckVsKSByZXR1cm47XHJcbiAgICB0aGlzLnN0YXR1c0JhckVsLnNldFRleHQoYFBPU1NFZCBcdTI3MTMgJHtzaXRlTmFtZX1gKTtcclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuc3RhdHVzQmFyRWwpIHRoaXMuc3RhdHVzQmFyRWwuc2V0VGV4dChcIlwiKTtcclxuICAgIH0sIDUwMDApO1xyXG4gIH1cclxuXHJcbiAgLyoqIFNob3cgY3VycmVudCBzeW5kaWNhdGlvbiBzdGF0dXMgZm9yIHRoZSBhY3RpdmUgbm90ZS4gKi9cclxuICBwcml2YXRlIHBvc3NlU3RhdHVzKCkge1xyXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcbiAgICBpZiAoIXZpZXcgfHwgIXZpZXcuZmlsZSkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiT3BlbiBhIE1hcmtkb3duIGZpbGUgZmlyc3RcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpbGVDYWNoZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHZpZXcuZmlsZSk7XHJcbiAgICBjb25zdCBmbSA9IGZpbGVDYWNoZT8uZnJvbnRtYXR0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBzeW5kaWNhdGlvbjogdW5rbm93biA9IGZtPy5zeW5kaWNhdGlvbjtcclxuICAgIGNvbnN0IHRpdGxlID0gKGZtPy50aXRsZSBhcyBzdHJpbmcpIHx8IHZpZXcuZmlsZS5iYXNlbmFtZTtcclxuICAgIG5ldyBQb3NzZVN0YXR1c01vZGFsKHRoaXMuYXBwLCB0aXRsZSwgc3luZGljYXRpb24pLm9wZW4oKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBDb25maXJtYXRpb24gTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBDb25maXJtUHVibGlzaE1vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XHJcbiAgcHJpdmF0ZSBkZXN0aW5hdGlvbjogRGVzdGluYXRpb247XHJcbiAgcHJpdmF0ZSBvbkNvbmZpcm06ICgpID0+IHZvaWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgYXBwOiBBcHAsXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIG9uQ29uZmlybTogKCkgPT4gdm9pZCxcclxuICApIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xyXG4gICAgdGhpcy5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xyXG4gICAgdGhpcy5vbkNvbmZpcm0gPSBvbkNvbmZpcm07XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKSB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcInBvc3NlLXB1Ymxpc2hlci1jb25maXJtLW1vZGFsXCIpO1xyXG5cclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJDb25maXJtIHBvc3NlXCIgfSk7XHJcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHtcclxuICAgICAgdGV4dDogYFlvdSBhcmUgYWJvdXQgdG8gUE9TU0UgdG8gJHt0aGlzLmRlc3RpbmF0aW9uLm5hbWV9OmAsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBzdW1tYXJ5ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJwdWJsaXNoLXN1bW1hcnlcIiB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgVGl0bGU6ICR7U3RyaW5nKHRoaXMucGF5bG9hZC50aXRsZSl9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgU2x1ZzogJHtTdHJpbmcodGhpcy5wYXlsb2FkLnNsdWcpfWAgfSk7XHJcbiAgICBzdW1tYXJ5LmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogYFN0YXR1czogJHtTdHJpbmcodGhpcy5wYXlsb2FkLnN0YXR1cyl9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgVHlwZTogJHtTdHJpbmcodGhpcy5wYXlsb2FkLnR5cGUpfWAgfSk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhbmNlbEJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNhbmNlbFwiIH0pO1xyXG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xyXG5cclxuICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgdGV4dDogXCJQT1NTRVwiLFxyXG4gICAgICBjbHM6IFwibW9kLWN0YVwiLFxyXG4gICAgfSk7XHJcbiAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpIHtcclxuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2l0ZSBQaWNrZXIgTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBTaXRlUGlja2VyTW9kYWwgZXh0ZW5kcyBTdWdnZXN0TW9kYWw8RGVzdGluYXRpb24+IHtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uczogRGVzdGluYXRpb25bXTtcclxuICBwcml2YXRlIG9uQ2hvb3NlOiAoZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgZGVzdGluYXRpb25zOiBEZXN0aW5hdGlvbltdLCBvbkNob29zZTogKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikgPT4gdm9pZCkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMuZGVzdGluYXRpb25zID0gZGVzdGluYXRpb25zO1xyXG4gICAgdGhpcy5vbkNob29zZSA9IG9uQ2hvb3NlO1xyXG4gICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIkNob29zZSBhIGRlc3RpbmF0aW9uIHRvIHBvc3NlIHRvLi4uXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IERlc3RpbmF0aW9uW10ge1xyXG4gICAgY29uc3QgbG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25zLmZpbHRlcihcclxuICAgICAgKGQpID0+XHJcbiAgICAgICAgZC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXIpIHx8XHJcbiAgICAgICAgZC51cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlciksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyU3VnZ2VzdGlvbihkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sIGVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgZWwuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBkZXN0aW5hdGlvbi5uYW1lLCBjbHM6IFwic3VnZ2VzdGlvbi10aXRsZVwiIH0pO1xyXG4gICAgZWwuY3JlYXRlRWwoXCJzbWFsbFwiLCB7IHRleHQ6IGRlc3RpbmF0aW9uLnVybCwgY2xzOiBcInN1Z2dlc3Rpb24tbm90ZVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DaG9vc2VTdWdnZXN0aW9uKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikge1xyXG4gICAgdGhpcy5vbkNob29zZShkZXN0aW5hdGlvbik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2V0dGluZ3MgVGFiIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxuY2xhc3MgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBQb3NzZVB1Ymxpc2hlclBsdWdpbjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogUG9zc2VQdWJsaXNoZXJQbHVnaW4pIHtcclxuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gIH1cclxuXHJcbiAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiWW91ciBjYW5vbmljYWwgc2l0ZVwiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQ2Fub25pY2FsIGJhc2UgVVJMXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiWW91ciBvd24gc2l0ZSdzIHJvb3QgVVJMLiBFdmVyeSBwdWJsaXNoZWQgcG9zdCB3aWxsIGluY2x1ZGUgYSBjYW5vbmljYWwgVVJMIHBvaW50aW5nIGhlcmUgXHUyMDE0IHRoZSBvcmlnaW5hbCB5b3Ugb3duLlwiKVxyXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJodHRwczovL3lvdXJzaXRlLmNvbVwiKVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwOi8vbG9jYWxob3N0XCIpKSB7XHJcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShcIldhcm5pbmc6IGNhbm9uaWNhbCBiYXNlIFVSTCBzaG91bGQgc3RhcnQgd2l0aCBIVFRQUzovL1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiRGVzdGluYXRpb25zXCIpLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMuZm9yRWFjaCgoZGVzdGluYXRpb24sIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGRlc3RDb250YWluZXIgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoe1xyXG4gICAgICAgIGNsczogXCJwb3NzZS1wdWJsaXNoZXItc2l0ZVwiLFxyXG4gICAgICB9KTtcclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcikuc2V0TmFtZShkZXN0aW5hdGlvbi5uYW1lIHx8IGBEZXN0aW5hdGlvbiAke2luZGV4ICsgMX1gKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgIC5zZXROYW1lKFwiRGVzdGluYXRpb24gbmFtZVwiKVxyXG4gICAgICAgIC5zZXREZXNjKFwiQSBsYWJlbCBmb3IgdGhpcyBkZXN0aW5hdGlvbiAoZS5nLiBNeSBibG9nKVwiKVxyXG4gICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJNeSBzaXRlXCIpXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5uYW1lKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5uYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgIC5zZXROYW1lKFwiVHlwZVwiKVxyXG4gICAgICAgIC5zZXREZXNjKFwiUGxhdGZvcm0gdG8gcHVibGlzaCB0b1wiKVxyXG4gICAgICAgIC5hZGREcm9wZG93bigoZGQpID0+XHJcbiAgICAgICAgICBkZFxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiY3VzdG9tLWFwaVwiLCBcIkN1c3RvbSBBUElcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImRldnRvXCIsIFwiRGV2LnRvXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJtYXN0b2RvblwiLCBcIk1hc3RvZG9uXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJibHVlc2t5XCIsIFwiQmx1ZXNreVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwibWVkaXVtXCIsIFwiTWVkaXVtXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJyZWRkaXRcIiwgXCJSZWRkaXRcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcInRocmVhZHNcIiwgXCJUaHJlYWRzXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJsaW5rZWRpblwiLCBcIkxpbmtlZEluXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJlY2VuY3lcIiwgXCJFY2VuY3lcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnR5cGUgfHwgXCJjdXN0b20tYXBpXCIpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnR5cGUgPSB2YWx1ZSBhcyBEZXN0aW5hdGlvblR5cGU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICBjb25zdCBkZXN0VHlwZSA9IGRlc3RpbmF0aW9uLnR5cGUgfHwgXCJjdXN0b20tYXBpXCI7XHJcblxyXG4gICAgICBpZiAoZGVzdFR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiU2l0ZSBVUkxcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBzaXRlJ3MgYmFzZSBVUkwgKG11c3Qgc3RhcnQgd2l0aCBIVFRQUzovLylcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi51cmwgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwOi8vbG9jYWxob3N0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBkZXN0aW5hdGlvbiBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggSFRUUFM6Ly9cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQVBJIGtleVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJgUFVCTElTSF9BUElfS0VZYCBmcm9tIHlvdXIgc2l0ZSdzIGVudmlyb25tZW50XCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgQVBJIGtleVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5hcGlLZXkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFwaUtleSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImRldnRvXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJEZXYudG8gQVBJIGtleVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIGh0dHBzOi8vZGV2LnRvL3NldHRpbmdzL2V4dGVuc2lvbnNcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBkZXYudG8gQVBJIGtleVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5hcGlLZXkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFwaUtleSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcIm1hc3RvZG9uXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJJbnN0YW5jZSBVUkxcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBNYXN0b2RvbiBpbnN0YW5jZSAoZS5nLiBodHRwczovL21hc3RvZG9uLnNvY2lhbClcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiSFRUUFM6Ly9tYXN0b2Rvbi5zb2NpYWxcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaW5zdGFuY2VVcmwgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmluc3RhbmNlVXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20geW91ciBtYXN0b2RvbiBhY2NvdW50OiBzZXR0aW5ncyBcdTIxOTIgZGV2ZWxvcG1lbnQgXHUyMTkyIG5ldyBhcHBsaWNhdGlvblwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5hY2Nlc3NUb2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYWNjZXNzVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJibHVlc2t5XCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJCbHVlc2t5IGhhbmRsZVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIGhhbmRsZSAoZS5nLiBZb3VybmFtZS5ic2t5LnNvY2lhbClcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiWW91cm5hbWUuYnNreS5zb2NpYWxcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGFuZGxlIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oYW5kbGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBcHAgcGFzc3dvcmRcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBodHRwczovL2Jza3kuYXBwL3NldHRpbmdzL2FwcC1wYXNzd29yZHMgXHUyMDE0IE5PVCB5b3VyIGxvZ2luIHBhc3N3b3JkXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiWHh4eC14eHh4LXh4eHgteHh4eFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5hcHBQYXNzd29yZCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBwUGFzc3dvcmQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJtZWRpdW1cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFQSSBub3RpY2VcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiVGhlIG1lZGl1bSBBUEkgd2FzIGFyY2hpdmVkIGluIG1hcmNoIDIwMjMuIEl0IG1heSBzdGlsbCB3b3JrIGJ1dCBjb3VsZCBiZSBkaXNjb250aW51ZWQgYXQgYW55IHRpbWUuXCIpO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkludGVncmF0aW9uIHRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gbWVkaXVtLmNvbSBcdTIxOTIgc2V0dGluZ3MgXHUyMTkyIHNlY3VyaXR5IGFuZCBhcHBzIFx1MjE5MiBpbnRlZ3JhdGlvbiB0b2tlbnNcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBtZWRpdW0gaW50ZWdyYXRpb24gdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubWVkaXVtVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLm1lZGl1bVRva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwicmVkZGl0XCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJDbGllbnQgSURcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSByZWRkaXQuY29tL3ByZWZzL2FwcHMgXHUyMDE0IGNyZWF0ZSBhIFxcXCJzY3JpcHRcXFwiIHR5cGUgYXBwXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkNsaWVudCBJRFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRDbGllbnRJZCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0Q2xpZW50SWQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJDbGllbnQgc2VjcmV0XCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiQ2xpZW50IHNlY3JldFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRDbGllbnRTZWNyZXQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdENsaWVudFNlY3JldCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlJlZnJlc2ggdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiQXV0aG9yaXphdGlvbiByZWZyZXNoIHRva2VuIGZvciB5b3VyIFJlZGRpdCBhY2NvdW50XCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiUmVmcmVzaCB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRSZWZyZXNoVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdFJlZnJlc2hUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlJlZGRpdCB1c2VybmFtZVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJVL3lvdXJuYW1lXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdFVzZXJuYW1lIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRVc2VybmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkRlZmF1bHQgc3VicmVkZGl0XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcImUuZy4gci93ZWJkZXYgXHUyMDE0IGNhbiBiZSBvdmVycmlkZGVuIHBlciBub3RlIHdpdGggXFxcInN1YnJlZGRpdDpcXFwiIGZyb250bWF0dGVyXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlIvc3VicmVkZGl0bmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXREZWZhdWx0U3VicmVkZGl0IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXREZWZhdWx0U3VicmVkZGl0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwidGhyZWFkc1wiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiVGhyZWFkcyB1c2VyIElEXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgbnVtZXJpYyB0aHJlYWRzL2luc3RhZ3JhbSB1c2VyIElEXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIjEyMzQ1Njc4OVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi50aHJlYWRzVXNlcklkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS50aHJlYWRzVXNlcklkID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkxvbmctbGl2ZWQgdGhyZWFkcyBhY2Nlc3MgdG9rZW4gd2l0aCB0aHJlYWRzX2NvbnRlbnRfcHVibGlzaCBwZXJtaXNzaW9uXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgYWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnRocmVhZHNBY2Nlc3NUb2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udGhyZWFkc0FjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibGlua2VkaW5cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJBdXRob3JpemF0aW9uIGJlYXJlciB0b2tlbiB3aXRoIHdfbWVtYmVyX3NvY2lhbCBzY29wZVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5saW5rZWRpbkFjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5saW5rZWRpbkFjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUGVyc29uIGlkZW50aWZpZXJcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBMaW5rZWRJbiBtZW1iZXIgaWRlbnRpZmllclwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJVcm46bGk6cGVyc29uOi4uLlwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5saW5rZWRpblBlcnNvblVybiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubGlua2VkaW5QZXJzb25Vcm4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJlY2VuY3lcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlVzZXJuYW1lXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgYWNjb3VudCBuYW1lIG9uIGh0dHBzOi8vZWNlbmN5LmNvbSAod2l0aG91dCBAKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJZb3VyIHVzZXJuYW1lXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhpdmVVc2VybmFtZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaGl2ZVVzZXJuYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUG9zdGluZyBrZXlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBwcml2YXRlIHBvc3Rpbmcga2V5IGZyb20gaHR0cHM6Ly9lY2VuY3kuY29tIChub3QgdGhlIG93bmVyIG9yIGFjdGl2ZSBrZXkpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiNWsuLi5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGl2ZVBvc3RpbmdLZXkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVQb3N0aW5nS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQ29tbXVuaXR5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkhpdmUgY29tbXVuaXR5IHRhZyB0byBwb3N0IGluIChlLmcuIEhpdmUtMTc0MzAxIGZvciBvY2QpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkhpdmUtMTc0MzAxXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhpdmVDb21tdW5pdHkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVDb21tdW5pdHkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlRlc3QgY29ubmVjdGlvblwiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsdWdpbi5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJDb25maWd1cmUgY3JlZGVudGlhbHMgZmlyc3RcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkZXN0VHlwZSA9PT0gXCJjdXN0b20tYXBpXCIpIHtcclxuICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS9hcGkvcHVibGlzaGA7XHJcbiAgICAgICAgICAgICAgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiT1BUSU9OU1wiLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIngtcHVibGlzaC1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5IH0sXHJcbiAgICAgICAgICAgICAgICB0aHJvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDQwMCkge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBDb25uZWN0aW9uIHRvICR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9IHN1Y2Nlc3NmdWxgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYCR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9IHJlc3BvbmRlZCB3aXRoICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYENvdWxkIG5vdCByZWFjaCAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfWApO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoYENyZWRlbnRpYWxzIGxvb2sgY29uZmlndXJlZCBmb3IgJHtkZXN0aW5hdGlvbi5uYW1lfS4gUHVibGlzaCB0byB0ZXN0LmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICApXHJcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgICAgYnRuXHJcbiAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiUmVtb3ZlIGRlc3RpbmF0aW9uXCIpXHJcbiAgICAgICAgICAgIC5zZXRXYXJuaW5nKClcclxuICAgICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbmZpcm1FbCA9IGRlc3RDb250YWluZXIuY3JlYXRlRGl2KHtcclxuICAgICAgICAgICAgICAgIGNsczogXCJzZXR0aW5nLWl0ZW1cIixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25maXJtRWwuY3JlYXRlRWwoXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IGBSZW1vdmUgXCIke2Rlc3RpbmF0aW9uLm5hbWUgfHwgXCJ0aGlzIGRlc3RpbmF0aW9uXCJ9XCI/IGAsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgeWVzQnRuID0gY29uZmlybUVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiWWVzLCByZW1vdmVcIixcclxuICAgICAgICAgICAgICAgIGNsczogXCJtb2Qtd2FybmluZ1wiLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5vQnRuID0gY29uZmlybUVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDYW5jZWxcIiB9KTtcclxuICAgICAgICAgICAgICB5ZXNCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgdm9pZCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKS50aGVuKCgpID0+IHRoaXMuZGlzcGxheSgpKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBub0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gY29uZmlybUVsLnJlbW92ZSgpKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuXHJcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkFkZCBkZXN0aW5hdGlvblwiKVxyXG4gICAgICAgICAgLnNldEN0YSgpXHJcbiAgICAgICAgICAub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIlwiLFxyXG4gICAgICAgICAgICAgIHR5cGU6IFwiY3VzdG9tLWFwaVwiLFxyXG4gICAgICAgICAgICAgIHVybDogXCJcIixcclxuICAgICAgICAgICAgICBhcGlLZXk6IFwiXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2b2lkIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpLnRoZW4oKCkgPT4gdGhpcy5kaXNwbGF5KCkpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJEZWZhdWx0c1wiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiRGVmYXVsdCBzdGF0dXNcIilcclxuICAgICAgLnNldERlc2MoXCJEZWZhdWx0IHB1Ymxpc2ggc3RhdHVzIHdoZW4gbm90IHNwZWNpZmllZCBpbiBmcm9udG1hdHRlclwiKVxyXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxyXG4gICAgICAgIGRyb3Bkb3duXHJcbiAgICAgICAgICAuYWRkT3B0aW9uKFwiZHJhZnRcIiwgXCJEcmFmdFwiKVxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcInB1Ymxpc2hlZFwiLCBcIlB1Ymxpc2hlZFwiKVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRTdGF0dXMpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRTdGF0dXMgPSB2YWx1ZSBhc1xyXG4gICAgICAgICAgICAgIHwgXCJkcmFmdFwiXHJcbiAgICAgICAgICAgICAgfCBcInB1Ymxpc2hlZFwiO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkNvbmZpcm0gYmVmb3JlIHB1Ymxpc2hpbmdcIilcclxuICAgICAgLnNldERlc2MoXCJTaG93IGEgY29uZmlybWF0aW9uIG1vZGFsIHdpdGggcG9zdCBkZXRhaWxzIGJlZm9yZSBwdWJsaXNoaW5nXCIpXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb25maXJtQmVmb3JlUHVibGlzaClcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2ggPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJTdHJpcCB3aWtpLWxpbmtzIGFuZCBlbWJlZHNcIilcclxuICAgICAgLnNldERlc2MoXHJcbiAgICAgICAgXCJDb252ZXJ0IHdpa2ktbGlua3MsIHJlbW92ZSBlbWJlZHMsIGNvbW1lbnRzLCBhbmQgZGF0YXZpZXcgYmxvY2tzIGJlZm9yZSBwdWJsaXNoaW5nXCIsXHJcbiAgICAgIClcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXgpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXggPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIkF1dG8tcHVibGlzaFwiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQXV0by1wdWJsaXNoIG9uIHNhdmVcIilcclxuICAgICAgLnNldERlc2MoXHJcbiAgICAgICAgXCJBdXRvbWF0aWNhbGx5IHJlLXB1Ymxpc2ggdG8geW91ciBzaXRlIHdoZW4geW91IHNhdmUgYSBub3RlIHRoYXQgaGFzIHN0YXR1czogcHVibGlzaGVkIGluIGl0cyBmcm9udG1hdHRlci4gXCIgK1xyXG4gICAgICAgIFwiRHJhZnRzIGFyZSBuZXZlciBhdXRvLXB1Ymxpc2hlZC4gQ2hhbmdlcyBhcmUgZGVib3VuY2VkICgzcyBkZWxheSkgdG8gYXZvaWQgcmFwaWQtZmlyZSByZXF1ZXN0cy5cIixcclxuICAgICAgKVxyXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1B1Ymxpc2hPblNhdmUpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9QdWJsaXNoT25TYXZlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgY29uc3QgY3VzdG9tQXBpRGVzdHMgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMuZmlsdGVyKChkKSA9PiBkLnR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKTtcclxuICAgIGlmIChjdXN0b21BcGlEZXN0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKFwiQXV0by1wdWJsaXNoIGRlc3RpbmF0aW9uXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJXaGljaCBjdXN0b20tYXBpIGRlc3RpbmF0aW9uIHRvIGF1dG8tcHVibGlzaCB0by4gTGVhdmUgZW1wdHkgdG8gdXNlIHRoZSBmaXJzdCBvbmUuXCIpXHJcbiAgICAgICAgLmFkZERyb3Bkb3duKChkZCkgPT4ge1xyXG4gICAgICAgICAgZGQuYWRkT3B0aW9uKFwiXCIsIFwiRmlyc3QgY3VzdG9tLWFwaSBkZXN0aW5hdGlvblwiKTtcclxuICAgICAgICAgIGZvciAoY29uc3QgZCBvZiBjdXN0b21BcGlEZXN0cykge1xyXG4gICAgICAgICAgICBkZC5hZGRPcHRpb24oZC5uYW1lLCBkLm5hbWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZGQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbilcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9QdWJsaXNoRGVzdGluYXRpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyogXHUyNTAwXHUyNTAwIFN1cHBvcnQgc2VjdGlvbiBcdTI1MDBcdTI1MDAgKi9cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiU3VwcG9ydFwiKS5zZXRIZWFkaW5nKCk7XHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBcIlRoaXMgcGx1Z2luIGlzIGZyZWUgYW5kIG9wZW4gc291cmNlLiBJZiBpdCBzYXZlcyB5b3UgdGltZSwgY29uc2lkZXIgc3VwcG9ydGluZyBpdHMgZGV2ZWxvcG1lbnQuXCIsXHJcbiAgICAgIGNsczogXCJzZXR0aW5nLWl0ZW0tZGVzY3JpcHRpb25cIixcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkJ1eSBtZSBhIGNvZmZlZVwiKVxyXG4gICAgICAuc2V0RGVzYyhcIk9uZS10aW1lIG9yIHJlY3VycmluZyBzdXBwb3J0XCIpXHJcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlN1cHBvcnRcIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cub3BlbihcImh0dHBzOi8vYnV5bWVhY29mZmVlLmNvbS90aGVvZmZpY2FsZG1cIiwgXCJfYmxhbmtcIik7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiR2l0SHViIHNwb25zb3JzXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiTW9udGhseSBzcG9uc29yc2hpcCB0aHJvdWdoIEdpdEh1YlwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJTcG9uc29yXCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2dpdGh1Yi5jb20vc3BvbnNvcnMvVGhlT2ZmaWNpYWxETVwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJBbGwgZnVuZGluZyBvcHRpb25zXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiZGV2aW5tYXJzaGFsbC5pbmZvL2Z1bmRcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiVmlld1wiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cHM6Ly9kZXZpbm1hcnNoYWxsLmluZm8vZnVuZFwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBQT1NTRSBTdGF0dXMgTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG50eXBlIFN5bmRpY2F0aW9uRW50cnkgPSB7IHVybD86IHN0cmluZzsgbmFtZT86IHN0cmluZyB9O1xyXG5cclxuY2xhc3MgUG9zc2VTdGF0dXNNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICBwcml2YXRlIHRpdGxlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBzeW5kaWNhdGlvbjogdW5rbm93bjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHRpdGxlOiBzdHJpbmcsIHN5bmRpY2F0aW9uOiB1bmtub3duKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gICAgdGhpcy50aXRsZSA9IHRpdGxlO1xyXG4gICAgdGhpcy5zeW5kaWNhdGlvbiA9IHN5bmRpY2F0aW9uO1xyXG4gIH1cclxuXHJcbiAgb25PcGVuKCkge1xyXG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoXCJwb3NzZS1wdWJsaXNoZXItY29uZmlybS1tb2RhbFwiKTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJQb3NzZSBzdGF0dXNcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBgTm90ZTogJHtTdHJpbmcodGhpcy50aXRsZSl9YCB9KTtcclxuXHJcbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuaXNBcnJheSh0aGlzLnN5bmRpY2F0aW9uKVxyXG4gICAgICA/ICh0aGlzLnN5bmRpY2F0aW9uIGFzIFN5bmRpY2F0aW9uRW50cnlbXSlcclxuICAgICAgOiBbXTtcclxuXHJcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgICAgdGV4dDogXCJUaGlzIG5vdGUgaGFzIG5vdCBiZWVuIHN5bmRpY2F0ZWQgdG8gYW55IGRlc3RpbmF0aW9uIHlldC5cIixcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJzdHJvbmdcIiwgeyB0ZXh0OiBgU3luZGljYXRlZCB0byAke2VudHJpZXMubGVuZ3RofSBkZXN0aW5hdGlvbihzKTpgIH0pO1xyXG4gICAgICBjb25zdCBsaXN0ID0gY29udGVudEVsLmNyZWF0ZUVsKFwidWxcIik7XHJcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgICAgIGNvbnN0IGxpID0gbGlzdC5jcmVhdGVFbChcImxpXCIpO1xyXG4gICAgICAgIGlmIChlbnRyeS51cmwpIHtcclxuICAgICAgICAgIGNvbnN0IGEgPSBsaS5jcmVhdGVFbChcImFcIiwgeyB0ZXh0OiBlbnRyeS5uYW1lIHx8IGVudHJ5LnVybCB9KTtcclxuICAgICAgICAgIGEuaHJlZiA9IGVudHJ5LnVybDtcclxuICAgICAgICAgIGEudGFyZ2V0ID0gXCJfYmxhbmtcIjtcclxuICAgICAgICAgIGEucmVsID0gXCJub29wZW5lclwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsaS5zZXRUZXh0KGVudHJ5Lm5hbWUgfHwgXCJVbmtub3duXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnMgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm1vZGFsLWJ1dHRvbi1jb250YWluZXJcIiB9KTtcclxuICAgIGNvbnN0IGNsb3NlQnRuID0gYnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiQ2xvc2VcIiB9KTtcclxuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpIHtcclxuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtB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
