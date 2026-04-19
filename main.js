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
    const slug = frontmatter.slug || toSlug(title);
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
        body: JSON.stringify(payload)
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
        body: JSON.stringify({ article })
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
        body: JSON.stringify({ status: statusText, visibility: "public" })
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
        })
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
        })
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
              headers: { "x-publish-key": destination.apiKey }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiIHwgXCJtZWRpdW1cIiB8IFwicmVkZGl0XCIgfCBcInRocmVhZHNcIiB8IFwibGlua2VkaW5cIiB8IFwiZWNlbmN5XCI7XHJcblxyXG5pbnRlcmZhY2UgRGVzdGluYXRpb24ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB0eXBlOiBEZXN0aW5hdGlvblR5cGU7XHJcbiAgLy8gY3VzdG9tLWFwaVxyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG4gIC8vIG1hc3RvZG9uXHJcbiAgaW5zdGFuY2VVcmw/OiBzdHJpbmc7XHJcbiAgYWNjZXNzVG9rZW4/OiBzdHJpbmc7XHJcbiAgLy8gYmx1ZXNreVxyXG4gIGhhbmRsZT86IHN0cmluZztcclxuICBhcHBQYXNzd29yZD86IHN0cmluZztcclxuICAvLyBtZWRpdW1cclxuICBtZWRpdW1Ub2tlbj86IHN0cmluZztcclxuICBtZWRpdW1BdXRob3JJZD86IHN0cmluZztcclxuICAvLyByZWRkaXRcclxuICByZWRkaXRDbGllbnRJZD86IHN0cmluZztcclxuICByZWRkaXRDbGllbnRTZWNyZXQ/OiBzdHJpbmc7XHJcbiAgcmVkZGl0UmVmcmVzaFRva2VuPzogc3RyaW5nO1xyXG4gIHJlZGRpdFVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHJlZGRpdERlZmF1bHRTdWJyZWRkaXQ/OiBzdHJpbmc7XHJcbiAgLy8gdGhyZWFkc1xyXG4gIHRocmVhZHNVc2VySWQ/OiBzdHJpbmc7XHJcbiAgdGhyZWFkc0FjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGxpbmtlZGluXHJcbiAgbGlua2VkaW5BY2Nlc3NUb2tlbj86IHN0cmluZztcclxuICBsaW5rZWRpblBlcnNvblVybj86IHN0cmluZztcclxuICAvLyBlY2VuY3kgLyBoaXZlXHJcbiAgaGl2ZVVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIGhpdmVQb3N0aW5nS2V5Pzogc3RyaW5nO1xyXG4gIGhpdmVDb21tdW5pdHk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxuICBhdXRvUHVibGlzaE9uU2F2ZTogYm9vbGVhbjtcclxuICBhdXRvUHVibGlzaERlc3RpbmF0aW9uOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSB7XHJcbiAgZGVzdGluYXRpb25zOiBbXSxcclxuICBjYW5vbmljYWxCYXNlVXJsOiBcIlwiLFxyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIixcclxuICBjb25maXJtQmVmb3JlUHVibGlzaDogdHJ1ZSxcclxuICBzdHJpcE9ic2lkaWFuU3ludGF4OiB0cnVlLFxyXG4gIGF1dG9QdWJsaXNoT25TYXZlOiBmYWxzZSxcclxuICBhdXRvUHVibGlzaERlc3RpbmF0aW9uOiBcIlwiLFxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEZyb250bWF0dGVyIHtcclxuICB0aXRsZT86IHN0cmluZztcclxuICBzbHVnPzogc3RyaW5nO1xyXG4gIGV4Y2VycHQ/OiBzdHJpbmc7XHJcbiAgdHlwZT86IHN0cmluZztcclxuICBzdGF0dXM/OiBzdHJpbmc7XHJcbiAgdGFncz86IHN0cmluZ1tdO1xyXG4gIHBpbGxhcj86IHN0cmluZztcclxuICBjb3ZlckltYWdlPzogc3RyaW5nO1xyXG4gIGZlYXR1cmVkPzogYm9vbGVhbjtcclxuICBtZXRhVGl0bGU/OiBzdHJpbmc7XHJcbiAgbWV0YURlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIG9nSW1hZ2U/OiBzdHJpbmc7XHJcbiAgdmlkZW9Vcmw/OiBzdHJpbmc7XHJcbiAgY2Fub25pY2FsVXJsPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogRXh0cmFjdCBib2R5IGNvbnRlbnQgYmVsb3cgdGhlIFlBTUwgZnJvbnRtYXR0ZXIgZmVuY2UuICovXHJcbmZ1bmN0aW9uIGV4dHJhY3RCb2R5KGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9eLS0tXFxyP1xcbltcXHNcXFNdKj9cXHI/XFxuLS0tXFxyP1xcbj8oW1xcc1xcU10qKSQvKTtcclxuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50cmltKCkgOiBjb250ZW50O1xyXG59XHJcblxyXG4vKipcclxuICogQnVpbGQgYSBGcm9udG1hdHRlciBvYmplY3QgZnJvbSBPYnNpZGlhbidzIGNhY2hlZCBtZXRhZGF0YS5cclxuICogRmFsbHMgYmFjayBncmFjZWZ1bGx5IHdoZW4gZmllbGRzIGFyZSBhYnNlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZEZyb250bWF0dGVyKGNhY2hlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCk6IEZyb250bWF0dGVyIHtcclxuICBpZiAoIWNhY2hlKSByZXR1cm4ge307XHJcbiAgY29uc3QgZm06IEZyb250bWF0dGVyID0ge307XHJcblxyXG4gIGlmICh0eXBlb2YgY2FjaGUudGl0bGUgPT09IFwic3RyaW5nXCIpIGZtLnRpdGxlID0gY2FjaGUudGl0bGU7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5zbHVnID09PSBcInN0cmluZ1wiKSBmbS5zbHVnID0gY2FjaGUuc2x1ZztcclxuICBpZiAodHlwZW9mIGNhY2hlLmV4Y2VycHQgPT09IFwic3RyaW5nXCIpIGZtLmV4Y2VycHQgPSBjYWNoZS5leGNlcnB0O1xyXG4gIGlmICh0eXBlb2YgY2FjaGUudHlwZSA9PT0gXCJzdHJpbmdcIikgZm0udHlwZSA9IGNhY2hlLnR5cGU7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5zdGF0dXMgPT09IFwic3RyaW5nXCIpIGZtLnN0YXR1cyA9IGNhY2hlLnN0YXR1cztcclxuICBpZiAodHlwZW9mIGNhY2hlLnBpbGxhciA9PT0gXCJzdHJpbmdcIikgZm0ucGlsbGFyID0gY2FjaGUucGlsbGFyO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuY292ZXJJbWFnZSA9PT0gXCJzdHJpbmdcIikgZm0uY292ZXJJbWFnZSA9IGNhY2hlLmNvdmVySW1hZ2U7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5tZXRhVGl0bGUgPT09IFwic3RyaW5nXCIpIGZtLm1ldGFUaXRsZSA9IGNhY2hlLm1ldGFUaXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFEZXNjcmlwdGlvbiA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YURlc2NyaXB0aW9uID0gY2FjaGUubWV0YURlc2NyaXB0aW9uO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUub2dJbWFnZSA9PT0gXCJzdHJpbmdcIikgZm0ub2dJbWFnZSA9IGNhY2hlLm9nSW1hZ2U7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS52aWRlb1VybCA9PT0gXCJzdHJpbmdcIikgZm0udmlkZW9VcmwgPSBjYWNoZS52aWRlb1VybDtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5mZWF0dXJlZCA9PT0gXCJib29sZWFuXCIpIGZtLmZlYXR1cmVkID0gY2FjaGUuZmVhdHVyZWQ7XHJcbiAgZWxzZSBpZiAoY2FjaGUuZmVhdHVyZWQgPT09IFwidHJ1ZVwiKSBmbS5mZWF0dXJlZCA9IHRydWU7XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGNhY2hlLnRhZ3MpKSB7XHJcbiAgICBmbS50YWdzID0gY2FjaGUudGFncy5tYXAoKHQ6IHVua25vd24pID0+IFN0cmluZyh0KS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBjYWNoZS50YWdzID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICBmbS50YWdzID0gY2FjaGUudGFnc1xyXG4gICAgICAucmVwbGFjZSgvXlxcW3xcXF0kL2csIFwiXCIpXHJcbiAgICAgIC5zcGxpdChcIixcIilcclxuICAgICAgLm1hcCgodDogc3RyaW5nKSA9PiB0LnRyaW0oKSlcclxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgY2FjaGUuY2Fub25pY2FsVXJsID09PSBcInN0cmluZ1wiKSBmbS5jYW5vbmljYWxVcmwgPSBjYWNoZS5jYW5vbmljYWxVcmw7XHJcblxyXG4gIHJldHVybiBmbTtcclxufVxyXG5cclxuLyoqIENvbnZlcnQgYSB0aXRsZSBzdHJpbmcgdG8gYSBVUkwtc2FmZSBzbHVnLCBoYW5kbGluZyBkaWFjcml0aWNzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9TbHVnKHRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiB0aXRsZVxyXG4gICAgLm5vcm1hbGl6ZShcIk5GRFwiKVxyXG4gICAgLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpXHJcbiAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgXCItXCIpXHJcbiAgICAucmVwbGFjZSgvXi18LSQvZywgXCJcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQcmUtcHJvY2VzcyBPYnNpZGlhbi1zcGVjaWZpYyBtYXJrZG93biBiZWZvcmUgc2VuZGluZyB0byB0aGUgYmxvZyBBUEkuXHJcbiAqIFN0cmlwcyB3aWtpLWxpbmtzLCBlbWJlZHMsIGNvbW1lbnRzLCBhbmQgZGF0YXZpZXcgYmxvY2tzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHByZXByb2Nlc3NDb250ZW50KGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgLy8gUmVtb3ZlIE9ic2lkaWFuIGNvbW1lbnRzOiAlJS4uLiUlXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvJSVbXFxzXFxTXSo/JSUvZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rIGVtYmVkczogIVtbZmlsZV1dIFx1MjE5MiAocmVtb3ZlZClcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8hXFxbXFxbKFteXFxdXSspXFxdXFxdL2csIFwiXCIpO1xyXG5cclxuICAvLyBDb252ZXJ0IHdpa2ktbGlua3Mgd2l0aCBhbGlhczogW1t0YXJnZXR8YWxpYXNdXSBcdTIxOTIgYWxpYXNcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9cXFtcXFsoW15cXF18XSspXFx8KFteXFxdXSspXFxdXFxdL2csIFwiJDJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRob3V0IGFsaWFzOiBbW3RhcmdldF1dIFx1MjE5MiB0YXJnZXRcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9cXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCIkMVwiKTtcclxuXHJcbiAgLy8gUmVtb3ZlIGRhdGF2aWV3IGNvZGUgYmxvY2tzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdbXFxzXFxTXSo/YGBgL2csIFwiXCIpO1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL2BgYGRhdGF2aWV3anNbXFxzXFxTXSo/YGBgL2csIFwiXCIpO1xyXG5cclxuICAvLyBDbGVhbiB1cCBleGNlc3MgYmxhbmsgbGluZXMgbGVmdCBieSByZW1vdmFsc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XHJcblxyXG4gIHJldHVybiBib2R5LnRyaW0oKTtcclxufVxyXG5cclxuLyoqIEVzY2FwZSBIVE1MIHNwZWNpYWwgY2hhcmFjdGVycy4gKi9cclxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHN0clxyXG4gICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxyXG4gICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcclxuICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYmFzaWMgTWFya2Rvd24gdG8gSFRNTC4gSGFuZGxlcyBoZWFkaW5ncywgYm9sZCwgaXRhbGljLCBpbmxpbmUgY29kZSxcclxuICogbGlua3MsIGltYWdlcywgbGlzdHMsIGJsb2NrcXVvdGVzLCBob3Jpem9udGFsIHJ1bGVzLCBmZW5jZWQgY29kZSBibG9ja3MsIGFuZCBwYXJhZ3JhcGhzLlxyXG4gKiBObyBleHRlcm5hbCBkZXBlbmRlbmNpZXMgXHUyMDE0IHJlZ2V4IG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFya2Rvd25Ub0h0bWwobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgbGV0IGh0bWwgPSBtYXJrZG93bjtcclxuXHJcbiAgLy8gRmVuY2VkIGNvZGUgYmxvY2tzIChwcm9jZXNzIGZpcnN0IHRvIGF2b2lkIG1hbmdsaW5nIHRoZWlyIGNvbnRlbnRzKVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL2BgYChcXHcqKVxcbihbXFxzXFxTXSo/KWBgYC9nLCAoXzogc3RyaW5nLCBsYW5nOiBzdHJpbmcsIGNvZGU6IHN0cmluZykgPT5cclxuICAgIGA8cHJlPjxjb2RlJHtsYW5nID8gYCBjbGFzcz1cImxhbmd1YWdlLSR7bGFuZ31cImAgOiBcIlwifT4ke2VzY2FwZUh0bWwoY29kZS50cmltKCkpfTwvY29kZT48L3ByZT5gXHJcbiAgKTtcclxuXHJcbiAgLy8gSGVhZGluZ3NcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjIyMjICguKykkL2dtLCBcIjxoNj4kMTwvaDY+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjIyAoLispJC9nbSwgXCI8aDU+JDE8L2g1PlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjIyAoLispJC9nbSwgXCI8aDQ+JDE8L2g0PlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjICguKykkL2dtLCBcIjxoMz4kMTwvaDM+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyAoLispJC9nbSwgXCI8aDI+JDE8L2gyPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyAoLispJC9nbSwgXCI8aDE+JDE8L2gxPlwiKTtcclxuXHJcbiAgLy8gSG9yaXpvbnRhbCBydWxlc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15bLSpfXXszLH1cXHMqJC9nbSwgXCI8aHI+XCIpO1xyXG5cclxuICAvLyBCbG9ja3F1b3Rlc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14+ICguKykkL2dtLCBcIjxibG9ja3F1b3RlPiQxPC9ibG9ja3F1b3RlPlwiKTtcclxuXHJcbiAgLy8gQm9sZCArIGl0YWxpYyAob3JkZXI6IHRyaXBsZSBcdTIxOTIgZG91YmxlIFx1MjE5MiBzaW5nbGUpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFwqXFwqXFwqKC4rPylcXCpcXCpcXCovZywgXCI8c3Ryb25nPjxlbT4kMTwvZW0+PC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcKlxcKiguKz8pXFwqXFwqL2csIFwiPHN0cm9uZz4kMTwvc3Ryb25nPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXCooLis/KVxcKi9nLCBcIjxlbT4kMTwvZW0+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL19fXyguKz8pX19fL2csIFwiPHN0cm9uZz48ZW0+JDE8L2VtPjwvc3Ryb25nPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9fXyguKz8pX18vZywgXCI8c3Ryb25nPiQxPC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL18oLis/KV8vZywgXCI8ZW0+JDE8L2VtPlwiKTtcclxuXHJcbiAgLy8gSW5saW5lIGNvZGVcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9gKFteYF0rKWAvZywgXCI8Y29kZT4kMTwvY29kZT5cIik7XHJcblxyXG4gIC8vIEltYWdlcyAoYmVmb3JlIGxpbmtzKVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2csICc8aW1nIHNyYz1cIiQyXCIgYWx0PVwiJDFcIj4nKTtcclxuXHJcbiAgLy8gTGlua3NcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXFsoW15cXF1dKylcXF1cXCgoW14pXSspXFwpL2csICc8YSBocmVmPVwiJDJcIj4kMTwvYT4nKTtcclxuXHJcbiAgLy8gVW5vcmRlcmVkIGxpc3QgaXRlbXNcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eWy0qK10gKC4rKSQvZ20sIFwiPGxpPiQxPC9saT5cIik7XHJcblxyXG4gIC8vIE9yZGVyZWQgbGlzdCBpdGVtc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXGQrXFwuICguKykkL2dtLCBcIjxsaT4kMTwvbGk+XCIpO1xyXG5cclxuICAvLyBXcmFwIDxsaT4gcnVucyBpbiA8dWw+XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKDxsaT5bXFxzXFxTXSo/PFxcL2xpPlxcbj8pKy9nLCAobWF0Y2gpID0+IGA8dWw+JHttYXRjaH08L3VsPmApO1xyXG5cclxuICAvLyBQYXJhZ3JhcGhzIChkb3VibGUgbmV3bGluZSBcdTIxOTIgcGFyYWdyYXBoIGJsb2NrKVxyXG4gIGh0bWwgPSBodG1sXHJcbiAgICAuc3BsaXQoL1xcblxcbisvKVxyXG4gICAgLm1hcCgoYmxvY2spID0+IHtcclxuICAgICAgY29uc3QgdHJpbW1lZCA9IGJsb2NrLnRyaW0oKTtcclxuICAgICAgaWYgKCF0cmltbWVkKSByZXR1cm4gXCJcIjtcclxuICAgICAgaWYgKC9ePChoWzEtNl18dWx8b2x8bGl8YmxvY2txdW90ZXxwcmV8aHIpLy50ZXN0KHRyaW1tZWQpKSByZXR1cm4gdHJpbW1lZDtcclxuICAgICAgcmV0dXJuIGA8cD4ke3RyaW1tZWQucmVwbGFjZSgvXFxuL2csIFwiPGJyPlwiKX08L3A+YDtcclxuICAgIH0pXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAuam9pbihcIlxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGh0bWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdHJpcCBhbGwgTWFya2Rvd24gc3ludGF4IHRvIHByb2R1Y2UgcGxhaW4gdGV4dCBzdWl0YWJsZSBmb3JcclxuICogY2hhcmFjdGVyLWxpbWl0ZWQgcGxhdGZvcm1zIChUaHJlYWRzLCBNYXN0b2RvbiBwcmV2aWV3LCBldGMuKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93blRvUGxhaW5UZXh0KG1hcmtkb3duOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGxldCB0ZXh0ID0gbWFya2Rvd247XHJcbiAgLy8gRmVuY2VkIGNvZGUgYmxvY2tzIFx1MjE5MiBrZWVwIGNvbnRlbnRcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9gYGBcXHcqXFxuKFtcXHNcXFNdKj8pYGBgL2csIFwiJDFcIik7XHJcbiAgLy8gUmVtb3ZlIGhlYWRpbmcgbWFya2Vyc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14jezEsNn0gL2dtLCBcIlwiKTtcclxuICAvLyBCb2xkL2l0YWxpYyBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwqezEsM318X3sxLDN9L2csIFwiXCIpO1xyXG4gIC8vIElubGluZSBjb2RlIFx1MjE5MiB1bndyYXBcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9gKFteYF0rKWAvZywgXCIkMVwiKTtcclxuICAvLyBJbWFnZXMgXHUyMTkyIGFsdCB0ZXh0XHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKFteKV0rXFwpL2csIFwiJDFcIik7XHJcbiAgLy8gTGlua3MgXHUyMTkyIGxpbmsgdGV4dFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKFteKV0rXFwpL2csIFwiJDFcIik7XHJcbiAgLy8gQmxvY2txdW90ZXNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9ePiAvZ20sIFwiXCIpO1xyXG4gIC8vIExpc3QgbWFya2Vyc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL15bLSorXFxkLl0gL2dtLCBcIlwiKTtcclxuICAvLyBIb3Jpem9udGFsIHJ1bGVzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlstKl9dezMsfVxccyokL2dtLCBcIlwiKTtcclxuICAvLyBDb2xsYXBzZSBtdWx0aXBsZSBibGFuayBsaW5lc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XHJcbiAgcmV0dXJuIHRleHQudHJpbSgpO1xyXG59XHJcblxyXG5jb25zdCBGUk9OVE1BVFRFUl9URU1QTEFURSA9IGAtLS1cclxudGl0bGU6IFxyXG5zbHVnOiBcclxuZXhjZXJwdDogXHJcbnR5cGU6IGJsb2dcclxuc3RhdHVzOiBkcmFmdFxyXG50YWdzOiBbXVxyXG5waWxsYXI6IFxyXG5jb3ZlckltYWdlOiBcclxuZmVhdHVyZWQ6IGZhbHNlXHJcbm1ldGFUaXRsZTogXHJcbm1ldGFEZXNjcmlwdGlvbjogXHJcbm9nSW1hZ2U6IFxyXG52aWRlb1VybDogXHJcbmNhbm9uaWNhbFVybDogXHJcbnN5bmRpY2F0aW9uOiBbXVxyXG4tLS1cclxuXHJcbmA7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3NzZVB1Ymxpc2hlclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcbiAgc2V0dGluZ3M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4gIHByaXZhdGUgc3RhdHVzQmFyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBhdXRvUHVibGlzaFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgYXV0b1B1Ymxpc2hSZWdpc3RlcmVkID0gZmFsc2U7XHJcblxyXG4gIGFzeW5jIG9ubG9hZCgpIHtcclxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcbiAgICB0aGlzLm1pZ3JhdGVTZXR0aW5ncygpO1xyXG5cclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcclxuXHJcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJzZW5kXCIsIFwiUG9zc2UgcHVibGlzaFwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgcHVibGlzaFwiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2gtZHJhZnRcIixcclxuICAgICAgbmFtZTogXCJQb3NzZSBwdWJsaXNoIGFzIGRyYWZ0XCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcImRyYWZ0XCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1saXZlXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgcHVibGlzaCBsaXZlXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcInB1Ymxpc2hlZFwiKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLWluc2VydC10ZW1wbGF0ZVwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIGluc2VydCBmcm9udG1hdHRlciB0ZW1wbGF0ZVwiLFxyXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcclxuICAgICAgICBpZiAoY29udGVudC50cmltU3RhcnQoKS5zdGFydHNXaXRoKFwiLS0tXCIpKSB7XHJcbiAgICAgICAgICBuZXcgTm90aWNlKFwiRnJvbnRtYXR0ZXIgYWxyZWFkeSBleGlzdHMgaW4gdGhpcyBub3RlXCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDAsIDApO1xyXG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoRlJPTlRNQVRURVJfVEVNUExBVEUsIHsgbGluZTogMCwgY2g6IDAgfSk7XHJcbiAgICAgICAgLy8gUGxhY2UgY3Vyc29yIG9uIHRoZSB0aXRsZSBsaW5lXHJcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcigxLCA3KTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXRvLWFsbFwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIHRvIGFsbCBkZXN0aW5hdGlvbnNcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VUb0FsbCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2Utc3RhdHVzXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2Ugc3RhdHVzIFx1MjAxNCB2aWV3IHN5bmRpY2F0aW9uXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBvc3NlU3RhdHVzKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBvc3NlUHVibGlzaGVyU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuICAgIHRoaXMucmVnaXN0ZXJBdXRvUHVibGlzaCgpO1xyXG4gIH1cclxuXHJcbiAgb251bmxvYWQoKSB7XHJcbiAgICB0aGlzLnN0YXR1c0JhckVsID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmF1dG9QdWJsaXNoVGltZXIpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b1B1Ymxpc2hUaW1lcik7XHJcbiAgICAgIHRoaXMuYXV0b1B1Ymxpc2hUaW1lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWdpc3RlciAob3Igc2tpcCkgdGhlIHZhdWx0ICdtb2RpZnknIGV2ZW50IGxpc3RlbmVyIGZvciBhdXRvLXB1Ymxpc2guXHJcbiAgICogT25seSBwdWJsaXNoZXMgZmlsZXMgdGhhdCBoYXZlIGBzdGF0dXM6IHB1Ymxpc2hlZGAgaW4gZnJvbnRtYXR0ZXIgdG9cclxuICAgKiBhdm9pZCBhY2NpZGVudGFsbHkgcHVzaGluZyBkcmFmdHMuIERlYm91bmNlcyBzYXZlcyBieSAzIHNlY29uZHMgc29cclxuICAgKiByYXBpZCBrZXlzdHJva2VzIGRvbid0IHRyaWdnZXIgbXVsdGlwbGUgQVBJIGNhbGxzLlxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyQXV0b1B1Ymxpc2goKSB7XHJcbiAgICBpZiAodGhpcy5hdXRvUHVibGlzaFJlZ2lzdGVyZWQpIHJldHVybjtcclxuICAgIHRoaXMuYXV0b1B1Ymxpc2hSZWdpc3RlcmVkID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcbiAgICAgIHRoaXMuYXBwLnZhdWx0Lm9uKFwibW9kaWZ5XCIsIChmaWxlKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzLmF1dG9QdWJsaXNoT25TYXZlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gXCJtZFwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE9ubHkgYXV0by1wdWJsaXNoIGlmIHRoZSBub3RlIGhhcyBzdGF0dXM6IHB1Ymxpc2hlZFxyXG4gICAgICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XHJcbiAgICAgICAgY29uc3QgZm0gPSBjYWNoZT8uZnJvbnRtYXR0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKCFmbSB8fCBmbS5zdGF0dXMgIT09IFwicHVibGlzaGVkXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRGVib3VuY2UgXHUyMDE0IHdhaXQgM3MgYWZ0ZXIgbGFzdCBzYXZlIGJlZm9yZSBwdWJsaXNoaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1B1Ymxpc2hUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b1B1Ymxpc2hUaW1lcik7XHJcbiAgICAgICAgdGhpcy5hdXRvUHVibGlzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF1dG9QdWJsaXNoVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgdm9pZCB0aGlzLmF1dG9QdWJsaXNoRmlsZShmaWxlKTtcclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgICAgfSksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqIEF1dG8tcHVibGlzaCBhIGZpbGUgdG8gdGhlIGNvbmZpZ3VyZWQgZGVzdGluYXRpb24gKG5vIGNvbmZpcm1hdGlvbiBtb2RhbCkuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBhdXRvUHVibGlzaEZpbGUoZmlsZTogVEZpbGUpIHtcclxuICAgIGNvbnN0IGRlc3QgPSB0aGlzLnJlc29sdmVBdXRvUHVibGlzaERlc3RpbmF0aW9uKCk7XHJcbiAgICBpZiAoIWRlc3QpIHJldHVybjtcclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3QpKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKGZpbGUpO1xyXG4gICAgLy8gU2tpcCBmaWxlcyB3aXRob3V0IGEgdGl0bGUgKGxpa2VseSBub3QgcmVhbCBjb250ZW50KVxyXG4gICAgaWYgKCFwYXlsb2FkLnRpdGxlIHx8IHBheWxvYWQudGl0bGUgPT09IFwiVW50aXRsZWRcIikgcmV0dXJuO1xyXG5cclxuICAgIGF3YWl0IHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdCwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgfVxyXG5cclxuICAvKiogUmVzb2x2ZSB3aGljaCBkZXN0aW5hdGlvbiB0byB1c2UgZm9yIGF1dG8tcHVibGlzaC4gKi9cclxuICBwcml2YXRlIHJlc29sdmVBdXRvUHVibGlzaERlc3RpbmF0aW9uKCk6IERlc3RpbmF0aW9uIHwgbnVsbCB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucywgYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbiB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAvLyBJZiBhIHNwZWNpZmljIGRlc3RpbmF0aW9uIGlzIG5hbWVkLCBmaW5kIGl0XHJcbiAgICBpZiAoYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbikge1xyXG4gICAgICBjb25zdCBtYXRjaCA9IGRlc3RpbmF0aW9ucy5maW5kKChkKSA9PiBkLm5hbWUgPT09IGF1dG9QdWJsaXNoRGVzdGluYXRpb24pO1xyXG4gICAgICBpZiAobWF0Y2gpIHJldHVybiBtYXRjaDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGYWxsYmFjazogZmlyc3QgY3VzdG9tLWFwaSBkZXN0aW5hdGlvblxyXG4gICAgcmV0dXJuIGRlc3RpbmF0aW9ucy5maW5kKChkKSA9PiBkLnR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgLy8gTWlncmF0ZSB2MSBzaW5nbGUtc2l0ZSBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIixcclxuICAgICAgICAgIHVybDogcmF3LnNpdGVVcmwsXHJcbiAgICAgICAgICBhcGlLZXk6IChyYXcuYXBpS2V5IGFzIHN0cmluZykgfHwgXCJcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVVcmw7XHJcbiAgICAgIGRlbGV0ZSByYXcuYXBpS2V5O1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBNaWdyYXRlIHNpdGVzIFx1MjE5MiBkZXN0aW5hdGlvbnMga2V5XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcuc2l0ZXMpICYmICFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IHJhdy5zaXRlcyBhcyBEZXN0aW5hdGlvbltdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVzO1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpIGFzIFBhcnRpYWw8UG9zc2VQdWJsaXNoZXJTZXR0aW5ncz4pO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGlja1NpdGVBbmRQdWJsaXNoKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdm9pZCB0aGlzLnByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uc1swXSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBuZXcgU2l0ZVBpY2tlck1vZGFsKHRoaXMuYXBwLCBkZXN0aW5hdGlvbnMsIChkZXN0KSA9PiB7XHJcbiAgICAgIHZvaWQgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0LCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICB9KS5vcGVuKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZCB0aGUgcHVibGlzaCBwYXlsb2FkIGZyb20gdGhlIGFjdGl2ZSBmaWxlIGFuZCBzZXR0aW5ncy5cclxuICAgKiBTaGFyZWQgYnkgcHJlcGFyZVB1Ymxpc2goKSBhbmQgcG9zc2VUb0FsbCgpIHRvIGF2b2lkIGR1cGxpY2F0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgYnVpbGRQYXlsb2FkKFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgICBvdmVycmlkZVN0YXR1cz86IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCIsXHJcbiAgKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xyXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcclxuICAgIGNvbnN0IGZyb250bWF0dGVyID0gYnVpbGRGcm9udG1hdHRlcihmaWxlQ2FjaGU/LmZyb250bWF0dGVyKTtcclxuICAgIGNvbnN0IGJvZHkgPSBleHRyYWN0Qm9keShjb250ZW50KTtcclxuICAgIGNvbnN0IHByb2Nlc3NlZEJvZHkgPSB0aGlzLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXggPyBwcmVwcm9jZXNzQ29udGVudChib2R5KSA6IGJvZHk7XHJcbiAgICBjb25zdCB0aXRsZSA9IGZyb250bWF0dGVyLnRpdGxlIHx8IGZpbGUuYmFzZW5hbWUgfHwgXCJVbnRpdGxlZFwiO1xyXG4gICAgY29uc3Qgc2x1ZyA9IGZyb250bWF0dGVyLnNsdWcgfHwgdG9TbHVnKHRpdGxlKTtcclxuICAgIGNvbnN0IHJhd1N0YXR1cyA9IG92ZXJyaWRlU3RhdHVzIHx8IGZyb250bWF0dGVyLnN0YXR1cyB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRTdGF0dXM7XHJcbiAgICAvLyBOb3JtYWxpemUgY29tbW9uIGFsaWFzZXMgXHUyMTkyIGNhbm9uaWNhbCBBUEkgdmFsdWVzXHJcbiAgICBjb25zdCBzdGF0dXMgPVxyXG4gICAgICByYXdTdGF0dXMgPT09IFwicHVibGlzaFwiID8gXCJwdWJsaXNoZWRcIiA6XHJcbiAgICAgIHJhd1N0YXR1cyA9PT0gXCJhcmNoaXZlXCIgPyBcImFyY2hpdmVkXCIgOlxyXG4gICAgICAoW1wiZHJhZnRcIiwgXCJwdWJsaXNoZWRcIiwgXCJhcmNoaXZlZFwiXSBhcyBzdHJpbmdbXSkuaW5jbHVkZXMocmF3U3RhdHVzKSA/IHJhd1N0YXR1cyA6XHJcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVmYXVsdFN0YXR1cztcclxuICAgIGNvbnN0IHBvc3RUeXBlID0gZnJvbnRtYXR0ZXIudHlwZSB8fCBcImJsb2dcIjtcclxuICAgIC8vIFVzZSBmcm9udG1hdHRlciBjYW5vbmljYWxVcmwgb3ZlcnJpZGUgaWYgcHJlc2VudDsgb3RoZXJ3aXNlIGF1dG8tZ2VuZXJhdGVcclxuICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9XHJcbiAgICAgIGZyb250bWF0dGVyLmNhbm9uaWNhbFVybCB8fFxyXG4gICAgICAodGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsXHJcbiAgICAgICAgPyBgJHt0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3Bvc3RUeXBlfS8ke3NsdWd9YFxyXG4gICAgICAgIDogXCJcIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgc2x1ZyxcclxuICAgICAgYm9keTogcHJvY2Vzc2VkQm9keSxcclxuICAgICAgZXhjZXJwdDogZnJvbnRtYXR0ZXIuZXhjZXJwdCB8fCBcIlwiLFxyXG4gICAgICB0eXBlOiBwb3N0VHlwZSxcclxuICAgICAgc3RhdHVzLFxyXG4gICAgICB0YWdzOiBmcm9udG1hdHRlci50YWdzIHx8IFtdLFxyXG4gICAgICBwaWxsYXI6IGZyb250bWF0dGVyLnBpbGxhciB8fCBcIlwiLFxyXG4gICAgICBmZWF0dXJlZDogZnJvbnRtYXR0ZXIuZmVhdHVyZWQgfHwgZmFsc2UsXHJcbiAgICAgIGNvdmVySW1hZ2U6IGZyb250bWF0dGVyLmNvdmVySW1hZ2UgfHwgXCJcIixcclxuICAgICAgbWV0YVRpdGxlOiBmcm9udG1hdHRlci5tZXRhVGl0bGUgfHwgXCJcIixcclxuICAgICAgbWV0YURlc2NyaXB0aW9uOiBmcm9udG1hdHRlci5tZXRhRGVzY3JpcHRpb24gfHwgXCJcIixcclxuICAgICAgb2dJbWFnZTogZnJvbnRtYXR0ZXIub2dJbWFnZSB8fCBcIlwiLFxyXG4gICAgICB2aWRlb1VybDogZnJvbnRtYXR0ZXIudmlkZW9VcmwgfHwgXCJcIixcclxuICAgICAgLi4uKGNhbm9uaWNhbFVybCAmJiB7IGNhbm9uaWNhbFVybCB9KSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgb3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgTWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICBuZXcgTm90aWNlKGBDb25maWd1cmUgY3JlZGVudGlhbHMgZm9yIFwiJHtkZXN0aW5hdGlvbi5uYW1lfVwiIGluIHNldHRpbmdzYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5idWlsZFBheWxvYWQodmlldy5maWxlLCBvdmVycmlkZVN0YXR1cyk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2gpIHtcclxuICAgICAgbmV3IENvbmZpcm1QdWJsaXNoTW9kYWwodGhpcy5hcHAsIHBheWxvYWQsIGRlc3RpbmF0aW9uLCAoKSA9PiB7XHJcbiAgICAgICAgdm9pZCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUhKTtcclxuICAgICAgfSkub3BlbigpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdm9pZCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJvdXRlIGEgcHVibGlzaCB0byB0aGUgY29ycmVjdCBwbGF0Zm9ybSBoYW5kbGVyLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGVzdGluYXRpb24oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgc3dpdGNoIChkZXN0aW5hdGlvbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJkZXZ0b1wiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0RldlRvKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcIm1hc3RvZG9uXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvTWFzdG9kb24oZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwiYmx1ZXNreVwiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0JsdWVza3koZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwibWVkaXVtXCI6XHJcbiAgICAgIGNhc2UgXCJyZWRkaXRcIjpcclxuICAgICAgY2FzZSBcInRocmVhZHNcIjpcclxuICAgICAgY2FzZSBcImxpbmtlZGluXCI6XHJcbiAgICAgIGNhc2UgXCJlY2VuY3lcIjpcclxuICAgICAgICBuZXcgTm90aWNlKGAke2Rlc3RpbmF0aW9uLm5hbWV9OiAke2Rlc3RpbmF0aW9uLnR5cGV9IHN1cHBvcnQgaXMgY29taW5nIGluIGEgZnV0dXJlIHVwZGF0ZWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9DdXN0b21BcGkoZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gYSBjdXN0b20gL2FwaS9wdWJsaXNoIGVuZHBvaW50LiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQ3VzdG9tQXBpKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICBjb25zdCBzdGF0dXMgPSBwYXlsb2FkLnN0YXR1cyBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyICR7ZGVzdGluYXRpb24ubmFtZX0uLi5gKTtcclxuICAgICAgY29uc3QgdXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYXBpL3B1Ymxpc2hgO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJ4LXB1Ymxpc2gta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgbGV0IHZlcmIgPSBcIlBPU1NFZFwiO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBqc29uID0gcmVzcG9uc2UuanNvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgIGlmIChqc29uPy51cHNlcnRlZCkgdmVyYiA9IFwiVXBkYXRlZFwiO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBub24tSlNPTiAqLyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgJHt2ZXJifSBcIiR7dGl0bGV9XCIgb24gJHtkZXN0aW5hdGlvbi5uYW1lfSBhcyAke3N0YXR1c31gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKGRlc3RpbmF0aW9uLm5hbWUpO1xyXG4gICAgICAgIGxldCBzeW5kaWNhdGlvblVybDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBqc29uID0gcmVzcG9uc2UuanNvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgIHN5bmRpY2F0aW9uVXJsID0gKGpzb24/LnVybCBhcyBzdHJpbmcpIHx8XHJcbiAgICAgICAgICAgIGAke2Rlc3RpbmF0aW9uLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9LyR7cGF5bG9hZC5zbHVnIGFzIHN0cmluZ31gO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgc3luZGljYXRpb25VcmwgPSBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3BheWxvYWQuc2x1ZyBhcyBzdHJpbmd9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHN5bmRpY2F0aW9uVXJsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZXJyb3JEZXRhaWw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBlcnJvckRldGFpbCA9IChqc29uPy5lcnJvciBhcyBzdHJpbmcpIHx8IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0UgdG8gJHtkZXN0aW5hdGlvbi5uYW1lfSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRSBlcnJvciAoJHtkZXN0aW5hdGlvbi5uYW1lfSk6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gRGV2LnRvIHZpYSB0aGVpciBhcnRpY2xlcyBBUEkuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9EZXZUbyhcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBEZXYudG8gKCR7ZGVzdGluYXRpb24ubmFtZX0pLi4uYCk7XHJcbiAgICAgIGNvbnN0IHRhZ3MgPSAoKHBheWxvYWQudGFncyBhcyBzdHJpbmdbXSkgfHwgW10pXHJcbiAgICAgICAgLnNsaWNlKDAsIDQpXHJcbiAgICAgICAgLm1hcCgodCkgPT4gdC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05XS9nLCBcIlwiKSk7XHJcbiAgICAgIGNvbnN0IGFydGljbGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xyXG4gICAgICAgIHRpdGxlLFxyXG4gICAgICAgIGJvZHlfbWFya2Rvd246IHBheWxvYWQuYm9keSBhcyBzdHJpbmcsXHJcbiAgICAgICAgcHVibGlzaGVkOiBwYXlsb2FkLnN0YXR1cyA9PT0gXCJwdWJsaXNoZWRcIixcclxuICAgICAgICB0YWdzLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAocGF5bG9hZC5leGNlcnB0IGFzIHN0cmluZykgfHwgXCJcIixcclxuICAgICAgfTtcclxuICAgICAgaWYgKHBheWxvYWQuY2Fub25pY2FsVXJsKSBhcnRpY2xlLmNhbm9uaWNhbF91cmwgPSBwYXlsb2FkLmNhbm9uaWNhbFVybDtcclxuICAgICAgaWYgKHBheWxvYWQuY292ZXJJbWFnZSkgYXJ0aWNsZS5tYWluX2ltYWdlID0gcGF5bG9hZC5jb3ZlckltYWdlO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Rldi50by9hcGkvYXJ0aWNsZXNcIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJhcGkta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgYXJ0aWNsZSB9KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IGFydGljbGVVcmw6IHN0cmluZyA9IChqc29uPy51cmwgYXMgc3RyaW5nKSB8fCBcImh0dHBzOi8vZGV2LnRvXCI7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0VkIFwiJHt0aXRsZX1cIiB0byBEZXYudG9gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiRGV2LnRvXCIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBhcnRpY2xlVXJsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZXJyb3JEZXRhaWw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBlcnJvckRldGFpbCA9IChqc29uPy5lcnJvciBhcyBzdHJpbmcpIHx8IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgRGV2LnRvIFBPU1NFIGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYERldi50byBlcnJvcjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBNYXN0b2RvbiBieSBwb3N0aW5nIGEgc3RhdHVzIHdpdGggdGhlIGNhbm9uaWNhbCBsaW5rLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvTWFzdG9kb24oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgTWFzdG9kb24gKCR7ZGVzdGluYXRpb24ubmFtZX0pLi4uYCk7XHJcbiAgICAgIGNvbnN0IGV4Y2VycHQgPSAocGF5bG9hZC5leGNlcnB0IGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3QgY2Fub25pY2FsVXJsID0gKHBheWxvYWQuY2Fub25pY2FsVXJsIGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3Qgc3RhdHVzVGV4dCA9IFt0aXRsZSwgZXhjZXJwdCwgY2Fub25pY2FsVXJsXS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKTtcclxuICAgICAgY29uc3QgaW5zdGFuY2VVcmwgPSAoZGVzdGluYXRpb24uaW5zdGFuY2VVcmwgfHwgXCJcIikucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogYCR7aW5zdGFuY2VVcmx9L2FwaS92MS9zdGF0dXNlc2AsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7ZGVzdGluYXRpb24uYWNjZXNzVG9rZW59YCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3RhdHVzOiBzdGF0dXNUZXh0LCB2aXNpYmlsaXR5OiBcInB1YmxpY1wiIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzVXJsOiBzdHJpbmcgPSAoanNvbj8udXJsIGFzIHN0cmluZykgfHwgaW5zdGFuY2VVcmw7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0VkIFwiJHt0aXRsZX1cIiB0byBNYXN0b2RvbmApO1xyXG4gICAgICAgIHRoaXMuc2hvd1N0YXR1c0JhclN1Y2Nlc3MoXCJNYXN0b2RvblwiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgc3RhdHVzVXJsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZXJyb3JEZXRhaWw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBlcnJvckRldGFpbCA9IChqc29uPy5lcnJvciBhcyBzdHJpbmcpIHx8IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhyZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgTWFzdG9kb24gUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgTWFzdG9kb24gZXJyb3I6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gQmx1ZXNreSB2aWEgQVQgUHJvdG9jb2wuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9CbHVlc2t5KFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIEJsdWVza3kgKCR7ZGVzdGluYXRpb24ubmFtZX0pLi4uYCk7XHJcblxyXG4gICAgICAvLyBBdXRoZW50aWNhdGVcclxuICAgICAgY29uc3QgYXV0aFJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vYnNreS5zb2NpYWwveHJwYy9jb20uYXRwcm90by5zZXJ2ZXIuY3JlYXRlU2Vzc2lvblwiLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIGlkZW50aWZpZXI6IGRlc3RpbmF0aW9uLmhhbmRsZSxcclxuICAgICAgICAgIHBhc3N3b3JkOiBkZXN0aW5hdGlvbi5hcHBQYXNzd29yZCxcclxuICAgICAgICB9KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChhdXRoUmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IGF1dGhSZXNwb25zZS5zdGF0dXMgPj0gMzAwKSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBhdXRoIGZhaWxlZDogJHthdXRoUmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCB7IGRpZCwgYWNjZXNzSnd0IH0gPSBhdXRoUmVzcG9uc2UuanNvbiBhcyB7IGRpZDogc3RyaW5nOyBhY2Nlc3NKd3Q6IHN0cmluZyB9O1xyXG5cclxuICAgICAgLy8gQnVpbGQgcG9zdCB0ZXh0ICgzMDAgY2hhciBsaW1pdClcclxuICAgICAgY29uc3QgY2Fub25pY2FsVXJsID0gKHBheWxvYWQuY2Fub25pY2FsVXJsIGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3QgZXhjZXJwdCA9IChwYXlsb2FkLmV4Y2VycHQgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBiYXNlVGV4dCA9IFt0aXRsZSwgZXhjZXJwdF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCIgXHUyMDE0IFwiKTtcclxuICAgICAgY29uc3QgbWF4VGV4dCA9IDMwMCAtIChjYW5vbmljYWxVcmwgPyBjYW5vbmljYWxVcmwubGVuZ3RoICsgMSA6IDApO1xyXG4gICAgICBjb25zdCB0ZXh0ID0gKGJhc2VUZXh0Lmxlbmd0aCA+IG1heFRleHRcclxuICAgICAgICA/IGJhc2VUZXh0LnN1YnN0cmluZygwLCBtYXhUZXh0IC0gMSkgKyBcIlx1MjAyNlwiXHJcbiAgICAgICAgOiBiYXNlVGV4dFxyXG4gICAgICApICsgKGNhbm9uaWNhbFVybCA/IGAgJHtjYW5vbmljYWxVcmx9YCA6IFwiXCIpO1xyXG5cclxuICAgICAgY29uc3QgcG9zdFJlY29yZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XHJcbiAgICAgICAgJHR5cGU6IFwiYXBwLmJza3kuZmVlZC5wb3N0XCIsXHJcbiAgICAgICAgdGV4dCxcclxuICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICBsYW5nczogW1wiZW5cIl0sXHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChjYW5vbmljYWxVcmwpIHtcclxuICAgICAgICBjb25zdCB1cmxTdGFydCA9IHRleHQubGFzdEluZGV4T2YoY2Fub25pY2FsVXJsKTtcclxuICAgICAgICBwb3N0UmVjb3JkLmZhY2V0cyA9IFt7XHJcbiAgICAgICAgICBpbmRleDogeyBieXRlU3RhcnQ6IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh0ZXh0LnN1YnN0cmluZygwLCB1cmxTdGFydCkpLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgIGJ5dGVFbmQ6ICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHRleHQuc3Vic3RyaW5nKDAsIHVybFN0YXJ0ICsgY2Fub25pY2FsVXJsLmxlbmd0aCkpLmxlbmd0aCB9LFxyXG4gICAgICAgICAgZmVhdHVyZXM6IFt7ICR0eXBlOiBcImFwcC5ic2t5LnJpY2h0ZXh0LmZhY2V0I2xpbmtcIiwgdXJpOiBjYW5vbmljYWxVcmwgfV0sXHJcbiAgICAgICAgfV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vYnNreS5zb2NpYWwveHJwYy9jb20uYXRwcm90by5yZXBvLmNyZWF0ZVJlY29yZFwiLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke2FjY2Vzc0p3dH1gLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgcmVwbzogZGlkLFxyXG4gICAgICAgICAgY29sbGVjdGlvbjogXCJhcHAuYnNreS5mZWVkLnBvc3RcIixcclxuICAgICAgICAgIHJlY29yZDogcG9zdFJlY29yZCxcclxuICAgICAgICB9KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChjcmVhdGVSZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGNvbnN0IGNyZWF0ZUpzb24gPSBjcmVhdGVSZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IHVyaTogc3RyaW5nID0gKGNyZWF0ZUpzb24/LnVyaSBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgICAgY29uc3QgcG9zdFVybCA9IHVyaVxyXG4gICAgICAgICAgPyBgaHR0cHM6Ly9ic2t5LmFwcC9wcm9maWxlLyR7ZGVzdGluYXRpb24uaGFuZGxlfS9wb3N0LyR7dXJpLnNwbGl0KFwiL1wiKS5wb3AoKX1gXHJcbiAgICAgICAgICA6IFwiaHR0cHM6Ly9ic2t5LmFwcFwiO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gQmx1ZXNreWApO1xyXG4gICAgICAgIHRoaXMuc2hvd1N0YXR1c0JhclN1Y2Nlc3MoXCJCbHVlc2t5XCIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBwb3N0VXJsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZXJyb3JEZXRhaWw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgY3JlYXRlSnNvbiA9IGNyZWF0ZVJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBlcnJvckRldGFpbCA9IFN0cmluZygoY3JlYXRlSnNvbj8ubWVzc2FnZSBhcyBzdHJpbmcpIHx8IGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyk7XHJcbiAgICAgICAgfSBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBCbHVlc2t5IFBPU1NFIGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgZXJyb3I6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFBPU1NFIHRvIGFsbCBjb25maWd1cmVkIGRlc3RpbmF0aW9ucyBhdCBvbmNlLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcG9zc2VUb0FsbChvdmVycmlkZVN0YXR1cz86IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCIpIHtcclxuICAgIGNvbnN0IHsgZGVzdGluYXRpb25zIH0gPSB0aGlzLnNldHRpbmdzO1xyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbmV3IE5vdGljZShcIkFkZCBhdCBsZWFzdCBvbmUgZGVzdGluYXRpb24gaW4gc2V0dGluZ3NcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBNYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5idWlsZFBheWxvYWQodmlldy5maWxlLCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7U3RyaW5nKHBheWxvYWQudGl0bGUpfVwiIHRvICR7ZGVzdGluYXRpb25zLmxlbmd0aH0gZGVzdGluYXRpb24ocykuLi5gKTtcclxuICAgIGZvciAoY29uc3QgZGVzdCBvZiBkZXN0aW5hdGlvbnMpIHtcclxuICAgICAgaWYgKHRoaXMuaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0KSkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdCwgcGF5bG9hZCwgdmlldy5maWxlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZXcgTm90aWNlKGBTa2lwcGluZyBcIiR7ZGVzdC5uYW1lfVwiIFx1MjAxNCBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZGApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogQ2hlY2sgd2hldGhlciBhIGRlc3RpbmF0aW9uIGhhcyB0aGUgcmVxdWlyZWQgY3JlZGVudGlhbHMgY29uZmlndXJlZC4gKi9cclxuICBoYXNWYWxpZENyZWRlbnRpYWxzKGRlc3Q6IERlc3RpbmF0aW9uKTogYm9vbGVhbiB7XHJcbiAgICBzd2l0Y2ggKGRlc3QudHlwZSkge1xyXG4gICAgICBjYXNlIFwiZGV2dG9cIjogICAgcmV0dXJuICEhZGVzdC5hcGlLZXk7XHJcbiAgICAgIGNhc2UgXCJtYXN0b2RvblwiOiByZXR1cm4gISEoZGVzdC5pbnN0YW5jZVVybCAmJiBkZXN0LmFjY2Vzc1Rva2VuKTtcclxuICAgICAgY2FzZSBcImJsdWVza3lcIjogIHJldHVybiAhIShkZXN0LmhhbmRsZSAmJiBkZXN0LmFwcFBhc3N3b3JkKTtcclxuICAgICAgY2FzZSBcIm1lZGl1bVwiOiAgIHJldHVybiAhIWRlc3QubWVkaXVtVG9rZW47XHJcbiAgICAgIGNhc2UgXCJyZWRkaXRcIjogICByZXR1cm4gISEoZGVzdC5yZWRkaXRDbGllbnRJZCAmJiBkZXN0LnJlZGRpdENsaWVudFNlY3JldCAmJiBkZXN0LnJlZGRpdFJlZnJlc2hUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJ0aHJlYWRzXCI6ICByZXR1cm4gISEoZGVzdC50aHJlYWRzVXNlcklkICYmIGRlc3QudGhyZWFkc0FjY2Vzc1Rva2VuKTtcclxuICAgICAgY2FzZSBcImxpbmtlZGluXCI6IHJldHVybiAhIShkZXN0LmxpbmtlZGluQWNjZXNzVG9rZW4gJiYgZGVzdC5saW5rZWRpblBlcnNvblVybik7XHJcbiAgICAgIGNhc2UgXCJlY2VuY3lcIjogICByZXR1cm4gISEoZGVzdC5oaXZlVXNlcm5hbWUgJiYgZGVzdC5oaXZlUG9zdGluZ0tleSk7XHJcbiAgICAgIGRlZmF1bHQ6ICAgICAgICAgcmV0dXJuICEhKGRlc3QudXJsICYmIGRlc3QuYXBpS2V5KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXcml0ZSBhIHN5bmRpY2F0aW9uIGVudHJ5IGJhY2sgaW50byB0aGUgbm90ZSdzIGZyb250bWF0dGVyLiBVcGRhdGVzIHRoZSBVUkwgaWYgdGhlIGRlc3RpbmF0aW9uIGFscmVhZHkgZXhpc3RzLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgd3JpdGVTeW5kaWNhdGlvbihmaWxlOiBURmlsZSwgbmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZykge1xyXG4gICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZtLnN5bmRpY2F0aW9uKSkgZm0uc3luZGljYXRpb24gPSBbXTtcclxuICAgICAgY29uc3QgZW50cmllcyA9IGZtLnN5bmRpY2F0aW9uIGFzIEFycmF5PHsgbmFtZT86IHN0cmluZzsgdXJsPzogc3RyaW5nIH0+O1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGVudHJpZXMuZmluZCgocykgPT4gcy5uYW1lID09PSBuYW1lKTtcclxuICAgICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgICAgZXhpc3RpbmcudXJsID0gdXJsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVudHJpZXMucHVzaCh7IHVybCwgbmFtZSB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dTdGF0dXNCYXJTdWNjZXNzKHNpdGVOYW1lOiBzdHJpbmcpIHtcclxuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KGBQT1NTRWQgXHUyNzEzICR7c2l0ZU5hbWV9YCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhckVsKSB0aGlzLnN0YXR1c0JhckVsLnNldFRleHQoXCJcIik7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcblxyXG4gIC8qKiBTaG93IGN1cnJlbnQgc3luZGljYXRpb24gc3RhdHVzIGZvciB0aGUgYWN0aXZlIG5vdGUuICovXHJcbiAgcHJpdmF0ZSBwb3NzZVN0YXR1cygpIHtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBNYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3QgZm0gPSBmaWxlQ2FjaGU/LmZyb250bWF0dGVyIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3Qgc3luZGljYXRpb246IHVua25vd24gPSBmbT8uc3luZGljYXRpb247XHJcbiAgICBjb25zdCB0aXRsZSA9IChmbT8udGl0bGUgYXMgc3RyaW5nKSB8fCB2aWV3LmZpbGUuYmFzZW5hbWU7XHJcbiAgICBuZXcgUG9zc2VTdGF0dXNNb2RhbCh0aGlzLmFwcCwgdGl0bGUsIHN5bmRpY2F0aW9uKS5vcGVuKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgQ29uZmlybWF0aW9uIE1vZGFsIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxuY2xhc3MgQ29uZmlybVB1Ymxpc2hNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICBwcml2YXRlIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gIHByaXZhdGUgZGVzdGluYXRpb246IERlc3RpbmF0aW9uO1xyXG4gIHByaXZhdGUgb25Db25maXJtOiAoKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIGFwcDogQXBwLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBvbkNvbmZpcm06ICgpID0+IHZvaWQsXHJcbiAgKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcclxuICAgIHRoaXMuZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcclxuICAgIHRoaXMub25Db25maXJtID0gb25Db25maXJtO1xyXG4gIH1cclxuXHJcbiAgb25PcGVuKCkge1xyXG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoXCJwb3NzZS1wdWJsaXNoZXItY29uZmlybS1tb2RhbFwiKTtcclxuXHJcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiQ29uZmlybSBwb3NzZVwiIH0pO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgIHRleHQ6IGBZb3UgYXJlIGFib3V0IHRvIFBPU1NFIHRvICR7dGhpcy5kZXN0aW5hdGlvbi5uYW1lfTpgLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3VtbWFyeSA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwicHVibGlzaC1zdW1tYXJ5XCIgfSk7XHJcbiAgICBzdW1tYXJ5LmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogYFRpdGxlOiAke1N0cmluZyh0aGlzLnBheWxvYWQudGl0bGUpfWAgfSk7XHJcbiAgICBzdW1tYXJ5LmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogYFNsdWc6ICR7U3RyaW5nKHRoaXMucGF5bG9hZC5zbHVnKX1gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBTdGF0dXM6ICR7U3RyaW5nKHRoaXMucGF5bG9hZC5zdGF0dXMpfWAgfSk7XHJcbiAgICBzdW1tYXJ5LmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogYFR5cGU6ICR7U3RyaW5nKHRoaXMucGF5bG9hZC50eXBlKX1gIH0pO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnMgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm1vZGFsLWJ1dHRvbi1jb250YWluZXJcIiB9KTtcclxuXHJcbiAgICBjb25zdCBjYW5jZWxCdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDYW5jZWxcIiB9KTtcclxuICAgIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcclxuXHJcbiAgICBjb25zdCBjb25maXJtQnRuID0gYnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7XHJcbiAgICAgIHRleHQ6IFwiUE9TU0VcIixcclxuICAgICAgY2xzOiBcIm1vZC1jdGFcIixcclxuICAgIH0pO1xyXG4gICAgY29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgIHRoaXMub25Db25maXJtKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG9uQ2xvc2UoKSB7XHJcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIFNpdGUgUGlja2VyIE1vZGFsIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxuY2xhc3MgU2l0ZVBpY2tlck1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPERlc3RpbmF0aW9uPiB7XHJcbiAgcHJpdmF0ZSBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgcHJpdmF0ZSBvbkNob29zZTogKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGRlc3RpbmF0aW9uczogRGVzdGluYXRpb25bXSwgb25DaG9vc2U6IChkZXN0aW5hdGlvbjogRGVzdGluYXRpb24pID0+IHZvaWQpIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9ucyA9IGRlc3RpbmF0aW9ucztcclxuICAgIHRoaXMub25DaG9vc2UgPSBvbkNob29zZTtcclxuICAgIHRoaXMuc2V0UGxhY2Vob2xkZXIoXCJDaG9vc2UgYSBkZXN0aW5hdGlvbiB0byBwb3NzZSB0by4uLlwiKTtcclxuICB9XHJcblxyXG4gIGdldFN1Z2dlc3Rpb25zKHF1ZXJ5OiBzdHJpbmcpOiBEZXN0aW5hdGlvbltdIHtcclxuICAgIGNvbnN0IGxvd2VyID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiB0aGlzLmRlc3RpbmF0aW9ucy5maWx0ZXIoXHJcbiAgICAgIChkKSA9PlxyXG4gICAgICAgIGQubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyKSB8fFxyXG4gICAgICAgIGQudXJsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXIpLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJlbmRlclN1Z2dlc3Rpb24oZGVzdGluYXRpb246IERlc3RpbmF0aW9uLCBlbDogSFRNTEVsZW1lbnQpIHtcclxuICAgIGVsLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogZGVzdGluYXRpb24ubmFtZSwgY2xzOiBcInN1Z2dlc3Rpb24tdGl0bGVcIiB9KTtcclxuICAgIGVsLmNyZWF0ZUVsKFwic21hbGxcIiwgeyB0ZXh0OiBkZXN0aW5hdGlvbi51cmwsIGNsczogXCJzdWdnZXN0aW9uLW5vdGVcIiB9KTtcclxuICB9XHJcblxyXG4gIG9uQ2hvb3NlU3VnZ2VzdGlvbihkZXN0aW5hdGlvbjogRGVzdGluYXRpb24pIHtcclxuICAgIHRoaXMub25DaG9vc2UoZGVzdGluYXRpb24pO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIFNldHRpbmdzIFRhYiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIFBvc3NlUHVibGlzaGVyU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xyXG4gIHBsdWdpbjogUG9zc2VQdWJsaXNoZXJQbHVnaW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFBvc3NlUHVibGlzaGVyUGx1Z2luKSB7XHJcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xyXG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIllvdXIgY2Fub25pY2FsIHNpdGVcIikuc2V0SGVhZGluZygpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkNhbm9uaWNhbCBiYXNlIFVSTFwiKVxyXG4gICAgICAuc2V0RGVzYyhcIllvdXIgb3duIHNpdGUncyByb290IFVSTC4gRXZlcnkgcHVibGlzaGVkIHBvc3Qgd2lsbCBpbmNsdWRlIGEgY2Fub25pY2FsIFVSTCBwb2ludGluZyBoZXJlIFx1MjAxNCB0aGUgb3JpZ2luYWwgeW91IG93bi5cIilcclxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgdGV4dFxyXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly95b3Vyc2l0ZS5jb21cIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cDovL2xvY2FsaG9zdFwiKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBjYW5vbmljYWwgYmFzZSBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggSFRUUFM6Ly9cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIkRlc3RpbmF0aW9uc1wiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLmZvckVhY2goKGRlc3RpbmF0aW9uLCBpbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBkZXN0Q29udGFpbmVyID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHtcclxuICAgICAgICBjbHM6IFwicG9zc2UtcHVibGlzaGVyLXNpdGVcIixcclxuICAgICAgfSk7XHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpLnNldE5hbWUoZGVzdGluYXRpb24ubmFtZSB8fCBgRGVzdGluYXRpb24gJHtpbmRleCArIDF9YCkuc2V0SGVhZGluZygpO1xyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuc2V0TmFtZShcIkRlc3RpbmF0aW9uIG5hbWVcIilcclxuICAgICAgICAuc2V0RGVzYyhcIkEgbGFiZWwgZm9yIHRoaXMgZGVzdGluYXRpb24gKGUuZy4gTXkgYmxvZylcIilcclxuICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiTXkgc2l0ZVwiKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubmFtZSlcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuc2V0TmFtZShcIlR5cGVcIilcclxuICAgICAgICAuc2V0RGVzYyhcIlBsYXRmb3JtIHRvIHB1Ymxpc2ggdG9cIilcclxuICAgICAgICAuYWRkRHJvcGRvd24oKGRkKSA9PlxyXG4gICAgICAgICAgZGRcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImN1c3RvbS1hcGlcIiwgXCJDdXN0b20gQVBJXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJkZXZ0b1wiLCBcIkRldi50b1wiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwibWFzdG9kb25cIiwgXCJNYXN0b2RvblwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiYmx1ZXNreVwiLCBcIkJsdWVza3lcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcIm1lZGl1bVwiLCBcIk1lZGl1bVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwicmVkZGl0XCIsIFwiUmVkZGl0XCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJ0aHJlYWRzXCIsIFwiVGhyZWFkc1wiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwibGlua2VkaW5cIiwgXCJMaW5rZWRJblwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiZWNlbmN5XCIsIFwiRWNlbmN5XCIpXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi50eXBlIHx8IFwiY3VzdG9tLWFwaVwiKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS50eXBlID0gdmFsdWUgYXMgRGVzdGluYXRpb25UeXBlO1xyXG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgY29uc3QgZGVzdFR5cGUgPSBkZXN0aW5hdGlvbi50eXBlIHx8IFwiY3VzdG9tLWFwaVwiO1xyXG5cclxuICAgICAgaWYgKGRlc3RUeXBlID09PSBcImN1c3RvbS1hcGlcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlNpdGUgVVJMXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgc2l0ZSdzIGJhc2UgVVJMIChtdXN0IHN0YXJ0IHdpdGggSFRUUFM6Ly8pXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vZXhhbXBsZS5jb21cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udXJsIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS51cmwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cDovL2xvY2FsaG9zdFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiV2FybmluZzogZGVzdGluYXRpb24gVVJMIHNob3VsZCBzdGFydCB3aXRoIEhUVFBTOi8vXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFQSSBrZXlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiYFBVQkxJU0hfQVBJX0tFWWAgZnJvbSB5b3VyIHNpdGUncyBlbnZpcm9ubWVudFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIEFQSSBrZXlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBpS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJkZXZ0b1wiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiRGV2LnRvIEFQSSBrZXlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBodHRwczovL2Rldi50by9zZXR0aW5ncy9leHRlbnNpb25zXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgZGV2LnRvIEFQSSBrZXlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBpS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJtYXN0b2RvblwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSW5zdGFuY2UgVVJMXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgTWFzdG9kb24gaW5zdGFuY2UgKGUuZy4gaHR0cHM6Ly9tYXN0b2Rvbi5zb2NpYWwpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkhUVFBTOi8vbWFzdG9kb24uc29jaWFsXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmluc3RhbmNlVXJsIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5pbnN0YW5jZVVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIHlvdXIgbWFzdG9kb24gYWNjb3VudDogc2V0dGluZ3MgXHUyMTkyIGRldmVsb3BtZW50IFx1MjE5MiBuZXcgYXBwbGljYXRpb25cIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiYmx1ZXNreVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQmx1ZXNreSBoYW5kbGVcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBoYW5kbGUgKGUuZy4gWW91cm5hbWUuYnNreS5zb2NpYWwpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIllvdXJuYW1lLmJza3kuc29jaWFsXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhhbmRsZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaGFuZGxlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQXBwIHBhc3N3b3JkXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gaHR0cHM6Ly9ic2t5LmFwcC9zZXR0aW5ncy9hcHAtcGFzc3dvcmRzIFx1MjAxNCBOT1QgeW91ciBsb2dpbiBwYXNzd29yZFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlh4eHgteHh4eC14eHh4LXh4eHhcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBwUGFzc3dvcmQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFwcFBhc3N3b3JkID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibWVkaXVtXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBUEkgbm90aWNlXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIlRoZSBtZWRpdW0gQVBJIHdhcyBhcmNoaXZlZCBpbiBtYXJjaCAyMDIzLiBJdCBtYXkgc3RpbGwgd29yayBidXQgY291bGQgYmUgZGlzY29udGludWVkIGF0IGFueSB0aW1lLlwiKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJJbnRlZ3JhdGlvbiB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIG1lZGl1bS5jb20gXHUyMTkyIHNldHRpbmdzIFx1MjE5MiBzZWN1cml0eSBhbmQgYXBwcyBcdTIxOTIgaW50ZWdyYXRpb24gdG9rZW5zXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgbWVkaXVtIGludGVncmF0aW9uIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLm1lZGl1bVRva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5tZWRpdW1Ub2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcInJlZGRpdFwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQ2xpZW50IElEXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gcmVkZGl0LmNvbS9wcmVmcy9hcHBzIFx1MjAxNCBjcmVhdGUgYSBcXFwic2NyaXB0XFxcIiB0eXBlIGFwcFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJDbGllbnQgSURcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0Q2xpZW50SWQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdENsaWVudElkID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQ2xpZW50IHNlY3JldFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkNsaWVudCBzZWNyZXRcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0Q2xpZW50U2VjcmV0IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRDbGllbnRTZWNyZXQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJSZWZyZXNoIHRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkF1dGhvcml6YXRpb24gcmVmcmVzaCB0b2tlbiBmb3IgeW91ciBSZWRkaXQgYWNjb3VudFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlJlZnJlc2ggdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0UmVmcmVzaFRva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRSZWZyZXNoVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJSZWRkaXQgdXNlcm5hbWVcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiVS95b3VybmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRVc2VybmFtZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0VXNlcm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJEZWZhdWx0IHN1YnJlZGRpdFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJlLmcuIHIvd2ViZGV2IFx1MjAxNCBjYW4gYmUgb3ZlcnJpZGRlbiBwZXIgbm90ZSB3aXRoIFxcXCJzdWJyZWRkaXQ6XFxcIiBmcm9udG1hdHRlclwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJSL3N1YnJlZGRpdG5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0RGVmYXVsdFN1YnJlZGRpdCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0RGVmYXVsdFN1YnJlZGRpdCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcInRocmVhZHNcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlRocmVhZHMgdXNlciBJRFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIG51bWVyaWMgdGhyZWFkcy9pbnN0YWdyYW0gdXNlciBJRFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCIxMjM0NTY3ODlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udGhyZWFkc1VzZXJJZCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udGhyZWFkc1VzZXJJZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJMb25nLWxpdmVkIHRocmVhZHMgYWNjZXNzIHRva2VuIHdpdGggdGhyZWFkc19jb250ZW50X3B1Ymxpc2ggcGVybWlzc2lvblwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi50aHJlYWRzQWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnRocmVhZHNBY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImxpbmtlZGluXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiQXV0aG9yaXphdGlvbiBiZWFyZXIgdG9rZW4gd2l0aCB3X21lbWJlcl9zb2NpYWwgc2NvcGVcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubGlua2VkaW5BY2Nlc3NUb2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubGlua2VkaW5BY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlBlcnNvbiBpZGVudGlmaWVyXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgTGlua2VkSW4gbWVtYmVyIGlkZW50aWZpZXJcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiVXJuOmxpOnBlcnNvbjouLi5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubGlua2VkaW5QZXJzb25Vcm4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmxpbmtlZGluUGVyc29uVXJuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiZWNlbmN5XCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJVc2VybmFtZVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIGFjY291bnQgbmFtZSBvbiBodHRwczovL2VjZW5jeS5jb20gKHdpdGhvdXQgQClcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiWW91ciB1c2VybmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oaXZlVXNlcm5hbWUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVVc2VybmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlBvc3Rpbmcga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgcHJpdmF0ZSBwb3N0aW5nIGtleSBmcm9tIGh0dHBzOi8vZWNlbmN5LmNvbSAobm90IHRoZSBvd25lciBvciBhY3RpdmUga2V5KVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIjVrLi4uXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhpdmVQb3N0aW5nS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oaXZlUG9zdGluZ0tleSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNvbW11bml0eVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJIaXZlIGNvbW11bml0eSB0YWcgdG8gcG9zdCBpbiAoZS5nLiBIaXZlLTE3NDMwMSBmb3Igb2NkKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJIaXZlLTE3NDMwMVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oaXZlQ29tbXVuaXR5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oaXZlQ29tbXVuaXR5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJUZXN0IGNvbm5lY3Rpb25cIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5wbHVnaW4uaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0aW5hdGlvbikpIHtcclxuICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiQ29uZmlndXJlIGNyZWRlbnRpYWxzIGZpcnN0XCIpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVzdFR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYXBpL3B1Ymxpc2hgO1xyXG4gICAgICAgICAgICAgIHJlcXVlc3RVcmwoe1xyXG4gICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIk9QVElPTlNcIixcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJ4LXB1Ymxpc2gta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSB9LFxyXG4gICAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCA0MDApIHtcclxuICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgQ29ubmVjdGlvbiB0byAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfSBzdWNjZXNzZnVsYCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfSByZXNwb25kZWQgd2l0aCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBDb3VsZCBub3QgcmVhY2ggJHtkZXN0aW5hdGlvbi5uYW1lIHx8IGRlc3RpbmF0aW9uLnVybH1gKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBuZXcgTm90aWNlKGBDcmVkZW50aWFscyBsb29rIGNvbmZpZ3VyZWQgZm9yICR7ZGVzdGluYXRpb24ubmFtZX0uIFB1Ymxpc2ggdG8gdGVzdC5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICAgIGJ0blxyXG4gICAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlJlbW92ZSBkZXN0aW5hdGlvblwiKVxyXG4gICAgICAgICAgICAuc2V0V2FybmluZygpXHJcbiAgICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBjb25maXJtRWwgPSBkZXN0Q29udGFpbmVyLmNyZWF0ZURpdih7XHJcbiAgICAgICAgICAgICAgICBjbHM6IFwic2V0dGluZy1pdGVtXCIsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uZmlybUVsLmNyZWF0ZUVsKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBgUmVtb3ZlIFwiJHtkZXN0aW5hdGlvbi5uYW1lIHx8IFwidGhpcyBkZXN0aW5hdGlvblwifVwiPyBgLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHllc0J0biA9IGNvbmZpcm1FbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlllcywgcmVtb3ZlXCIsXHJcbiAgICAgICAgICAgICAgICBjbHM6IFwibW9kLXdhcm5pbmdcIixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25zdCBub0J0biA9IGNvbmZpcm1FbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiQ2FuY2VsXCIgfSk7XHJcbiAgICAgICAgICAgICAgeWVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIHZvaWQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCkudGhlbigoKSA9PiB0aGlzLmRpc3BsYXkoKSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgbm9CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGNvbmZpcm1FbC5yZW1vdmUoKSk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0blxyXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJBZGQgZGVzdGluYXRpb25cIilcclxuICAgICAgICAgIC5zZXRDdGEoKVxyXG4gICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCJcIixcclxuICAgICAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIixcclxuICAgICAgICAgICAgICB1cmw6IFwiXCIsXHJcbiAgICAgICAgICAgICAgYXBpS2V5OiBcIlwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdm9pZCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKS50aGVuKCgpID0+IHRoaXMuZGlzcGxheSgpKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiRGVmYXVsdHNcIikuc2V0SGVhZGluZygpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkRlZmF1bHQgc3RhdHVzXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiRGVmYXVsdCBwdWJsaXNoIHN0YXR1cyB3aGVuIG5vdCBzcGVjaWZpZWQgaW4gZnJvbnRtYXR0ZXJcIilcclxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cclxuICAgICAgICBkcm9wZG93blxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcImRyYWZ0XCIsIFwiRHJhZnRcIilcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJwdWJsaXNoZWRcIiwgXCJQdWJsaXNoZWRcIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzID0gdmFsdWUgYXNcclxuICAgICAgICAgICAgICB8IFwiZHJhZnRcIlxyXG4gICAgICAgICAgICAgIHwgXCJwdWJsaXNoZWRcIjtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDb25maXJtIGJlZm9yZSBwdWJsaXNoaW5nXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiU2hvdyBhIGNvbmZpcm1hdGlvbiBtb2RhbCB3aXRoIHBvc3QgZGV0YWlscyBiZWZvcmUgcHVibGlzaGluZ1wiKVxyXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2gpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiU3RyaXAgd2lraS1saW5rcyBhbmQgZW1iZWRzXCIpXHJcbiAgICAgIC5zZXREZXNjKFxyXG4gICAgICAgIFwiQ29udmVydCB3aWtpLWxpbmtzLCByZW1vdmUgZW1iZWRzLCBjb21tZW50cywgYW5kIGRhdGF2aWV3IGJsb2NrcyBiZWZvcmUgcHVibGlzaGluZ1wiLFxyXG4gICAgICApXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4KVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJBdXRvLXB1Ymxpc2hcIikuc2V0SGVhZGluZygpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkF1dG8tcHVibGlzaCBvbiBzYXZlXCIpXHJcbiAgICAgIC5zZXREZXNjKFxyXG4gICAgICAgIFwiQXV0b21hdGljYWxseSByZS1wdWJsaXNoIHRvIHlvdXIgc2l0ZSB3aGVuIHlvdSBzYXZlIGEgbm90ZSB0aGF0IGhhcyBzdGF0dXM6IHB1Ymxpc2hlZCBpbiBpdHMgZnJvbnRtYXR0ZXIuIFwiICtcclxuICAgICAgICBcIkRyYWZ0cyBhcmUgbmV2ZXIgYXV0by1wdWJsaXNoZWQuIENoYW5nZXMgYXJlIGRlYm91bmNlZCAoM3MgZGVsYXkpIHRvIGF2b2lkIHJhcGlkLWZpcmUgcmVxdWVzdHMuXCIsXHJcbiAgICAgIClcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9QdWJsaXNoT25TYXZlKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUHVibGlzaE9uU2F2ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIGNvbnN0IGN1c3RvbUFwaURlc3RzID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLmZpbHRlcigoZCkgPT4gZC50eXBlID09PSBcImN1c3RvbS1hcGlcIik7XHJcbiAgICBpZiAoY3VzdG9tQXBpRGVzdHMubGVuZ3RoID4gMSkge1xyXG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZShcIkF1dG8tcHVibGlzaCBkZXN0aW5hdGlvblwiKVxyXG4gICAgICAgIC5zZXREZXNjKFwiV2hpY2ggY3VzdG9tLWFwaSBkZXN0aW5hdGlvbiB0byBhdXRvLXB1Ymxpc2ggdG8uIExlYXZlIGVtcHR5IHRvIHVzZSB0aGUgZmlyc3Qgb25lLlwiKVxyXG4gICAgICAgIC5hZGREcm9wZG93bigoZGQpID0+IHtcclxuICAgICAgICAgIGRkLmFkZE9wdGlvbihcIlwiLCBcIkZpcnN0IGN1c3RvbS1hcGkgZGVzdGluYXRpb25cIik7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGQgb2YgY3VzdG9tQXBpRGVzdHMpIHtcclxuICAgICAgICAgICAgZGQuYWRkT3B0aW9uKGQubmFtZSwgZC5uYW1lKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRkLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9QdWJsaXNoRGVzdGluYXRpb24pXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUHVibGlzaERlc3RpbmF0aW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIFx1MjUwMFx1MjUwMCBTdXBwb3J0IHNlY3Rpb24gXHUyNTAwXHUyNTAwICovXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIlN1cHBvcnRcIikuc2V0SGVhZGluZygpO1xyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJwXCIsIHtcclxuICAgICAgdGV4dDogXCJUaGlzIHBsdWdpbiBpcyBmcmVlIGFuZCBvcGVuIHNvdXJjZS4gSWYgaXQgc2F2ZXMgeW91IHRpbWUsIGNvbnNpZGVyIHN1cHBvcnRpbmcgaXRzIGRldmVsb3BtZW50LlwiLFxyXG4gICAgICBjbHM6IFwic2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJCdXkgbWUgYSBjb2ZmZWVcIilcclxuICAgICAgLnNldERlc2MoXCJPbmUtdGltZSBvciByZWN1cnJpbmcgc3VwcG9ydFwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJTdXBwb3J0XCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2J1eW1lYWNvZmZlZS5jb20vdGhlb2ZmaWNhbGRtXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkdpdEh1YiBzcG9uc29yc1wiKVxyXG4gICAgICAuc2V0RGVzYyhcIk1vbnRobHkgc3BvbnNvcnNoaXAgdGhyb3VnaCBHaXRIdWJcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiU3BvbnNvclwiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cHM6Ly9naXRodWIuY29tL3Nwb25zb3JzL1RoZU9mZmljaWFsRE1cIiwgXCJfYmxhbmtcIik7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQWxsIGZ1bmRpbmcgb3B0aW9uc1wiKVxyXG4gICAgICAuc2V0RGVzYyhcImRldmlubWFyc2hhbGwuaW5mby9mdW5kXCIpXHJcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlZpZXdcIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cub3BlbihcImh0dHBzOi8vZGV2aW5tYXJzaGFsbC5pbmZvL2Z1bmRcIiwgXCJfYmxhbmtcIik7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgUE9TU0UgU3RhdHVzIE1vZGFsIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxudHlwZSBTeW5kaWNhdGlvbkVudHJ5ID0geyB1cmw/OiBzdHJpbmc7IG5hbWU/OiBzdHJpbmcgfTtcclxuXHJcbmNsYXNzIFBvc3NlU3RhdHVzTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgc3luZGljYXRpb246IHVua25vd247XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCB0aXRsZTogc3RyaW5nLCBzeW5kaWNhdGlvbjogdW5rbm93bikge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcclxuICAgIHRoaXMuc3luZGljYXRpb24gPSBzeW5kaWNhdGlvbjtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwicG9zc2UtcHVibGlzaGVyLWNvbmZpcm0tbW9kYWxcIik7XHJcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiUG9zc2Ugc3RhdHVzXCIgfSk7XHJcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogYE5vdGU6ICR7U3RyaW5nKHRoaXMudGl0bGUpfWAgfSk7XHJcblxyXG4gICAgY29uc3QgZW50cmllcyA9IEFycmF5LmlzQXJyYXkodGhpcy5zeW5kaWNhdGlvbilcclxuICAgICAgPyAodGhpcy5zeW5kaWNhdGlvbiBhcyBTeW5kaWNhdGlvbkVudHJ5W10pXHJcbiAgICAgIDogW107XHJcblxyXG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICAgIHRleHQ6IFwiVGhpcyBub3RlIGhhcyBub3QgYmVlbiBzeW5kaWNhdGVkIHRvIGFueSBkZXN0aW5hdGlvbiB5ZXQuXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKFwic3Ryb25nXCIsIHsgdGV4dDogYFN5bmRpY2F0ZWQgdG8gJHtlbnRyaWVzLmxlbmd0aH0gZGVzdGluYXRpb24ocyk6YCB9KTtcclxuICAgICAgY29uc3QgbGlzdCA9IGNvbnRlbnRFbC5jcmVhdGVFbChcInVsXCIpO1xyXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcclxuICAgICAgICBjb25zdCBsaSA9IGxpc3QuY3JlYXRlRWwoXCJsaVwiKTtcclxuICAgICAgICBpZiAoZW50cnkudXJsKSB7XHJcbiAgICAgICAgICBjb25zdCBhID0gbGkuY3JlYXRlRWwoXCJhXCIsIHsgdGV4dDogZW50cnkubmFtZSB8fCBlbnRyeS51cmwgfSk7XHJcbiAgICAgICAgICBhLmhyZWYgPSBlbnRyeS51cmw7XHJcbiAgICAgICAgICBhLnRhcmdldCA9IFwiX2JsYW5rXCI7XHJcbiAgICAgICAgICBhLnJlbCA9IFwibm9vcGVuZXJcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGkuc2V0VGV4dChlbnRyeS5uYW1lIHx8IFwiVW5rbm93blwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBidXR0b25zID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJtb2RhbC1idXR0b24tY29udGFpbmVyXCIgfSk7XHJcbiAgICBjb25zdCBjbG9zZUJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNsb3NlXCIgfSk7XHJcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcclxuICB9XHJcblxyXG4gIG9uQ2xvc2UoKSB7XHJcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQVdPO0FBK0NQLElBQU0sbUJBQTJDO0FBQUEsRUFDL0MsY0FBYyxDQUFDO0FBQUEsRUFDZixrQkFBa0I7QUFBQSxFQUNsQixlQUFlO0FBQUEsRUFDZixzQkFBc0I7QUFBQSxFQUN0QixxQkFBcUI7QUFBQSxF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
