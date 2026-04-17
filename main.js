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
    const status = overrideStatus || frontmatter.status || this.settings.defaultStatus;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiIHwgXCJtZWRpdW1cIiB8IFwicmVkZGl0XCIgfCBcInRocmVhZHNcIiB8IFwibGlua2VkaW5cIiB8IFwiZWNlbmN5XCI7XHJcblxyXG5pbnRlcmZhY2UgRGVzdGluYXRpb24ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB0eXBlOiBEZXN0aW5hdGlvblR5cGU7XHJcbiAgLy8gY3VzdG9tLWFwaVxyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG4gIC8vIG1hc3RvZG9uXHJcbiAgaW5zdGFuY2VVcmw/OiBzdHJpbmc7XHJcbiAgYWNjZXNzVG9rZW4/OiBzdHJpbmc7XHJcbiAgLy8gYmx1ZXNreVxyXG4gIGhhbmRsZT86IHN0cmluZztcclxuICBhcHBQYXNzd29yZD86IHN0cmluZztcclxuICAvLyBtZWRpdW1cclxuICBtZWRpdW1Ub2tlbj86IHN0cmluZztcclxuICBtZWRpdW1BdXRob3JJZD86IHN0cmluZztcclxuICAvLyByZWRkaXRcclxuICByZWRkaXRDbGllbnRJZD86IHN0cmluZztcclxuICByZWRkaXRDbGllbnRTZWNyZXQ/OiBzdHJpbmc7XHJcbiAgcmVkZGl0UmVmcmVzaFRva2VuPzogc3RyaW5nO1xyXG4gIHJlZGRpdFVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHJlZGRpdERlZmF1bHRTdWJyZWRkaXQ/OiBzdHJpbmc7XHJcbiAgLy8gdGhyZWFkc1xyXG4gIHRocmVhZHNVc2VySWQ/OiBzdHJpbmc7XHJcbiAgdGhyZWFkc0FjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGxpbmtlZGluXHJcbiAgbGlua2VkaW5BY2Nlc3NUb2tlbj86IHN0cmluZztcclxuICBsaW5rZWRpblBlcnNvblVybj86IHN0cmluZztcclxuICAvLyBlY2VuY3kgLyBoaXZlXHJcbiAgaGl2ZVVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIGhpdmVQb3N0aW5nS2V5Pzogc3RyaW5nO1xyXG4gIGhpdmVDb21tdW5pdHk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxuICBhdXRvUHVibGlzaE9uU2F2ZTogYm9vbGVhbjtcclxuICBhdXRvUHVibGlzaERlc3RpbmF0aW9uOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSB7XHJcbiAgZGVzdGluYXRpb25zOiBbXSxcclxuICBjYW5vbmljYWxCYXNlVXJsOiBcIlwiLFxyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIixcclxuICBjb25maXJtQmVmb3JlUHVibGlzaDogdHJ1ZSxcclxuICBzdHJpcE9ic2lkaWFuU3ludGF4OiB0cnVlLFxyXG4gIGF1dG9QdWJsaXNoT25TYXZlOiBmYWxzZSxcclxuICBhdXRvUHVibGlzaERlc3RpbmF0aW9uOiBcIlwiLFxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEZyb250bWF0dGVyIHtcclxuICB0aXRsZT86IHN0cmluZztcclxuICBzbHVnPzogc3RyaW5nO1xyXG4gIGV4Y2VycHQ/OiBzdHJpbmc7XHJcbiAgdHlwZT86IHN0cmluZztcclxuICBzdGF0dXM/OiBzdHJpbmc7XHJcbiAgdGFncz86IHN0cmluZ1tdO1xyXG4gIHBpbGxhcj86IHN0cmluZztcclxuICBjb3ZlckltYWdlPzogc3RyaW5nO1xyXG4gIGZlYXR1cmVkPzogYm9vbGVhbjtcclxuICBtZXRhVGl0bGU/OiBzdHJpbmc7XHJcbiAgbWV0YURlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIG9nSW1hZ2U/OiBzdHJpbmc7XHJcbiAgdmlkZW9Vcmw/OiBzdHJpbmc7XHJcbiAgY2Fub25pY2FsVXJsPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogRXh0cmFjdCBib2R5IGNvbnRlbnQgYmVsb3cgdGhlIFlBTUwgZnJvbnRtYXR0ZXIgZmVuY2UuICovXHJcbmZ1bmN0aW9uIGV4dHJhY3RCb2R5KGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9eLS0tXFxyP1xcbltcXHNcXFNdKj9cXHI/XFxuLS0tXFxyP1xcbj8oW1xcc1xcU10qKSQvKTtcclxuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50cmltKCkgOiBjb250ZW50O1xyXG59XHJcblxyXG4vKipcclxuICogQnVpbGQgYSBGcm9udG1hdHRlciBvYmplY3QgZnJvbSBPYnNpZGlhbidzIGNhY2hlZCBtZXRhZGF0YS5cclxuICogRmFsbHMgYmFjayBncmFjZWZ1bGx5IHdoZW4gZmllbGRzIGFyZSBhYnNlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBidWlsZEZyb250bWF0dGVyKGNhY2hlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCk6IEZyb250bWF0dGVyIHtcclxuICBpZiAoIWNhY2hlKSByZXR1cm4ge307XHJcbiAgY29uc3QgZm06IEZyb250bWF0dGVyID0ge307XHJcblxyXG4gIGlmICh0eXBlb2YgY2FjaGUudGl0bGUgPT09IFwic3RyaW5nXCIpIGZtLnRpdGxlID0gY2FjaGUudGl0bGU7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5zbHVnID09PSBcInN0cmluZ1wiKSBmbS5zbHVnID0gY2FjaGUuc2x1ZztcclxuICBpZiAodHlwZW9mIGNhY2hlLmV4Y2VycHQgPT09IFwic3RyaW5nXCIpIGZtLmV4Y2VycHQgPSBjYWNoZS5leGNlcnB0O1xyXG4gIGlmICh0eXBlb2YgY2FjaGUudHlwZSA9PT0gXCJzdHJpbmdcIikgZm0udHlwZSA9IGNhY2hlLnR5cGU7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5zdGF0dXMgPT09IFwic3RyaW5nXCIpIGZtLnN0YXR1cyA9IGNhY2hlLnN0YXR1cztcclxuICBpZiAodHlwZW9mIGNhY2hlLnBpbGxhciA9PT0gXCJzdHJpbmdcIikgZm0ucGlsbGFyID0gY2FjaGUucGlsbGFyO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuY292ZXJJbWFnZSA9PT0gXCJzdHJpbmdcIikgZm0uY292ZXJJbWFnZSA9IGNhY2hlLmNvdmVySW1hZ2U7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5tZXRhVGl0bGUgPT09IFwic3RyaW5nXCIpIGZtLm1ldGFUaXRsZSA9IGNhY2hlLm1ldGFUaXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFEZXNjcmlwdGlvbiA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YURlc2NyaXB0aW9uID0gY2FjaGUubWV0YURlc2NyaXB0aW9uO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUub2dJbWFnZSA9PT0gXCJzdHJpbmdcIikgZm0ub2dJbWFnZSA9IGNhY2hlLm9nSW1hZ2U7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS52aWRlb1VybCA9PT0gXCJzdHJpbmdcIikgZm0udmlkZW9VcmwgPSBjYWNoZS52aWRlb1VybDtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5mZWF0dXJlZCA9PT0gXCJib29sZWFuXCIpIGZtLmZlYXR1cmVkID0gY2FjaGUuZmVhdHVyZWQ7XHJcbiAgZWxzZSBpZiAoY2FjaGUuZmVhdHVyZWQgPT09IFwidHJ1ZVwiKSBmbS5mZWF0dXJlZCA9IHRydWU7XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KGNhY2hlLnRhZ3MpKSB7XHJcbiAgICBmbS50YWdzID0gY2FjaGUudGFncy5tYXAoKHQ6IHVua25vd24pID0+IFN0cmluZyh0KS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBjYWNoZS50YWdzID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICBmbS50YWdzID0gY2FjaGUudGFnc1xyXG4gICAgICAucmVwbGFjZSgvXlxcW3xcXF0kL2csIFwiXCIpXHJcbiAgICAgIC5zcGxpdChcIixcIilcclxuICAgICAgLm1hcCgodDogc3RyaW5nKSA9PiB0LnRyaW0oKSlcclxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgY2FjaGUuY2Fub25pY2FsVXJsID09PSBcInN0cmluZ1wiKSBmbS5jYW5vbmljYWxVcmwgPSBjYWNoZS5jYW5vbmljYWxVcmw7XHJcblxyXG4gIHJldHVybiBmbTtcclxufVxyXG5cclxuLyoqIENvbnZlcnQgYSB0aXRsZSBzdHJpbmcgdG8gYSBVUkwtc2FmZSBzbHVnLCBoYW5kbGluZyBkaWFjcml0aWNzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9TbHVnKHRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiB0aXRsZVxyXG4gICAgLm5vcm1hbGl6ZShcIk5GRFwiKVxyXG4gICAgLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpXHJcbiAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgXCItXCIpXHJcbiAgICAucmVwbGFjZSgvXi18LSQvZywgXCJcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQcmUtcHJvY2VzcyBPYnNpZGlhbi1zcGVjaWZpYyBtYXJrZG93biBiZWZvcmUgc2VuZGluZyB0byB0aGUgYmxvZyBBUEkuXHJcbiAqIFN0cmlwcyB3aWtpLWxpbmtzLCBlbWJlZHMsIGNvbW1lbnRzLCBhbmQgZGF0YXZpZXcgYmxvY2tzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHByZXByb2Nlc3NDb250ZW50KGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgLy8gUmVtb3ZlIE9ic2lkaWFuIGNvbW1lbnRzOiAlJS4uLiUlXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvJSVbXFxzXFxTXSo/JSUvZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rIGVtYmVkczogIVtbZmlsZV1dIFx1MjE5MiAocmVtb3ZlZClcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8hXFxbXFxbKFteXFxdXSspXFxdXFxdL2csIFwiXCIpO1xyXG5cclxuICAvLyBDb252ZXJ0IHdpa2ktbGlua3Mgd2l0aCBhbGlhczogW1t0YXJnZXR8YWxpYXNdXSBcdTIxOTIgYWxpYXNcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9cXFtcXFsoW15cXF18XSspXFx8KFteXFxdXSspXFxdXFxdL2csIFwiJDJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRob3V0IGFsaWFzOiBbW3RhcmdldF1dIFx1MjE5MiB0YXJnZXRcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9cXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCIkMVwiKTtcclxuXHJcbiAgLy8gUmVtb3ZlIGRhdGF2aWV3IGNvZGUgYmxvY2tzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdbXFxzXFxTXSo/YGBgL2csIFwiXCIpO1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL2BgYGRhdGF2aWV3anNbXFxzXFxTXSo/YGBgL2csIFwiXCIpO1xyXG5cclxuICAvLyBDbGVhbiB1cCBleGNlc3MgYmxhbmsgbGluZXMgbGVmdCBieSByZW1vdmFsc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XHJcblxyXG4gIHJldHVybiBib2R5LnRyaW0oKTtcclxufVxyXG5cclxuLyoqIEVzY2FwZSBIVE1MIHNwZWNpYWwgY2hhcmFjdGVycy4gKi9cclxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHN0clxyXG4gICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxyXG4gICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcclxuICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYmFzaWMgTWFya2Rvd24gdG8gSFRNTC4gSGFuZGxlcyBoZWFkaW5ncywgYm9sZCwgaXRhbGljLCBpbmxpbmUgY29kZSxcclxuICogbGlua3MsIGltYWdlcywgbGlzdHMsIGJsb2NrcXVvdGVzLCBob3Jpem9udGFsIHJ1bGVzLCBmZW5jZWQgY29kZSBibG9ja3MsIGFuZCBwYXJhZ3JhcGhzLlxyXG4gKiBObyBleHRlcm5hbCBkZXBlbmRlbmNpZXMgXHUyMDE0IHJlZ2V4IG9ubHkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFya2Rvd25Ub0h0bWwobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgbGV0IGh0bWwgPSBtYXJrZG93bjtcclxuXHJcbiAgLy8gRmVuY2VkIGNvZGUgYmxvY2tzIChwcm9jZXNzIGZpcnN0IHRvIGF2b2lkIG1hbmdsaW5nIHRoZWlyIGNvbnRlbnRzKVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL2BgYChcXHcqKVxcbihbXFxzXFxTXSo/KWBgYC9nLCAoXzogc3RyaW5nLCBsYW5nOiBzdHJpbmcsIGNvZGU6IHN0cmluZykgPT5cclxuICAgIGA8cHJlPjxjb2RlJHtsYW5nID8gYCBjbGFzcz1cImxhbmd1YWdlLSR7bGFuZ31cImAgOiBcIlwifT4ke2VzY2FwZUh0bWwoY29kZS50cmltKCkpfTwvY29kZT48L3ByZT5gXHJcbiAgKTtcclxuXHJcbiAgLy8gSGVhZGluZ3NcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjIyMjICguKykkL2dtLCBcIjxoNj4kMTwvaDY+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjIyAoLispJC9nbSwgXCI8aDU+JDE8L2g1PlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjIyAoLispJC9nbSwgXCI8aDQ+JDE8L2g0PlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyMjICguKykkL2dtLCBcIjxoMz4kMTwvaDM+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyAoLispJC9nbSwgXCI8aDI+JDE8L2gyPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eIyAoLispJC9nbSwgXCI8aDE+JDE8L2gxPlwiKTtcclxuXHJcbiAgLy8gSG9yaXpvbnRhbCBydWxlc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15bLSpfXXszLH1cXHMqJC9nbSwgXCI8aHI+XCIpO1xyXG5cclxuICAvLyBCbG9ja3F1b3Rlc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14+ICguKykkL2dtLCBcIjxibG9ja3F1b3RlPiQxPC9ibG9ja3F1b3RlPlwiKTtcclxuXHJcbiAgLy8gQm9sZCArIGl0YWxpYyAob3JkZXI6IHRyaXBsZSBcdTIxOTIgZG91YmxlIFx1MjE5MiBzaW5nbGUpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFwqXFwqXFwqKC4rPylcXCpcXCpcXCovZywgXCI8c3Ryb25nPjxlbT4kMTwvZW0+PC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcKlxcKiguKz8pXFwqXFwqL2csIFwiPHN0cm9uZz4kMTwvc3Ryb25nPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXCooLis/KVxcKi9nLCBcIjxlbT4kMTwvZW0+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL19fXyguKz8pX19fL2csIFwiPHN0cm9uZz48ZW0+JDE8L2VtPjwvc3Ryb25nPlwiKTtcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9fXyguKz8pX18vZywgXCI8c3Ryb25nPiQxPC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL18oLis/KV8vZywgXCI8ZW0+JDE8L2VtPlwiKTtcclxuXHJcbiAgLy8gSW5saW5lIGNvZGVcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9gKFteYF0rKWAvZywgXCI8Y29kZT4kMTwvY29kZT5cIik7XHJcblxyXG4gIC8vIEltYWdlcyAoYmVmb3JlIGxpbmtzKVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoLyFcXFsoW15cXF1dKilcXF1cXCgoW14pXSspXFwpL2csICc8aW1nIHNyYz1cIiQyXCIgYWx0PVwiJDFcIj4nKTtcclxuXHJcbiAgLy8gTGlua3NcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXFsoW15cXF1dKylcXF1cXCgoW14pXSspXFwpL2csICc8YSBocmVmPVwiJDJcIj4kMTwvYT4nKTtcclxuXHJcbiAgLy8gVW5vcmRlcmVkIGxpc3QgaXRlbXNcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eWy0qK10gKC4rKSQvZ20sIFwiPGxpPiQxPC9saT5cIik7XHJcblxyXG4gIC8vIE9yZGVyZWQgbGlzdCBpdGVtc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXGQrXFwuICguKykkL2dtLCBcIjxsaT4kMTwvbGk+XCIpO1xyXG5cclxuICAvLyBXcmFwIDxsaT4gcnVucyBpbiA8dWw+XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKDxsaT5bXFxzXFxTXSo/PFxcL2xpPlxcbj8pKy9nLCAobWF0Y2gpID0+IGA8dWw+JHttYXRjaH08L3VsPmApO1xyXG5cclxuICAvLyBQYXJhZ3JhcGhzIChkb3VibGUgbmV3bGluZSBcdTIxOTIgcGFyYWdyYXBoIGJsb2NrKVxyXG4gIGh0bWwgPSBodG1sXHJcbiAgICAuc3BsaXQoL1xcblxcbisvKVxyXG4gICAgLm1hcCgoYmxvY2spID0+IHtcclxuICAgICAgY29uc3QgdHJpbW1lZCA9IGJsb2NrLnRyaW0oKTtcclxuICAgICAgaWYgKCF0cmltbWVkKSByZXR1cm4gXCJcIjtcclxuICAgICAgaWYgKC9ePChoWzEtNl18dWx8b2x8bGl8YmxvY2txdW90ZXxwcmV8aHIpLy50ZXN0KHRyaW1tZWQpKSByZXR1cm4gdHJpbW1lZDtcclxuICAgICAgcmV0dXJuIGA8cD4ke3RyaW1tZWQucmVwbGFjZSgvXFxuL2csIFwiPGJyPlwiKX08L3A+YDtcclxuICAgIH0pXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAuam9pbihcIlxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGh0bWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdHJpcCBhbGwgTWFya2Rvd24gc3ludGF4IHRvIHByb2R1Y2UgcGxhaW4gdGV4dCBzdWl0YWJsZSBmb3JcclxuICogY2hhcmFjdGVyLWxpbWl0ZWQgcGxhdGZvcm1zIChUaHJlYWRzLCBNYXN0b2RvbiBwcmV2aWV3LCBldGMuKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93blRvUGxhaW5UZXh0KG1hcmtkb3duOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGxldCB0ZXh0ID0gbWFya2Rvd247XHJcbiAgLy8gRmVuY2VkIGNvZGUgYmxvY2tzIFx1MjE5MiBrZWVwIGNvbnRlbnRcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9gYGBcXHcqXFxuKFtcXHNcXFNdKj8pYGBgL2csIFwiJDFcIik7XHJcbiAgLy8gUmVtb3ZlIGhlYWRpbmcgbWFya2Vyc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14jezEsNn0gL2dtLCBcIlwiKTtcclxuICAvLyBCb2xkL2l0YWxpYyBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwqezEsM318X3sxLDN9L2csIFwiXCIpO1xyXG4gIC8vIElubGluZSBjb2RlIFx1MjE5MiB1bndyYXBcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9gKFteYF0rKWAvZywgXCIkMVwiKTtcclxuICAvLyBJbWFnZXMgXHUyMTkyIGFsdCB0ZXh0XHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKFteKV0rXFwpL2csIFwiJDFcIik7XHJcbiAgLy8gTGlua3MgXHUyMTkyIGxpbmsgdGV4dFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKFteKV0rXFwpL2csIFwiJDFcIik7XHJcbiAgLy8gQmxvY2txdW90ZXNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9ePiAvZ20sIFwiXCIpO1xyXG4gIC8vIExpc3QgbWFya2Vyc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL15bLSorXFxkLl0gL2dtLCBcIlwiKTtcclxuICAvLyBIb3Jpem9udGFsIHJ1bGVzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlstKl9dezMsfVxccyokL2dtLCBcIlwiKTtcclxuICAvLyBDb2xsYXBzZSBtdWx0aXBsZSBibGFuayBsaW5lc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XHJcbiAgcmV0dXJuIHRleHQudHJpbSgpO1xyXG59XHJcblxyXG5jb25zdCBGUk9OVE1BVFRFUl9URU1QTEFURSA9IGAtLS1cclxudGl0bGU6IFxyXG5zbHVnOiBcclxuZXhjZXJwdDogXHJcbnR5cGU6IGJsb2dcclxuc3RhdHVzOiBkcmFmdFxyXG50YWdzOiBbXVxyXG5waWxsYXI6IFxyXG5jb3ZlckltYWdlOiBcclxuZmVhdHVyZWQ6IGZhbHNlXHJcbm1ldGFUaXRsZTogXHJcbm1ldGFEZXNjcmlwdGlvbjogXHJcbm9nSW1hZ2U6IFxyXG52aWRlb1VybDogXHJcbmNhbm9uaWNhbFVybDogXHJcbnN5bmRpY2F0aW9uOiBbXVxyXG4tLS1cclxuXHJcbmA7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3NzZVB1Ymxpc2hlclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcbiAgc2V0dGluZ3M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4gIHByaXZhdGUgc3RhdHVzQmFyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBhdXRvUHVibGlzaFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgYXV0b1B1Ymxpc2hSZWdpc3RlcmVkID0gZmFsc2U7XHJcblxyXG4gIGFzeW5jIG9ubG9hZCgpIHtcclxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcbiAgICB0aGlzLm1pZ3JhdGVTZXR0aW5ncygpO1xyXG5cclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcclxuXHJcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJzZW5kXCIsIFwiUG9zc2UgcHVibGlzaFwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgcHVibGlzaFwiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2gtZHJhZnRcIixcclxuICAgICAgbmFtZTogXCJQb3NzZSBwdWJsaXNoIGFzIGRyYWZ0XCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcImRyYWZ0XCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1saXZlXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgcHVibGlzaCBsaXZlXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcInB1Ymxpc2hlZFwiKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLWluc2VydC10ZW1wbGF0ZVwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIGluc2VydCBmcm9udG1hdHRlciB0ZW1wbGF0ZVwiLFxyXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcclxuICAgICAgICBpZiAoY29udGVudC50cmltU3RhcnQoKS5zdGFydHNXaXRoKFwiLS0tXCIpKSB7XHJcbiAgICAgICAgICBuZXcgTm90aWNlKFwiRnJvbnRtYXR0ZXIgYWxyZWFkeSBleGlzdHMgaW4gdGhpcyBub3RlXCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDAsIDApO1xyXG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoRlJPTlRNQVRURVJfVEVNUExBVEUsIHsgbGluZTogMCwgY2g6IDAgfSk7XHJcbiAgICAgICAgLy8gUGxhY2UgY3Vyc29yIG9uIHRoZSB0aXRsZSBsaW5lXHJcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcigxLCA3KTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXRvLWFsbFwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIHRvIGFsbCBkZXN0aW5hdGlvbnNcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VUb0FsbCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2Utc3RhdHVzXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2Ugc3RhdHVzIFx1MjAxNCB2aWV3IHN5bmRpY2F0aW9uXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBvc3NlU3RhdHVzKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBvc3NlUHVibGlzaGVyU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuICAgIHRoaXMucmVnaXN0ZXJBdXRvUHVibGlzaCgpO1xyXG4gIH1cclxuXHJcbiAgb251bmxvYWQoKSB7XHJcbiAgICB0aGlzLnN0YXR1c0JhckVsID0gbnVsbDtcclxuICAgIGlmICh0aGlzLmF1dG9QdWJsaXNoVGltZXIpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b1B1Ymxpc2hUaW1lcik7XHJcbiAgICAgIHRoaXMuYXV0b1B1Ymxpc2hUaW1lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWdpc3RlciAob3Igc2tpcCkgdGhlIHZhdWx0ICdtb2RpZnknIGV2ZW50IGxpc3RlbmVyIGZvciBhdXRvLXB1Ymxpc2guXHJcbiAgICogT25seSBwdWJsaXNoZXMgZmlsZXMgdGhhdCBoYXZlIGBzdGF0dXM6IHB1Ymxpc2hlZGAgaW4gZnJvbnRtYXR0ZXIgdG9cclxuICAgKiBhdm9pZCBhY2NpZGVudGFsbHkgcHVzaGluZyBkcmFmdHMuIERlYm91bmNlcyBzYXZlcyBieSAzIHNlY29uZHMgc29cclxuICAgKiByYXBpZCBrZXlzdHJva2VzIGRvbid0IHRyaWdnZXIgbXVsdGlwbGUgQVBJIGNhbGxzLlxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyQXV0b1B1Ymxpc2goKSB7XHJcbiAgICBpZiAodGhpcy5hdXRvUHVibGlzaFJlZ2lzdGVyZWQpIHJldHVybjtcclxuICAgIHRoaXMuYXV0b1B1Ymxpc2hSZWdpc3RlcmVkID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcbiAgICAgIHRoaXMuYXBwLnZhdWx0Lm9uKFwibW9kaWZ5XCIsIChmaWxlKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzLmF1dG9QdWJsaXNoT25TYXZlKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB8fCBmaWxlLmV4dGVuc2lvbiAhPT0gXCJtZFwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE9ubHkgYXV0by1wdWJsaXNoIGlmIHRoZSBub3RlIGhhcyBzdGF0dXM6IHB1Ymxpc2hlZFxyXG4gICAgICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XHJcbiAgICAgICAgY29uc3QgZm0gPSBjYWNoZT8uZnJvbnRtYXR0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKCFmbSB8fCBmbS5zdGF0dXMgIT09IFwicHVibGlzaGVkXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRGVib3VuY2UgXHUyMDE0IHdhaXQgM3MgYWZ0ZXIgbGFzdCBzYXZlIGJlZm9yZSBwdWJsaXNoaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1B1Ymxpc2hUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b1B1Ymxpc2hUaW1lcik7XHJcbiAgICAgICAgdGhpcy5hdXRvUHVibGlzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF1dG9QdWJsaXNoVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgdm9pZCB0aGlzLmF1dG9QdWJsaXNoRmlsZShmaWxlKTtcclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgICAgfSksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqIEF1dG8tcHVibGlzaCBhIGZpbGUgdG8gdGhlIGNvbmZpZ3VyZWQgZGVzdGluYXRpb24gKG5vIGNvbmZpcm1hdGlvbiBtb2RhbCkuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBhdXRvUHVibGlzaEZpbGUoZmlsZTogVEZpbGUpIHtcclxuICAgIGNvbnN0IGRlc3QgPSB0aGlzLnJlc29sdmVBdXRvUHVibGlzaERlc3RpbmF0aW9uKCk7XHJcbiAgICBpZiAoIWRlc3QpIHJldHVybjtcclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3QpKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKGZpbGUpO1xyXG4gICAgLy8gU2tpcCBmaWxlcyB3aXRob3V0IGEgdGl0bGUgKGxpa2VseSBub3QgcmVhbCBjb250ZW50KVxyXG4gICAgaWYgKCFwYXlsb2FkLnRpdGxlIHx8IHBheWxvYWQudGl0bGUgPT09IFwiVW50aXRsZWRcIikgcmV0dXJuO1xyXG5cclxuICAgIGF3YWl0IHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdCwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgfVxyXG5cclxuICAvKiogUmVzb2x2ZSB3aGljaCBkZXN0aW5hdGlvbiB0byB1c2UgZm9yIGF1dG8tcHVibGlzaC4gKi9cclxuICBwcml2YXRlIHJlc29sdmVBdXRvUHVibGlzaERlc3RpbmF0aW9uKCk6IERlc3RpbmF0aW9uIHwgbnVsbCB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucywgYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbiB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAvLyBJZiBhIHNwZWNpZmljIGRlc3RpbmF0aW9uIGlzIG5hbWVkLCBmaW5kIGl0XHJcbiAgICBpZiAoYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbikge1xyXG4gICAgICBjb25zdCBtYXRjaCA9IGRlc3RpbmF0aW9ucy5maW5kKChkKSA9PiBkLm5hbWUgPT09IGF1dG9QdWJsaXNoRGVzdGluYXRpb24pO1xyXG4gICAgICBpZiAobWF0Y2gpIHJldHVybiBtYXRjaDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGYWxsYmFjazogZmlyc3QgY3VzdG9tLWFwaSBkZXN0aW5hdGlvblxyXG4gICAgcmV0dXJuIGRlc3RpbmF0aW9ucy5maW5kKChkKSA9PiBkLnR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgLy8gTWlncmF0ZSB2MSBzaW5nbGUtc2l0ZSBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIixcclxuICAgICAgICAgIHVybDogcmF3LnNpdGVVcmwsXHJcbiAgICAgICAgICBhcGlLZXk6IChyYXcuYXBpS2V5IGFzIHN0cmluZykgfHwgXCJcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVVcmw7XHJcbiAgICAgIGRlbGV0ZSByYXcuYXBpS2V5O1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBNaWdyYXRlIHNpdGVzIFx1MjE5MiBkZXN0aW5hdGlvbnMga2V5XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcuc2l0ZXMpICYmICFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IHJhdy5zaXRlcyBhcyBEZXN0aW5hdGlvbltdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVzO1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpIGFzIFBhcnRpYWw8UG9zc2VQdWJsaXNoZXJTZXR0aW5ncz4pO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGlja1NpdGVBbmRQdWJsaXNoKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdm9pZCB0aGlzLnByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uc1swXSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBuZXcgU2l0ZVBpY2tlck1vZGFsKHRoaXMuYXBwLCBkZXN0aW5hdGlvbnMsIChkZXN0KSA9PiB7XHJcbiAgICAgIHZvaWQgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0LCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICB9KS5vcGVuKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZCB0aGUgcHVibGlzaCBwYXlsb2FkIGZyb20gdGhlIGFjdGl2ZSBmaWxlIGFuZCBzZXR0aW5ncy5cclxuICAgKiBTaGFyZWQgYnkgcHJlcGFyZVB1Ymxpc2goKSBhbmQgcG9zc2VUb0FsbCgpIHRvIGF2b2lkIGR1cGxpY2F0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgYnVpbGRQYXlsb2FkKFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgICBvdmVycmlkZVN0YXR1cz86IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCIsXHJcbiAgKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4ge1xyXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcclxuICAgIGNvbnN0IGZyb250bWF0dGVyID0gYnVpbGRGcm9udG1hdHRlcihmaWxlQ2FjaGU/LmZyb250bWF0dGVyKTtcclxuICAgIGNvbnN0IGJvZHkgPSBleHRyYWN0Qm9keShjb250ZW50KTtcclxuICAgIGNvbnN0IHByb2Nlc3NlZEJvZHkgPSB0aGlzLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXggPyBwcmVwcm9jZXNzQ29udGVudChib2R5KSA6IGJvZHk7XHJcbiAgICBjb25zdCB0aXRsZSA9IGZyb250bWF0dGVyLnRpdGxlIHx8IGZpbGUuYmFzZW5hbWUgfHwgXCJVbnRpdGxlZFwiO1xyXG4gICAgY29uc3Qgc2x1ZyA9IGZyb250bWF0dGVyLnNsdWcgfHwgdG9TbHVnKHRpdGxlKTtcclxuICAgIGNvbnN0IHN0YXR1cyA9IG92ZXJyaWRlU3RhdHVzIHx8IGZyb250bWF0dGVyLnN0YXR1cyB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRTdGF0dXM7XHJcbiAgICBjb25zdCBwb3N0VHlwZSA9IGZyb250bWF0dGVyLnR5cGUgfHwgXCJibG9nXCI7XHJcbiAgICAvLyBVc2UgZnJvbnRtYXR0ZXIgY2Fub25pY2FsVXJsIG92ZXJyaWRlIGlmIHByZXNlbnQ7IG90aGVyd2lzZSBhdXRvLWdlbmVyYXRlXHJcbiAgICBjb25zdCBjYW5vbmljYWxVcmwgPVxyXG4gICAgICBmcm9udG1hdHRlci5jYW5vbmljYWxVcmwgfHxcclxuICAgICAgKHRoaXMuc2V0dGluZ3MuY2Fub25pY2FsQmFzZVVybFxyXG4gICAgICAgID8gYCR7dGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwb3N0VHlwZX0vJHtzbHVnfWBcclxuICAgICAgICA6IFwiXCIpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdGl0bGUsXHJcbiAgICAgIHNsdWcsXHJcbiAgICAgIGJvZHk6IHByb2Nlc3NlZEJvZHksXHJcbiAgICAgIGV4Y2VycHQ6IGZyb250bWF0dGVyLmV4Y2VycHQgfHwgXCJcIixcclxuICAgICAgdHlwZTogcG9zdFR5cGUsXHJcbiAgICAgIHN0YXR1cyxcclxuICAgICAgdGFnczogZnJvbnRtYXR0ZXIudGFncyB8fCBbXSxcclxuICAgICAgcGlsbGFyOiBmcm9udG1hdHRlci5waWxsYXIgfHwgXCJcIixcclxuICAgICAgZmVhdHVyZWQ6IGZyb250bWF0dGVyLmZlYXR1cmVkIHx8IGZhbHNlLFxyXG4gICAgICBjb3ZlckltYWdlOiBmcm9udG1hdHRlci5jb3ZlckltYWdlIHx8IFwiXCIsXHJcbiAgICAgIG1ldGFUaXRsZTogZnJvbnRtYXR0ZXIubWV0YVRpdGxlIHx8IFwiXCIsXHJcbiAgICAgIG1ldGFEZXNjcmlwdGlvbjogZnJvbnRtYXR0ZXIubWV0YURlc2NyaXB0aW9uIHx8IFwiXCIsXHJcbiAgICAgIG9nSW1hZ2U6IGZyb250bWF0dGVyLm9nSW1hZ2UgfHwgXCJcIixcclxuICAgICAgdmlkZW9Vcmw6IGZyb250bWF0dGVyLnZpZGVvVXJsIHx8IFwiXCIsXHJcbiAgICAgIC4uLihjYW5vbmljYWxVcmwgJiYgeyBjYW5vbmljYWxVcmwgfSksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBwcmVwYXJlUHVibGlzaChkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sIG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcbiAgICBpZiAoIXZpZXcgfHwgIXZpZXcuZmlsZSkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiT3BlbiBhIE1hcmtkb3duIGZpbGUgZmlyc3RcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0aW5hdGlvbikpIHtcclxuICAgICAgbmV3IE5vdGljZShgQ29uZmlndXJlIGNyZWRlbnRpYWxzIGZvciBcIiR7ZGVzdGluYXRpb24ubmFtZX1cIiBpbiBzZXR0aW5nc2ApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKHZpZXcuZmlsZSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG5cclxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoKSB7XHJcbiAgICAgIG5ldyBDb25maXJtUHVibGlzaE1vZGFsKHRoaXMuYXBwLCBwYXlsb2FkLCBkZXN0aW5hdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgIHZvaWQgdGhpcy5wdWJsaXNoVG9EZXN0aW5hdGlvbihkZXN0aW5hdGlvbiwgcGF5bG9hZCwgdmlldy5maWxlISk7XHJcbiAgICAgIH0pLm9wZW4oKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZvaWQgdGhpcy5wdWJsaXNoVG9EZXN0aW5hdGlvbihkZXN0aW5hdGlvbiwgcGF5bG9hZCwgdmlldy5maWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBSb3V0ZSBhIHB1Ymxpc2ggdG8gdGhlIGNvcnJlY3QgcGxhdGZvcm0gaGFuZGxlci4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb0Rlc3RpbmF0aW9uKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIHN3aXRjaCAoZGVzdGluYXRpb24udHlwZSkge1xyXG4gICAgICBjYXNlIFwiZGV2dG9cIjpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9EZXZUbyhkZXN0aW5hdGlvbiwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgICAgIGNhc2UgXCJtYXN0b2RvblwiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb01hc3RvZG9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcImJsdWVza3lcIjpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9CbHVlc2t5KGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcIm1lZGl1bVwiOlxyXG4gICAgICBjYXNlIFwicmVkZGl0XCI6XHJcbiAgICAgIGNhc2UgXCJ0aHJlYWRzXCI6XHJcbiAgICAgIGNhc2UgXCJsaW5rZWRpblwiOlxyXG4gICAgICBjYXNlIFwiZWNlbmN5XCI6XHJcbiAgICAgICAgbmV3IE5vdGljZShgJHtkZXN0aW5hdGlvbi5uYW1lfTogJHtkZXN0aW5hdGlvbi50eXBlfSBzdXBwb3J0IGlzIGNvbWluZyBpbiBhIGZ1dHVyZSB1cGRhdGVgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvQ3VzdG9tQXBpKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIGEgY3VzdG9tIC9hcGkvcHVibGlzaCBlbmRwb2ludC4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb0N1c3RvbUFwaShcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgY29uc3Qgc3RhdHVzID0gcGF5bG9hZC5zdGF0dXMgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiAke2Rlc3RpbmF0aW9uLm5hbWV9Li4uYCk7XHJcbiAgICAgIGNvbnN0IHVybCA9IGAke2Rlc3RpbmF0aW9uLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9L2FwaS9wdWJsaXNoYDtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmwsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwieC1wdWJsaXNoLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGxldCB2ZXJiID0gXCJQT1NTRWRcIjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBpZiAoanNvbj8udXBzZXJ0ZWQpIHZlcmIgPSBcIlVwZGF0ZWRcIjtcclxuICAgICAgICB9IGNhdGNoIHsgLyogbm9uLUpTT04gKi8gfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYCR7dmVyYn0gXCIke3RpdGxlfVwiIG9uICR7ZGVzdGluYXRpb24ubmFtZX0gYXMgJHtzdGF0dXN9YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhkZXN0aW5hdGlvbi5uYW1lKTtcclxuICAgICAgICBsZXQgc3luZGljYXRpb25Vcmw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QganNvbiA9IHJlc3BvbnNlLmpzb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBzeW5kaWNhdGlvblVybCA9IChqc29uPy51cmwgYXMgc3RyaW5nKSB8fFxyXG4gICAgICAgICAgICBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3BheWxvYWQuc2x1ZyBhcyBzdHJpbmd9YDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHN5bmRpY2F0aW9uVXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwYXlsb2FkLnNsdWcgYXMgc3RyaW5nfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBzeW5kaWNhdGlvblVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZXJyb3JEZXRhaWwgPSAoanNvbj8uZXJyb3IgYXMgc3RyaW5nKSB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFIHRvICR7ZGVzdGluYXRpb24ubmFtZX0gZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0UgZXJyb3IgKCR7ZGVzdGluYXRpb24ubmFtZX0pOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIERldi50byB2aWEgdGhlaXIgYXJ0aWNsZXMgQVBJLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGV2VG8oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgRGV2LnRvICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCB0YWdzID0gKChwYXlsb2FkLnRhZ3MgYXMgc3RyaW5nW10pIHx8IFtdKVxyXG4gICAgICAgIC5zbGljZSgwLCA0KVxyXG4gICAgICAgIC5tYXAoKHQpID0+IHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywgXCJcIikpO1xyXG4gICAgICBjb25zdCBhcnRpY2xlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcclxuICAgICAgICB0aXRsZSxcclxuICAgICAgICBib2R5X21hcmtkb3duOiBwYXlsb2FkLmJvZHkgYXMgc3RyaW5nLFxyXG4gICAgICAgIHB1Ymxpc2hlZDogcGF5bG9hZC5zdGF0dXMgPT09IFwicHVibGlzaGVkXCIsXHJcbiAgICAgICAgdGFncyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCIsXHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChwYXlsb2FkLmNhbm9uaWNhbFVybCkgYXJ0aWNsZS5jYW5vbmljYWxfdXJsID0gcGF5bG9hZC5jYW5vbmljYWxVcmw7XHJcbiAgICAgIGlmIChwYXlsb2FkLmNvdmVySW1hZ2UpIGFydGljbGUubWFpbl9pbWFnZSA9IHBheWxvYWQuY292ZXJJbWFnZTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9kZXYudG8vYXBpL2FydGljbGVzXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiYXBpLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFydGljbGUgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCBqc29uID0gcmVzcG9uc2UuanNvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBhcnRpY2xlVXJsOiBzdHJpbmcgPSAoanNvbj8udXJsIGFzIHN0cmluZykgfHwgXCJodHRwczovL2Rldi50b1wiO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gRGV2LnRvYCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIkRldi50b1wiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgYXJ0aWNsZVVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZXJyb3JEZXRhaWwgPSAoanNvbj8uZXJyb3IgYXMgc3RyaW5nKSB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYERldi50byBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBEZXYudG8gZXJyb3I6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gTWFzdG9kb24gYnkgcG9zdGluZyBhIHN0YXR1cyB3aXRoIHRoZSBjYW5vbmljYWwgbGluay4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb01hc3RvZG9uKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIE1hc3RvZG9uICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCBleGNlcnB0ID0gKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSBbdGl0bGUsIGV4Y2VycHQsIGNhbm9uaWNhbFVybF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIik7XHJcbiAgICAgIGNvbnN0IGluc3RhbmNlVXJsID0gKGRlc3RpbmF0aW9uLmluc3RhbmNlVXJsIHx8IFwiXCIpLnJlcGxhY2UoL1xcLyQvLCBcIlwiKTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IGAke2luc3RhbmNlVXJsfS9hcGkvdjEvc3RhdHVzZXNgLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke2Rlc3RpbmF0aW9uLmFjY2Vzc1Rva2VufWAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN0YXR1czogc3RhdHVzVGV4dCwgdmlzaWJpbGl0eTogXCJwdWJsaWNcIiB9KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c1VybDogc3RyaW5nID0gKGpzb24/LnVybCBhcyBzdHJpbmcpIHx8IGluc3RhbmNlVXJsO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gTWFzdG9kb25gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiTWFzdG9kb25cIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHN0YXR1c1VybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZXJyb3JEZXRhaWwgPSAoanNvbj8uZXJyb3IgYXMgc3RyaW5nKSB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYE1hc3RvZG9uIFBPU1NFIGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYE1hc3RvZG9uIGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIEJsdWVza3kgdmlhIEFUIFByb3RvY29sLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQmx1ZXNreShcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBCbHVlc2t5ICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG5cclxuICAgICAgLy8gQXV0aGVudGljYXRlXHJcbiAgICAgIGNvbnN0IGF1dGhSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8uc2VydmVyLmNyZWF0ZVNlc3Npb25cIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBpZGVudGlmaWVyOiBkZXN0aW5hdGlvbi5oYW5kbGUsXHJcbiAgICAgICAgICBwYXNzd29yZDogZGVzdGluYXRpb24uYXBwUGFzc3dvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoYXV0aFJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCBhdXRoUmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgYXV0aCBmYWlsZWQ6ICR7YXV0aFJlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgeyBkaWQsIGFjY2Vzc0p3dCB9ID0gYXV0aFJlc3BvbnNlLmpzb24gYXMgeyBkaWQ6IHN0cmluZzsgYWNjZXNzSnd0OiBzdHJpbmcgfTtcclxuXHJcbiAgICAgIC8vIEJ1aWxkIHBvc3QgdGV4dCAoMzAwIGNoYXIgbGltaXQpXHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGV4Y2VycHQgPSAocGF5bG9hZC5leGNlcnB0IGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3QgYmFzZVRleHQgPSBbdGl0bGUsIGV4Y2VycHRdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFx1MjAxNCBcIik7XHJcbiAgICAgIGNvbnN0IG1heFRleHQgPSAzMDAgLSAoY2Fub25pY2FsVXJsID8gY2Fub25pY2FsVXJsLmxlbmd0aCArIDEgOiAwKTtcclxuICAgICAgY29uc3QgdGV4dCA9IChiYXNlVGV4dC5sZW5ndGggPiBtYXhUZXh0XHJcbiAgICAgICAgPyBiYXNlVGV4dC5zdWJzdHJpbmcoMCwgbWF4VGV4dCAtIDEpICsgXCJcdTIwMjZcIlxyXG4gICAgICAgIDogYmFzZVRleHRcclxuICAgICAgKSArIChjYW5vbmljYWxVcmwgPyBgICR7Y2Fub25pY2FsVXJsfWAgOiBcIlwiKTtcclxuXHJcbiAgICAgIGNvbnN0IHBvc3RSZWNvcmQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xyXG4gICAgICAgICR0eXBlOiBcImFwcC5ic2t5LmZlZWQucG9zdFwiLFxyXG4gICAgICAgIHRleHQsXHJcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgbGFuZ3M6IFtcImVuXCJdLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoY2Fub25pY2FsVXJsKSB7XHJcbiAgICAgICAgY29uc3QgdXJsU3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKGNhbm9uaWNhbFVybCk7XHJcbiAgICAgICAgcG9zdFJlY29yZC5mYWNldHMgPSBbe1xyXG4gICAgICAgICAgaW5kZXg6IHsgYnl0ZVN0YXJ0OiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGV4dC5zdWJzdHJpbmcoMCwgdXJsU3RhcnQpKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICBieXRlRW5kOiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh0ZXh0LnN1YnN0cmluZygwLCB1cmxTdGFydCArIGNhbm9uaWNhbFVybC5sZW5ndGgpKS5sZW5ndGggfSxcclxuICAgICAgICAgIGZlYXR1cmVzOiBbeyAkdHlwZTogXCJhcHAuYnNreS5yaWNodGV4dC5mYWNldCNsaW5rXCIsIHVyaTogY2Fub25pY2FsVXJsIH1dLFxyXG4gICAgICAgIH1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8ucmVwby5jcmVhdGVSZWNvcmRcIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHthY2Nlc3NKd3R9YCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIHJlcG86IGRpZCxcclxuICAgICAgICAgIGNvbGxlY3Rpb246IFwiYXBwLmJza3kuZmVlZC5wb3N0XCIsXHJcbiAgICAgICAgICByZWNvcmQ6IHBvc3RSZWNvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoY3JlYXRlUmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiBjcmVhdGVSZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCBjcmVhdGVKc29uID0gY3JlYXRlUmVzcG9uc2UuanNvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCB1cmk6IHN0cmluZyA9IChjcmVhdGVKc29uPy51cmkgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICAgIGNvbnN0IHBvc3RVcmwgPSB1cmlcclxuICAgICAgICAgID8gYGh0dHBzOi8vYnNreS5hcHAvcHJvZmlsZS8ke2Rlc3RpbmF0aW9uLmhhbmRsZX0vcG9zdC8ke3VyaS5zcGxpdChcIi9cIikucG9wKCl9YFxyXG4gICAgICAgICAgOiBcImh0dHBzOi8vYnNreS5hcHBcIjtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIEJsdWVza3lgKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiQmx1ZXNreVwiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgcG9zdFVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGNyZWF0ZUpzb24gPSBjcmVhdGVSZXNwb25zZS5qc29uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZXJyb3JEZXRhaWwgPSBTdHJpbmcoKGNyZWF0ZUpzb24/Lm1lc3NhZ2UgYXMgc3RyaW5nKSB8fCBjcmVhdGVSZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhjcmVhdGVSZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBCbHVlc2t5IGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQT1NTRSB0byBhbGwgY29uZmlndXJlZCBkZXN0aW5hdGlvbnMgYXQgb25jZS4gKi9cclxuICBwcml2YXRlIGFzeW5jIHBvc3NlVG9BbGwob3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucyB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJBZGQgYXQgbGVhc3Qgb25lIGRlc3RpbmF0aW9uIGluIHNldHRpbmdzXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgTWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKHZpZXcuZmlsZSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG4gICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke1N0cmluZyhwYXlsb2FkLnRpdGxlKX1cIiB0byAke2Rlc3RpbmF0aW9ucy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpLi4uYCk7XHJcbiAgICBmb3IgKGNvbnN0IGRlc3Qgb2YgZGVzdGluYXRpb25zKSB7XHJcbiAgICAgIGlmICh0aGlzLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdCkpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3QsIHBheWxvYWQsIHZpZXcuZmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgU2tpcHBpbmcgXCIke2Rlc3QubmFtZX1cIiBcdTIwMTQgY3JlZGVudGlhbHMgbm90IGNvbmZpZ3VyZWRgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrIHdoZXRoZXIgYSBkZXN0aW5hdGlvbiBoYXMgdGhlIHJlcXVpcmVkIGNyZWRlbnRpYWxzIGNvbmZpZ3VyZWQuICovXHJcbiAgaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0OiBEZXN0aW5hdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoIChkZXN0LnR5cGUpIHtcclxuICAgICAgY2FzZSBcImRldnRvXCI6ICAgIHJldHVybiAhIWRlc3QuYXBpS2V5O1xyXG4gICAgICBjYXNlIFwibWFzdG9kb25cIjogcmV0dXJuICEhKGRlc3QuaW5zdGFuY2VVcmwgJiYgZGVzdC5hY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJibHVlc2t5XCI6ICByZXR1cm4gISEoZGVzdC5oYW5kbGUgJiYgZGVzdC5hcHBQYXNzd29yZCk7XHJcbiAgICAgIGNhc2UgXCJtZWRpdW1cIjogICByZXR1cm4gISFkZXN0Lm1lZGl1bVRva2VuO1xyXG4gICAgICBjYXNlIFwicmVkZGl0XCI6ICAgcmV0dXJuICEhKGRlc3QucmVkZGl0Q2xpZW50SWQgJiYgZGVzdC5yZWRkaXRDbGllbnRTZWNyZXQgJiYgZGVzdC5yZWRkaXRSZWZyZXNoVG9rZW4pO1xyXG4gICAgICBjYXNlIFwidGhyZWFkc1wiOiAgcmV0dXJuICEhKGRlc3QudGhyZWFkc1VzZXJJZCAmJiBkZXN0LnRocmVhZHNBY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJsaW5rZWRpblwiOiByZXR1cm4gISEoZGVzdC5saW5rZWRpbkFjY2Vzc1Rva2VuICYmIGRlc3QubGlua2VkaW5QZXJzb25Vcm4pO1xyXG4gICAgICBjYXNlIFwiZWNlbmN5XCI6ICAgcmV0dXJuICEhKGRlc3QuaGl2ZVVzZXJuYW1lICYmIGRlc3QuaGl2ZVBvc3RpbmdLZXkpO1xyXG4gICAgICBkZWZhdWx0OiAgICAgICAgIHJldHVybiAhIShkZXN0LnVybCAmJiBkZXN0LmFwaUtleSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogV3JpdGUgYSBzeW5kaWNhdGlvbiBlbnRyeSBiYWNrIGludG8gdGhlIG5vdGUncyBmcm9udG1hdHRlci4gVXBkYXRlcyB0aGUgVVJMIGlmIHRoZSBkZXN0aW5hdGlvbiBhbHJlYWR5IGV4aXN0cy4gKi9cclxuICBwcml2YXRlIGFzeW5jIHdyaXRlU3luZGljYXRpb24oZmlsZTogVEZpbGUsIG5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcclxuICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZm06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XHJcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShmbS5zeW5kaWNhdGlvbikpIGZtLnN5bmRpY2F0aW9uID0gW107XHJcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBmbS5zeW5kaWNhdGlvbiBhcyBBcnJheTx7IG5hbWU/OiBzdHJpbmc7IHVybD86IHN0cmluZyB9PjtcclxuICAgICAgY29uc3QgZXhpc3RpbmcgPSBlbnRyaWVzLmZpbmQoKHMpID0+IHMubmFtZSA9PT0gbmFtZSk7XHJcbiAgICAgIGlmIChleGlzdGluZykge1xyXG4gICAgICAgIGV4aXN0aW5nLnVybCA9IHVybDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbnRyaWVzLnB1c2goeyB1cmwsIG5hbWUgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93U3RhdHVzQmFyU3VjY2VzcyhzaXRlTmFtZTogc3RyaW5nKSB7XHJcbiAgICBpZiAoIXRoaXMuc3RhdHVzQmFyRWwpIHJldHVybjtcclxuICAgIHRoaXMuc3RhdHVzQmFyRWwuc2V0VGV4dChgUE9TU0VkIFx1MjcxMyAke3NpdGVOYW1lfWApO1xyXG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5zdGF0dXNCYXJFbCkgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KFwiXCIpO1xyXG4gICAgfSwgNTAwMCk7XHJcbiAgfVxyXG5cclxuICAvKiogU2hvdyBjdXJyZW50IHN5bmRpY2F0aW9uIHN0YXR1cyBmb3IgdGhlIGFjdGl2ZSBub3RlLiAqL1xyXG4gIHByaXZhdGUgcG9zc2VTdGF0dXMoKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgTWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZmlsZUNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUodmlldy5maWxlKTtcclxuICAgIGNvbnN0IGZtID0gZmlsZUNhY2hlPy5mcm9udG1hdHRlciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHN5bmRpY2F0aW9uOiB1bmtub3duID0gZm0/LnN5bmRpY2F0aW9uO1xyXG4gICAgY29uc3QgdGl0bGUgPSAoZm0/LnRpdGxlIGFzIHN0cmluZykgfHwgdmlldy5maWxlLmJhc2VuYW1lO1xyXG4gICAgbmV3IFBvc3NlU3RhdHVzTW9kYWwodGhpcy5hcHAsIHRpdGxlLCBzeW5kaWNhdGlvbikub3BlbigpO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIENvbmZpcm1hdGlvbiBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIENvbmZpcm1QdWJsaXNoTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbjtcclxuICBwcml2YXRlIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBhcHA6IEFwcCxcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgb25Db25maXJtOiAoKSA9PiB2b2lkLFxyXG4gICkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XHJcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9uQ29uZmlybTtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwicG9zc2UtcHVibGlzaGVyLWNvbmZpcm0tbW9kYWxcIik7XHJcblxyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkNvbmZpcm0gcG9zc2VcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBgWW91IGFyZSBhYm91dCB0byBQT1NTRSB0byAke3RoaXMuZGVzdGluYXRpb24ubmFtZX06YCxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN1bW1hcnkgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInB1Ymxpc2gtc3VtbWFyeVwiIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUaXRsZTogJHtTdHJpbmcodGhpcy5wYXlsb2FkLnRpdGxlKX1gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBTbHVnOiAke1N0cmluZyh0aGlzLnBheWxvYWQuc2x1Zyl9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgU3RhdHVzOiAke1N0cmluZyh0aGlzLnBheWxvYWQuc3RhdHVzKX1gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUeXBlOiAke1N0cmluZyh0aGlzLnBheWxvYWQudHlwZSl9YCB9KTtcclxuXHJcbiAgICBjb25zdCBidXR0b25zID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJtb2RhbC1idXR0b24tY29udGFpbmVyXCIgfSk7XHJcblxyXG4gICAgY29uc3QgY2FuY2VsQnRuID0gYnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiQ2FuY2VsXCIgfSk7XHJcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XHJcblxyXG4gICAgY29uc3QgY29uZmlybUJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICB0ZXh0OiBcIlBPU1NFXCIsXHJcbiAgICAgIGNsczogXCJtb2QtY3RhXCIsXHJcbiAgICB9KTtcclxuICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB0aGlzLm9uQ29uZmlybSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvbkNsb3NlKCkge1xyXG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBTaXRlIFBpY2tlciBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIFNpdGVQaWNrZXJNb2RhbCBleHRlbmRzIFN1Z2dlc3RNb2RhbDxEZXN0aW5hdGlvbj4ge1xyXG4gIHByaXZhdGUgZGVzdGluYXRpb25zOiBEZXN0aW5hdGlvbltdO1xyXG4gIHByaXZhdGUgb25DaG9vc2U6IChkZXN0aW5hdGlvbjogRGVzdGluYXRpb24pID0+IHZvaWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW10sIG9uQ2hvb3NlOiAoZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSA9PiB2b2lkKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gICAgdGhpcy5kZXN0aW5hdGlvbnMgPSBkZXN0aW5hdGlvbnM7XHJcbiAgICB0aGlzLm9uQ2hvb3NlID0gb25DaG9vc2U7XHJcbiAgICB0aGlzLnNldFBsYWNlaG9sZGVyKFwiQ2hvb3NlIGEgZGVzdGluYXRpb24gdG8gcG9zc2UgdG8uLi5cIik7XHJcbiAgfVxyXG5cclxuICBnZXRTdWdnZXN0aW9ucyhxdWVyeTogc3RyaW5nKTogRGVzdGluYXRpb25bXSB7XHJcbiAgICBjb25zdCBsb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gdGhpcy5kZXN0aW5hdGlvbnMuZmlsdGVyKFxyXG4gICAgICAoZCkgPT5cclxuICAgICAgICBkLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlcikgfHxcclxuICAgICAgICBkLnVybC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZW5kZXJTdWdnZXN0aW9uKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgZWw6IEhUTUxFbGVtZW50KSB7XHJcbiAgICBlbC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGRlc3RpbmF0aW9uLm5hbWUsIGNsczogXCJzdWdnZXN0aW9uLXRpdGxlXCIgfSk7XHJcbiAgICBlbC5jcmVhdGVFbChcInNtYWxsXCIsIHsgdGV4dDogZGVzdGluYXRpb24udXJsLCBjbHM6IFwic3VnZ2VzdGlvbi1ub3RlXCIgfSk7XHJcbiAgfVxyXG5cclxuICBvbkNob29zZVN1Z2dlc3Rpb24oZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSB7XHJcbiAgICB0aGlzLm9uQ2hvb3NlKGRlc3RpbmF0aW9uKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBTZXR0aW5ncyBUYWIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBQb3NzZVB1Ymxpc2hlclNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcclxuICBwbHVnaW46IFBvc3NlUHVibGlzaGVyUGx1Z2luO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQb3NzZVB1Ymxpc2hlclBsdWdpbikge1xyXG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xyXG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5KCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJZb3VyIGNhbm9uaWNhbCBzaXRlXCIpLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDYW5vbmljYWwgYmFzZSBVUkxcIilcclxuICAgICAgLnNldERlc2MoXCJZb3VyIG93biBzaXRlJ3Mgcm9vdCBVUkwuIEV2ZXJ5IHB1Ymxpc2hlZCBwb3N0IHdpbGwgaW5jbHVkZSBhIGNhbm9uaWNhbCBVUkwgcG9pbnRpbmcgaGVyZSBcdTIwMTQgdGhlIG9yaWdpbmFsIHlvdSBvd24uXCIpXHJcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgIHRleHRcclxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8veW91cnNpdGUuY29tXCIpXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY2Fub25pY2FsQmFzZVVybClcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY2Fub25pY2FsQmFzZVVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwczovL1wiKSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHA6Ly9sb2NhbGhvc3RcIikpIHtcclxuICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiV2FybmluZzogY2Fub25pY2FsIGJhc2UgVVJMIHNob3VsZCBzdGFydCB3aXRoIEhUVFBTOi8vXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJEZXN0aW5hdGlvbnNcIikuc2V0SGVhZGluZygpO1xyXG5cclxuICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5mb3JFYWNoKChkZXN0aW5hdGlvbiwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgZGVzdENvbnRhaW5lciA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7XHJcbiAgICAgICAgY2xzOiBcInBvc3NlLXB1Ymxpc2hlci1zaXRlXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKS5zZXROYW1lKGRlc3RpbmF0aW9uLm5hbWUgfHwgYERlc3RpbmF0aW9uICR7aW5kZXggKyAxfWApLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJEZXN0aW5hdGlvbiBuYW1lXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJBIGxhYmVsIGZvciB0aGlzIGRlc3RpbmF0aW9uIChlLmcuIE15IGJsb2cpXCIpXHJcbiAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIk15IHNpdGVcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLm5hbWUpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJUeXBlXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJQbGF0Zm9ybSB0byBwdWJsaXNoIHRvXCIpXHJcbiAgICAgICAgLmFkZERyb3Bkb3duKChkZCkgPT5cclxuICAgICAgICAgIGRkXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJjdXN0b20tYXBpXCIsIFwiQ3VzdG9tIEFQSVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiZGV2dG9cIiwgXCJEZXYudG9cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcIm1hc3RvZG9uXCIsIFwiTWFzdG9kb25cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImJsdWVza3lcIiwgXCJCbHVlc2t5XCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJtZWRpdW1cIiwgXCJNZWRpdW1cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcInJlZGRpdFwiLCBcIlJlZGRpdFwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwidGhyZWFkc1wiLCBcIlRocmVhZHNcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImxpbmtlZGluXCIsIFwiTGlua2VkSW5cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImVjZW5jeVwiLCBcIkVjZW5jeVwiKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udHlwZSB8fCBcImN1c3RvbS1hcGlcIilcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udHlwZSA9IHZhbHVlIGFzIERlc3RpbmF0aW9uVHlwZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnN0IGRlc3RUeXBlID0gZGVzdGluYXRpb24udHlwZSB8fCBcImN1c3RvbS1hcGlcIjtcclxuXHJcbiAgICAgIGlmIChkZXN0VHlwZSA9PT0gXCJjdXN0b20tYXBpXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJTaXRlIFVSTFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIHNpdGUncyBiYXNlIFVSTCAobXVzdCBzdGFydCB3aXRoIEhUVFBTOi8vKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJodHRwczovL2V4YW1wbGUuY29tXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnVybCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwczovL1wiKSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHA6Ly9sb2NhbGhvc3RcIikpIHtcclxuICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShcIldhcm5pbmc6IGRlc3RpbmF0aW9uIFVSTCBzaG91bGQgc3RhcnQgd2l0aCBIVFRQUzovL1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBUEkga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcImBQVUJMSVNIX0FQSV9LRVlgIGZyb20geW91ciBzaXRlJ3MgZW52aXJvbm1lbnRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwaUtleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBpS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiZGV2dG9cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkRldi50byBBUEkga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gaHR0cHM6Ly9kZXYudG8vc2V0dGluZ3MvZXh0ZW5zaW9uc1wiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGRldi50byBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwaUtleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBpS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibWFzdG9kb25cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkluc3RhbmNlIFVSTFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIE1hc3RvZG9uIGluc3RhbmNlIChlLmcuIGh0dHBzOi8vbWFzdG9kb24uc29jaWFsKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJIVFRQUzovL21hc3RvZG9uLnNvY2lhbFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5pbnN0YW5jZVVybCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaW5zdGFuY2VVcmwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSB5b3VyIG1hc3RvZG9uIGFjY291bnQ6IHNldHRpbmdzIFx1MjE5MiBkZXZlbG9wbWVudCBcdTIxOTIgbmV3IGFwcGxpY2F0aW9uXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgYWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImJsdWVza3lcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkJsdWVza3kgaGFuZGxlXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgaGFuZGxlIChlLmcuIFlvdXJuYW1lLmJza3kuc29jaWFsKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJZb3VybmFtZS5ic2t5LnNvY2lhbFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oYW5kbGUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhhbmRsZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFwcCBwYXNzd29yZFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIGh0dHBzOi8vYnNreS5hcHAvc2V0dGluZ3MvYXBwLXBhc3N3b3JkcyBcdTIwMTQgTk9UIHlvdXIgbG9naW4gcGFzc3dvcmRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJYeHh4LXh4eHgteHh4eC14eHh4XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwcFBhc3N3b3JkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcHBQYXNzd29yZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcIm1lZGl1bVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQVBJIG5vdGljZVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJUaGUgbWVkaXVtIEFQSSB3YXMgYXJjaGl2ZWQgaW4gbWFyY2ggMjAyMy4gSXQgbWF5IHN0aWxsIHdvcmsgYnV0IGNvdWxkIGJlIGRpc2NvbnRpbnVlZCBhdCBhbnkgdGltZS5cIik7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSW50ZWdyYXRpb24gdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBtZWRpdW0uY29tIFx1MjE5MiBzZXR0aW5ncyBcdTIxOTIgc2VjdXJpdHkgYW5kIGFwcHMgXHUyMTkyIGludGVncmF0aW9uIHRva2Vuc1wiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIG1lZGl1bSBpbnRlZ3JhdGlvbiB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5tZWRpdW1Ub2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubWVkaXVtVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJyZWRkaXRcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNsaWVudCBJRFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIHJlZGRpdC5jb20vcHJlZnMvYXBwcyBcdTIwMTQgY3JlYXRlIGEgXFxcInNjcmlwdFxcXCIgdHlwZSBhcHBcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiQ2xpZW50IElEXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdENsaWVudElkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRDbGllbnRJZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNsaWVudCBzZWNyZXRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJDbGllbnQgc2VjcmV0XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdENsaWVudFNlY3JldCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0Q2xpZW50U2VjcmV0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUmVmcmVzaCB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJBdXRob3JpemF0aW9uIHJlZnJlc2ggdG9rZW4gZm9yIHlvdXIgUmVkZGl0IGFjY291bnRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJSZWZyZXNoIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdFJlZnJlc2hUb2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0UmVmcmVzaFRva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUmVkZGl0IHVzZXJuYW1lXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlUveW91cm5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0VXNlcm5hbWUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdFVzZXJuYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiRGVmYXVsdCBzdWJyZWRkaXRcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiZS5nLiByL3dlYmRldiBcdTIwMTQgY2FuIGJlIG92ZXJyaWRkZW4gcGVyIG5vdGUgd2l0aCBcXFwic3VicmVkZGl0OlxcXCIgZnJvbnRtYXR0ZXJcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiUi9zdWJyZWRkaXRuYW1lXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdERlZmF1bHRTdWJyZWRkaXQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdERlZmF1bHRTdWJyZWRkaXQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJ0aHJlYWRzXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJUaHJlYWRzIHVzZXIgSURcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBudW1lcmljIHRocmVhZHMvaW5zdGFncmFtIHVzZXIgSURcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiMTIzNDU2Nzg5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnRocmVhZHNVc2VySWQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnRocmVhZHNVc2VySWQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiTG9uZy1saXZlZCB0aHJlYWRzIGFjY2VzcyB0b2tlbiB3aXRoIHRocmVhZHNfY29udGVudF9wdWJsaXNoIHBlcm1pc3Npb25cIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udGhyZWFkc0FjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS50aHJlYWRzQWNjZXNzVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJsaW5rZWRpblwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkF1dGhvcml6YXRpb24gYmVhcmVyIHRva2VuIHdpdGggd19tZW1iZXJfc29jaWFsIHNjb3BlXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgYWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmxpbmtlZGluQWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmxpbmtlZGluQWNjZXNzVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJQZXJzb24gaWRlbnRpZmllclwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIExpbmtlZEluIG1lbWJlciBpZGVudGlmaWVyXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlVybjpsaTpwZXJzb246Li4uXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmxpbmtlZGluUGVyc29uVXJuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5saW5rZWRpblBlcnNvblVybiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImVjZW5jeVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiVXNlcm5hbWVcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBhY2NvdW50IG5hbWUgb24gaHR0cHM6Ly9lY2VuY3kuY29tICh3aXRob3V0IEApXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIllvdXIgdXNlcm5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGl2ZVVzZXJuYW1lIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oaXZlVXNlcm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJQb3N0aW5nIGtleVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIHByaXZhdGUgcG9zdGluZyBrZXkgZnJvbSBodHRwczovL2VjZW5jeS5jb20gKG5vdCB0aGUgb3duZXIgb3IgYWN0aXZlIGtleSlcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCI1ay4uLlwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oaXZlUG9zdGluZ0tleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaGl2ZVBvc3RpbmdLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJDb21tdW5pdHlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiSGl2ZSBjb21tdW5pdHkgdGFnIHRvIHBvc3QgaW4gKGUuZy4gSGl2ZS0xNzQzMDEgZm9yIG9jZClcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiSGl2ZS0xNzQzMDFcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGl2ZUNvbW11bml0eSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaGl2ZUNvbW11bml0eSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiVGVzdCBjb25uZWN0aW9uXCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGx1Z2luLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdGluYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShcIkNvbmZpZ3VyZSBjcmVkZW50aWFscyBmaXJzdFwiKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlc3RUeXBlID09PSBcImN1c3RvbS1hcGlcIikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHVybCA9IGAke2Rlc3RpbmF0aW9uLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9L2FwaS9wdWJsaXNoYDtcclxuICAgICAgICAgICAgICByZXF1ZXN0VXJsKHtcclxuICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJPUFRJT05TXCIsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwieC1wdWJsaXNoLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXkgfSxcclxuICAgICAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgNDAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYENvbm5lY3Rpb24gdG8gJHtkZXN0aW5hdGlvbi5uYW1lIHx8IGRlc3RpbmF0aW9uLnVybH0gc3VjY2Vzc2Z1bGApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgJHtkZXN0aW5hdGlvbi5uYW1lIHx8IGRlc3RpbmF0aW9uLnVybH0gcmVzcG9uZGVkIHdpdGggJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbmV3IE5vdGljZShgQ291bGQgbm90IHJlYWNoICR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9YCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgQ3JlZGVudGlhbHMgbG9vayBjb25maWd1cmVkIGZvciAke2Rlc3RpbmF0aW9uLm5hbWV9LiBQdWJsaXNoIHRvIHRlc3QuYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgIClcclxuICAgICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgICBidG5cclxuICAgICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJSZW1vdmUgZGVzdGluYXRpb25cIilcclxuICAgICAgICAgICAgLnNldFdhcm5pbmcoKVxyXG4gICAgICAgICAgICAub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29uZmlybUVsID0gZGVzdENvbnRhaW5lci5jcmVhdGVEaXYoe1xyXG4gICAgICAgICAgICAgICAgY2xzOiBcInNldHRpbmctaXRlbVwiLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbmZpcm1FbC5jcmVhdGVFbChcInNwYW5cIiwge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogYFJlbW92ZSBcIiR7ZGVzdGluYXRpb24ubmFtZSB8fCBcInRoaXMgZGVzdGluYXRpb25cIn1cIj8gYCxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25zdCB5ZXNCdG4gPSBjb25maXJtRWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogXCJZZXMsIHJlbW92ZVwiLFxyXG4gICAgICAgICAgICAgICAgY2xzOiBcIm1vZC13YXJuaW5nXCIsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3Qgbm9CdG4gPSBjb25maXJtRWwuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNhbmNlbFwiIH0pO1xyXG4gICAgICAgICAgICAgIHllc0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICB2b2lkIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpLnRoZW4oKCkgPT4gdGhpcy5kaXNwbGF5KCkpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG5vQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBjb25maXJtRWwucmVtb3ZlKCkpO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICBidG5cclxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiQWRkIGRlc3RpbmF0aW9uXCIpXHJcbiAgICAgICAgICAuc2V0Q3RhKClcclxuICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwiXCIsXHJcbiAgICAgICAgICAgICAgdHlwZTogXCJjdXN0b20tYXBpXCIsXHJcbiAgICAgICAgICAgICAgdXJsOiBcIlwiLFxyXG4gICAgICAgICAgICAgIGFwaUtleTogXCJcIixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZvaWQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCkudGhlbigoKSA9PiB0aGlzLmRpc3BsYXkoKSk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIkRlZmF1bHRzXCIpLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJEZWZhdWx0IHN0YXR1c1wiKVxyXG4gICAgICAuc2V0RGVzYyhcIkRlZmF1bHQgcHVibGlzaCBzdGF0dXMgd2hlbiBub3Qgc3BlY2lmaWVkIGluIGZyb250bWF0dGVyXCIpXHJcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XHJcbiAgICAgICAgZHJvcGRvd25cclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJkcmFmdFwiLCBcIkRyYWZ0XCIpXHJcbiAgICAgICAgICAuYWRkT3B0aW9uKFwicHVibGlzaGVkXCIsIFwiUHVibGlzaGVkXCIpXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFN0YXR1cylcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFN0YXR1cyA9IHZhbHVlIGFzXHJcbiAgICAgICAgICAgICAgfCBcImRyYWZ0XCJcclxuICAgICAgICAgICAgICB8IFwicHVibGlzaGVkXCI7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQ29uZmlybSBiZWZvcmUgcHVibGlzaGluZ1wiKVxyXG4gICAgICAuc2V0RGVzYyhcIlNob3cgYSBjb25maXJtYXRpb24gbW9kYWwgd2l0aCBwb3N0IGRldGFpbHMgYmVmb3JlIHB1Ymxpc2hpbmdcIilcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb25maXJtQmVmb3JlUHVibGlzaCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIlN0cmlwIHdpa2ktbGlua3MgYW5kIGVtYmVkc1wiKVxyXG4gICAgICAuc2V0RGVzYyhcclxuICAgICAgICBcIkNvbnZlcnQgd2lraS1saW5rcywgcmVtb3ZlIGVtYmVkcywgY29tbWVudHMsIGFuZCBkYXRhdmlldyBibG9ja3MgYmVmb3JlIHB1Ymxpc2hpbmdcIixcclxuICAgICAgKVxyXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheClcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiQXV0by1wdWJsaXNoXCIpLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJBdXRvLXB1Ymxpc2ggb24gc2F2ZVwiKVxyXG4gICAgICAuc2V0RGVzYyhcclxuICAgICAgICBcIkF1dG9tYXRpY2FsbHkgcmUtcHVibGlzaCB0byB5b3VyIHNpdGUgd2hlbiB5b3Ugc2F2ZSBhIG5vdGUgdGhhdCBoYXMgc3RhdHVzOiBwdWJsaXNoZWQgaW4gaXRzIGZyb250bWF0dGVyLiBcIiArXHJcbiAgICAgICAgXCJEcmFmdHMgYXJlIG5ldmVyIGF1dG8tcHVibGlzaGVkLiBDaGFuZ2VzIGFyZSBkZWJvdW5jZWQgKDNzIGRlbGF5KSB0byBhdm9pZCByYXBpZC1maXJlIHJlcXVlc3RzLlwiLFxyXG4gICAgICApXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUHVibGlzaE9uU2F2ZSlcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1B1Ymxpc2hPblNhdmUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBjb25zdCBjdXN0b21BcGlEZXN0cyA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5maWx0ZXIoKGQpID0+IGQudHlwZSA9PT0gXCJjdXN0b20tYXBpXCIpO1xyXG4gICAgaWYgKGN1c3RvbUFwaURlc3RzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoXCJBdXRvLXB1Ymxpc2ggZGVzdGluYXRpb25cIilcclxuICAgICAgICAuc2V0RGVzYyhcIldoaWNoIGN1c3RvbS1hcGkgZGVzdGluYXRpb24gdG8gYXV0by1wdWJsaXNoIHRvLiBMZWF2ZSBlbXB0eSB0byB1c2UgdGhlIGZpcnN0IG9uZS5cIilcclxuICAgICAgICAuYWRkRHJvcGRvd24oKGRkKSA9PiB7XHJcbiAgICAgICAgICBkZC5hZGRPcHRpb24oXCJcIiwgXCJGaXJzdCBjdXN0b20tYXBpIGRlc3RpbmF0aW9uXCIpO1xyXG4gICAgICAgICAgZm9yIChjb25zdCBkIG9mIGN1c3RvbUFwaURlc3RzKSB7XHJcbiAgICAgICAgICAgIGRkLmFkZE9wdGlvbihkLm5hbWUsIGQubmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkZC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvUHVibGlzaERlc3RpbmF0aW9uKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1B1Ymxpc2hEZXN0aW5hdGlvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiBcdTI1MDBcdTI1MDAgU3VwcG9ydCBzZWN0aW9uIFx1MjUwMFx1MjUwMCAqL1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJTdXBwb3J0XCIpLnNldEhlYWRpbmcoKTtcclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgIHRleHQ6IFwiVGhpcyBwbHVnaW4gaXMgZnJlZSBhbmQgb3BlbiBzb3VyY2UuIElmIGl0IHNhdmVzIHlvdSB0aW1lLCBjb25zaWRlciBzdXBwb3J0aW5nIGl0cyBkZXZlbG9wbWVudC5cIixcclxuICAgICAgY2xzOiBcInNldHRpbmctaXRlbS1kZXNjcmlwdGlvblwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQnV5IG1lIGEgY29mZmVlXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiT25lLXRpbWUgb3IgcmVjdXJyaW5nIHN1cHBvcnRcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiU3VwcG9ydFwiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cHM6Ly9idXltZWFjb2ZmZWUuY29tL3RoZW9mZmljYWxkbVwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJHaXRIdWIgc3BvbnNvcnNcIilcclxuICAgICAgLnNldERlc2MoXCJNb250aGx5IHNwb25zb3JzaGlwIHRocm91Z2ggR2l0SHViXCIpXHJcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlNwb25zb3JcIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cub3BlbihcImh0dHBzOi8vZ2l0aHViLmNvbS9zcG9uc29ycy9UaGVPZmZpY2lhbERNXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkFsbCBmdW5kaW5nIG9wdGlvbnNcIilcclxuICAgICAgLnNldERlc2MoXCJkZXZpbm1hcnNoYWxsLmluZm8vZnVuZFwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJWaWV3XCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2RldmlubWFyc2hhbGwuaW5mby9mdW5kXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIFBPU1NFIFN0YXR1cyBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbnR5cGUgU3luZGljYXRpb25FbnRyeSA9IHsgdXJsPzogc3RyaW5nOyBuYW1lPzogc3RyaW5nIH07XHJcblxyXG5jbGFzcyBQb3NzZVN0YXR1c01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIHN5bmRpY2F0aW9uOiB1bmtub3duO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgdGl0bGU6IHN0cmluZywgc3luZGljYXRpb246IHVua25vd24pIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XHJcbiAgICB0aGlzLnN5bmRpY2F0aW9uID0gc3luZGljYXRpb247XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKSB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcInBvc3NlLXB1Ymxpc2hlci1jb25maXJtLW1vZGFsXCIpO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlBvc3NlIHN0YXR1c1wiIH0pO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IGBOb3RlOiAke1N0cmluZyh0aGlzLnRpdGxlKX1gIH0pO1xyXG5cclxuICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5pc0FycmF5KHRoaXMuc3luZGljYXRpb24pXHJcbiAgICAgID8gKHRoaXMuc3luZGljYXRpb24gYXMgU3luZGljYXRpb25FbnRyeVtdKVxyXG4gICAgICA6IFtdO1xyXG5cclxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHtcclxuICAgICAgICB0ZXh0OiBcIlRoaXMgbm90ZSBoYXMgbm90IGJlZW4gc3luZGljYXRlZCB0byBhbnkgZGVzdGluYXRpb24geWV0LlwiLFxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInN0cm9uZ1wiLCB7IHRleHQ6IGBTeW5kaWNhdGVkIHRvICR7ZW50cmllcy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpOmAgfSk7XHJcbiAgICAgIGNvbnN0IGxpc3QgPSBjb250ZW50RWwuY3JlYXRlRWwoXCJ1bFwiKTtcclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgY29uc3QgbGkgPSBsaXN0LmNyZWF0ZUVsKFwibGlcIik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnVybCkge1xyXG4gICAgICAgICAgY29uc3QgYSA9IGxpLmNyZWF0ZUVsKFwiYVwiLCB7IHRleHQ6IGVudHJ5Lm5hbWUgfHwgZW50cnkudXJsIH0pO1xyXG4gICAgICAgICAgYS5ocmVmID0gZW50cnkudXJsO1xyXG4gICAgICAgICAgYS50YXJnZXQgPSBcIl9ibGFua1wiO1xyXG4gICAgICAgICAgYS5yZWwgPSBcIm5vb3BlbmVyXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxpLnNldFRleHQoZW50cnkubmFtZSB8fCBcIlVua25vd25cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG4gICAgY29uc3QgY2xvc2VCdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDbG9zZVwiIH0pO1xyXG4gICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XHJcbiAgfVxyXG5cclxuICBvbkNsb3NlKCkge1xyXG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFXTztBQStDUCxJQUFNLG1CQUEyQztBQUFBLEVBQy9DLGNBQWMsQ0FBQztBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2Ysc0JBQXNCO0FBQUEsRUFDdEIscUJBQXFCO0FBQUEsRUFDckIsbUJBQW1CO0FBQUEsRUFDbkIsd0JBQXdCO0FBQzFCO0FBb0JBLFNBQVMsWUFBWSxTQUF5QjtBQUM1QyxRQUFNLFFBQVEsUUFBUSxNQUFNLDJDQUEyQztBQUN2RSxTQUFPLFFBQVEsTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJO0FBQ25DO0FBTUEsU0FBUyxpQkFBaUIsT0FBeUQ7QUFDakYsTUFBSSxDQUFDLE1BQU8sUUFBTyxDQUFDO0FBQ3BCLFFBQU0sS0FBa0IsQ0FBQztBQUV6QixNQUFJLE9BQU8sTUFBTSxVQUFVLFNBQVUsSUFBRyxRQUFRLE1BQU07QUFDdEQsTUFBSSxPQUFPLE1BQU0sU0FBUyxTQUFVLElBQUcsT0FBTyxNQUFNO0FBQ3BELE1BQUksT0FBTyxNQUFNLFlBQVksU0FBVSxJQUFHLFVBQVUsTUFBTTtBQUMxRCxNQUFJLE9BQU8sTUFBTSxTQUFTLFNBQVUsSUFBRyxPQUFPLE1BQU07QUFDcEQsTUFBSSxPQUFPLE1BQU0sV0FBVyxTQUFVLElBQUcsU0FBUyxNQUFNO0FBQ3hELE1BQUksT0FBTyxNQUFNLFdBQVcsU0FBVSxJQUFHLFNBQVMsTUFBTTtBQUN4RCxNQUFJLE9BQU8sTUFBTSxlQUFlLFNBQVUsSUFBRyxhQUFhLE1BQU07QUFDaEUsTUFBSSxPQUFPLE1BQU0sY0FBYyxTQUFVLElBQUcsWUFBWSxNQUFNO0FBQzlELE1BQUksT0FBTyxNQUFNLG9CQUFvQixTQUFVLElBQUcsa0JBQWtCLE1BQU07QUFDMUUsTUFBSSxPQUFPLE1BQU0sWUFBWSxTQUFVLElBQUcsVUFBVSxNQUFNO0FBQzFELE1BQUksT0FBTyxNQUFNLGFBQWEsU0FBVSxJQUFHLFdBQVcsTUFBTTtBQUU1RCxNQUFJLE9BQU8sTUFBTSxhQUFhLFVBQVcsSUFBRyxXQUFXLE1BQU07QUFBQSxXQUNwRCxNQUFNLGFBQWEsT0FBUSxJQUFHLFdBQVc7QUFFbEQsTUFBSSxNQUFNLFFBQVEsTUFBTSxJQUFJLEdBQUc7QUFDN0IsT0FBRyxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBZSxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUMzRSxXQUFXLE9BQU8sTUFBTSxTQUFTLFVBQVU7QUFDekMsT0FBRyxPQUFPLE1BQU0sS0FDYixRQUFRLFlBQVksRUFBRSxFQUN0QixNQUFNLEdBQUcsRUFDVCxJQUFJLENBQUMsTUFBYyxFQUFFLEtBQUssQ0FBQyxFQUMzQixPQUFPLE9BQU87QUFBQSxFQUNuQjtBQUVBLE1BQUksT0FBTyxNQUFNLGlCQUFpQixTQUFVLElBQUcsZUFBZSxNQUFNO0FBRXBFLFNBQU87QUFDVDtBQUdPLFNBQVMsT0FBTyxPQUF1QjtBQUM1QyxTQUFPLE1BQ0osVUFBVSxLQUFLLEVBQ2YsUUFBUSxvQkFBb0IsRUFBRSxFQUM5QixZQUFZLEVBQ1osUUFBUSxlQUFlLEdBQUcsRUFDMUIsUUFBUSxVQUFVLEVBQUU7QUFDekI7QUFNTyxTQUFTLGtCQUFrQixNQUFzQjtBQUV0RCxTQUFPLEtBQUssUUFBUSxpQkFBaUIsRUFBRTtBQUd2QyxTQUFPLEtBQUssUUFBUSxzQkFBc0IsRUFBRTtBQUc1QyxTQUFPLEtBQUssUUFBUSxnQ0FBZ0MsSUFBSTtBQUd4RCxTQUFPLEtBQUssUUFBUSxxQkFBcUIsSUFBSTtBQUc3QyxTQUFPLEtBQUssUUFBUSwyQkFBMkIsRUFBRTtBQUNqRCxTQUFPLEtBQUssUUFBUSw2QkFBNkIsRUFBRTtBQUduRCxTQUFPLEtBQUssUUFBUSxXQUFXLE1BQU07QUFFckMsU0FBTyxLQUFLLEtBQUs7QUFDbkI7QUFHQSxTQUFTLFdBQVcsS0FBcUI7QUFDdkMsU0FBTyxJQUNKLFFBQVEsTUFBTSxPQUFPLEVBQ3JCLFFBQVEsTUFBTSxNQUFNLEVBQ3BCLFFBQVEsTUFBTSxNQUFNLEVBQ3BCLFFBQVEsTUFBTSxRQUFRO0FBQzNCO0FBT08sU0FBUyxlQUFlLFVBQTBCO0FBQ3ZELE1BQUksT0FBTztBQUdYLFNBQU8sS0FBSztBQUFBLElBQVE7QUFBQSxJQUE0QixDQUFDLEdBQVcsTUFBYyxTQUN4RSxhQUFhLE9BQU8sb0JBQW9CLElBQUksTUFBTSxFQUFFLElBQUksV0FBVyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQUEsRUFDakY7QUFHQSxTQUFPLEtBQUssUUFBUSxtQkFBbUIsYUFBYTtBQUNwRCxTQUFPLEtBQUssUUFBUSxrQkFBa0IsYUFBYTtBQUNuRCxTQUFPLEtBQUssUUFBUSxpQkFBaUIsYUFBYTtBQUNsRCxTQUFPLEtBQUssUUFBUSxnQkFBZ0IsYUFBYTtBQUNqRCxTQUFPLEtBQUssUUFBUSxlQUFlLGFBQWE7QUFDaEQsU0FBTyxLQUFLLFFBQVEsY0FBYyxhQUFhO0FBRy9DLFNBQU8sS0FBSyxRQUFRLG9CQUFvQixNQUFNO0FBRzlDLFNBQU8sS0FBSyxRQUFRLGNBQWMsNkJBQTZCO0FBRy9ELFNBQU8sS0FBSyxRQUFRLHNCQUFzQiw4QkFBOEI7QUFDeEUsU0FBTyxLQUFLLFFBQVEsa0JBQWtCLHFCQUFxQjtBQUMzRCxTQUFPLEtBQUssUUFBUSxjQUFjLGFBQWE7QUFDL0MsU0FBTyxLQUFLLFFBQVEsZ0JBQWdCLDhCQUE4QjtBQUNsRSxTQUFPLEtBQUssUUFBUSxjQUFjLHFCQUFxQjtBQUN2RCxTQUFPLEtBQUssUUFBUSxZQUFZLGFBQWE7QUFHN0MsU0FBTyxLQUFLLFFBQVEsY0FBYyxpQkFBaUI7QUFHbkQsU0FBTyxLQUFLLFFBQVEsNkJBQTZCLHlCQUF5QjtBQUcxRSxTQUFPLEtBQUssUUFBUSw0QkFBNEIscUJBQXFCO0FBR3JFLFNBQU8sS0FBSyxRQUFRLGtCQUFrQixhQUFhO0FBR25ELFNBQU8sS0FBSyxRQUFRLGtCQUFrQixhQUFhO0FBR25ELFNBQU8sS0FBSyxRQUFRLDZCQUE2QixDQUFDLFVBQVUsT0FBTyxLQUFLLE9BQU87QUFHL0UsU0FBTyxLQUNKLE1BQU0sT0FBTyxFQUNiLElBQUksQ0FBQyxVQUFVO0FBQ2QsVUFBTSxVQUFVLE1BQU0sS0FBSztBQUMzQixRQUFJLENBQUMsUUFBUyxRQUFPO0FBQ3JCLFFBQUksd0NBQXdDLEtBQUssT0FBTyxFQUFHLFFBQU87QUFDbEUsV0FBTyxNQUFNLFFBQVEsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUFBLEVBQzdDLENBQUMsRUFDQSxPQUFPLE9BQU8sRUFDZCxLQUFLLElBQUk7QUFFWixTQUFPO0FBQ1Q7QUFNTyxTQUFTLG9CQUFvQixVQUEwQjtBQUM1RCxNQUFJLE9BQU87QUFFWCxTQUFPLEtBQUssUUFBUSwwQkFBMEIsSUFBSTtBQUVsRCxTQUFPLEtBQUssUUFBUSxjQUFjLEVBQUU7QUFFcEMsU0FBTyxLQUFLLFFBQVEsbUJBQW1CLEVBQUU7QUFFekMsU0FBTyxLQUFLLFFBQVEsY0FBYyxJQUFJO0FBRXRDLFNBQU8sS0FBSyxRQUFRLDJCQUEyQixJQUFJO0FBRW5ELFNBQU8sS0FBSyxRQUFRLDBCQUEwQixJQUFJO0FBRWxELFNBQU8sS0FBSyxRQUFRLFNBQVMsRUFBRTtBQUUvQixTQUFPLEtBQUssUUFBUSxnQkFBZ0IsRUFBRTtBQUV0QyxTQUFPLEtBQUssUUFBUSxvQkFBb0IsRUFBRTtBQUUxQyxTQUFPLEtBQUssUUFBUSxXQUFXLE1BQU07QUFDckMsU0FBTyxLQUFLLEtBQUs7QUFDbkI7QUFFQSxJQUFNLHVCQUF1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9CN0IsSUFBcUIsdUJBQXJCLGNBQWtELHVCQUFPO0FBQUEsRUFBekQ7QUFBQTtBQUNFLG9CQUFtQztBQUNuQyxTQUFRLGNBQWtDO0FBQzFDLFNBQVEsbUJBQXlEO0FBQ2pFLFNBQVEsd0JBQXdCO0FBQUE7QUFBQSxFQUVoQyxNQUFNLFNBQVM7QUFDYixVQUFNLEtBQUssYUFBYTtBQUN4QixTQUFLLGdCQUFnQjtBQUVyQixTQUFLLGNBQWMsS0FBSyxpQkFBaUI7QUFFekMsU0FBSyxjQUFjLFFBQVEsaUJBQWlCLE1BQU07QUFDaEQsV0FBSyxtQkFBbUI7QUFBQSxJQUMxQixDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxtQkFBbUI7QUFBQSxJQUMxQyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxtQkFBbUIsT0FBTztBQUFBLElBQ2pELENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLG1CQUFtQixXQUFXO0FBQUEsSUFDckQsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLENBQUMsV0FBVztBQUMxQixjQUFNLFVBQVUsT0FBTyxTQUFTO0FBQ2hDLFlBQUksUUFBUSxVQUFVLEVBQUUsV0FBVyxLQUFLLEdBQUc7QUFDekMsY0FBSSx1QkFBTyx5Q0FBeUM7QUFDcEQ7QUFBQSxRQUNGO0FBQ0EsZUFBTyxVQUFVLEdBQUcsQ0FBQztBQUNyQixlQUFPLGFBQWEsc0JBQXNCLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDO0FBRTVELGVBQU8sVUFBVSxHQUFHLENBQUM7QUFBQSxNQUN2QjtBQUFBLElBQ0YsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssV0FBVztBQUFBLElBQ2xDLENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLFlBQVk7QUFBQSxJQUNuQyxDQUFDO0FBRUQsU0FBSyxjQUFjLElBQUkseUJBQXlCLEtBQUssS0FBSyxJQUFJLENBQUM7QUFFL0QsU0FBSyxvQkFBb0I7QUFBQSxFQUMzQjtBQUFBLEVBRUEsV0FBVztBQUNULFNBQUssY0FBYztBQUNuQixRQUFJLEtBQUssa0JBQWtCO0FBQ3pCLG1CQUFhLEtBQUssZ0JBQWdCO0FBQ2xDLFdBQUssbUJBQW1CO0FBQUEsSUFDMUI7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRQSxzQkFBc0I7QUFDcEIsUUFBSSxLQUFLLHNCQUF1QjtBQUNoQyxTQUFLLHdCQUF3QjtBQUU3QixTQUFLO0FBQUEsTUFDSCxLQUFLLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxTQUFTO0FBQ3BDLFlBQUksQ0FBQyxLQUFLLFNBQVMsa0JBQW1CO0FBQ3RDLFlBQUksRUFBRSxnQkFBZ0IsMEJBQVUsS0FBSyxjQUFjLEtBQU07QUFHekQsY0FBTSxRQUFRLEtBQUssSUFBSSxjQUFjLGFBQWEsSUFBSTtBQUN0RCxjQUFNLEtBQUssT0FBTztBQUNsQixZQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsWUFBYTtBQUd0QyxZQUFJLEtBQUssaUJBQWtCLGNBQWEsS0FBSyxnQkFBZ0I7QUFDN0QsYUFBSyxtQkFBbUIsV0FBVyxNQUFNO0FBQ3ZDLGVBQUssbUJBQW1CO0FBQ3hCLGVBQUssS0FBSyxnQkFBZ0IsSUFBSTtBQUFBLFFBQ2hDLEdBQUcsR0FBSTtBQUFBLE1BQ1QsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsZ0JBQWdCLE1BQWE7QUFDekMsVUFBTSxPQUFPLEtBQUssOEJBQThCO0FBQ2hELFFBQUksQ0FBQyxLQUFNO0FBQ1gsUUFBSSxDQUFDLEtBQUssb0JBQW9CLElBQUksRUFBRztBQUVyQyxVQUFNLFVBQVUsTUFBTSxLQUFLLGFBQWEsSUFBSTtBQUU1QyxRQUFJLENBQUMsUUFBUSxTQUFTLFFBQVEsVUFBVSxXQUFZO0FBRXBELFVBQU0sS0FBSyxxQkFBcUIsTUFBTSxTQUFTLElBQUk7QUFBQSxFQUNyRDtBQUFBO0FBQUEsRUFHUSxnQ0FBb0Q7QUFDMUQsVUFBTSxFQUFFLGNBQWMsdUJBQXVCLElBQUksS0FBSztBQUN0RCxRQUFJLGFBQWEsV0FBVyxFQUFHLFFBQU87QUFHdEMsUUFBSSx3QkFBd0I7QUFDMUIsWUFBTSxRQUFRLGFBQWEsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLHNCQUFzQjtBQUN4RSxVQUFJLE1BQU8sUUFBTztBQUFBLElBQ3BCO0FBR0EsV0FBTyxhQUFhLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxZQUFZLEtBQUs7QUFBQSxFQUM5RDtBQUFBO0FBQUEsRUFHUSxrQkFBa0I7QUFDeEIsVUFBTSxNQUFNLEtBQUs7QUFFakIsUUFBSSxPQUFPLElBQUksWUFBWSxZQUFZLElBQUksU0FBUztBQUNsRCxXQUFLLFNBQVMsZUFBZTtBQUFBLFFBQzNCO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixLQUFLLElBQUk7QUFBQSxVQUNULFFBQVMsSUFBSSxVQUFxQjtBQUFBLFFBQ3BDO0FBQUEsTUFDRjtBQUNBLGFBQU8sSUFBSTtBQUNYLGFBQU8sSUFBSTtBQUNYLFdBQUssS0FBSyxhQUFhO0FBQUEsSUFDekI7QUFFQSxRQUFJLE1BQU0sUUFBUSxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sUUFBUSxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQzFFLFdBQUssU0FBUyxlQUFlLElBQUk7QUFDakMsYUFBTyxJQUFJO0FBQ1gsV0FBSyxLQUFLLGFBQWE7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNuQixTQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBb0M7QUFDNUcsUUFBSSxDQUFDLE1BQU0sUUFBUSxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQzlDLFdBQUssU0FBUyxlQUFlLENBQUM7QUFBQSxJQUNoQztBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNuQixVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUFBLEVBRVEsbUJBQW1CLGdCQUF3QztBQUNqRSxVQUFNLEVBQUUsYUFBYSxJQUFJLEtBQUs7QUFDOUIsUUFBSSxhQUFhLFdBQVcsR0FBRztBQUM3QixVQUFJLHVCQUFPLDBDQUEwQztBQUNyRDtBQUFBLElBQ0Y7QUFDQSxRQUFJLGFBQWEsV0FBVyxHQUFHO0FBQzdCLFdBQUssS0FBSyxlQUFlLGFBQWEsQ0FBQyxHQUFHLGNBQWM7QUFDeEQ7QUFBQSxJQUNGO0FBQ0EsUUFBSSxnQkFBZ0IsS0FBSyxLQUFLLGNBQWMsQ0FBQyxTQUFTO0FBQ3BELFdBQUssS0FBSyxlQUFlLE1BQU0sY0FBYztBQUFBLElBQy9DLENBQUMsRUFBRSxLQUFLO0FBQUEsRUFDVjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxNQUFjLGFBQ1osTUFDQSxnQkFDa0M7QUFDbEMsVUFBTSxVQUFVLE1BQU0sS0FBSyxJQUFJLE1BQU0sV0FBVyxJQUFJO0FBQ3BELFVBQU0sWUFBWSxLQUFLLElBQUksY0FBYyxhQUFhLElBQUk7QUFDMUQsVUFBTSxjQUFjLGlCQUFpQixXQUFXLFdBQVc7QUFDM0QsVUFBTSxPQUFPLFlBQVksT0FBTztBQUNoQyxVQUFNLGdCQUFnQixLQUFLLFNBQVMsc0JBQXNCLGtCQUFrQixJQUFJLElBQUk7QUFDcEYsVUFBTSxRQUFRLFlBQVksU0FBUyxLQUFLLFlBQVk7QUFDcEQsVUFBTSxPQUFPLFlBQVksUUFBUSxPQUFPLEtBQUs7QUFDN0MsVUFBTSxTQUFTLGtCQUFrQixZQUFZLFVBQVUsS0FBSyxTQUFTO0FBQ3JFLFVBQU0sV0FBVyxZQUFZLFFBQVE7QUFFckMsVUFBTSxlQUNKLFlBQVksaUJBQ1gsS0FBSyxTQUFTLG1CQUNYLEdBQUcsS0FBSyxTQUFTLGlCQUFpQixRQUFRLE9BQU8sRUFBRSxDQUFDLElBQUksUUFBUSxJQUFJLElBQUksS0FDeEU7QUFDTixXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBLE1BQU07QUFBQSxNQUNOLFNBQVMsWUFBWSxXQUFXO0FBQUEsTUFDaEMsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLE1BQU0sWUFBWSxRQUFRLENBQUM7QUFBQSxNQUMzQixRQUFRLFlBQVksVUFBVTtBQUFBLE1BQzlCLFVBQVUsWUFBWSxZQUFZO0FBQUEsTUFDbEMsWUFBWSxZQUFZLGNBQWM7QUFBQSxNQUN0QyxXQUFXLFlBQVksYUFBYTtBQUFBLE1BQ3BDLGlCQUFpQixZQUFZLG1CQUFtQjtBQUFBLE1BQ2hELFNBQVMsWUFBWSxXQUFXO0FBQUEsTUFDaEMsVUFBVSxZQUFZLFlBQVk7QUFBQSxNQUNsQyxHQUFJLGdCQUFnQixFQUFFLGFBQWE7QUFBQSxJQUNyQztBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsZUFBZSxhQUEwQixnQkFBd0M7QUFDN0YsVUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw0QkFBWTtBQUNoRSxRQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTTtBQUN2QixVQUFJLHVCQUFPLDRCQUE0QjtBQUN2QztBQUFBLElBQ0Y7QUFFQSxRQUFJLENBQUMsS0FBSyxvQkFBb0IsV0FBVyxHQUFHO0FBQzFDLFVBQUksdUJBQU8sOEJBQThCLFlBQVksSUFBSSxlQUFlO0FBQ3hFO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBVSxNQUFNLEtBQUssYUFBYSxLQUFLLE1BQU0sY0FBYztBQUVqRSxRQUFJLEtBQUssU0FBUyxzQkFBc0I7QUFDdEMsVUFBSSxvQkFBb0IsS0FBSyxLQUFLLFNBQVMsYUFBYSxNQUFNO0FBQzVELGFBQUssS0FBSyxxQkFBcUIsYUFBYSxTQUFTLEtBQUssSUFBSztBQUFBLE1BQ2pFLENBQUMsRUFBRSxLQUFLO0FBQUEsSUFDVixPQUFPO0FBQ0wsV0FBSyxLQUFLLHFCQUFxQixhQUFhLFNBQVMsS0FBSyxJQUFJO0FBQUEsSUFDaEU7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMscUJBQ1osYUFDQSxTQUNBLE1BQ0E7QUFDQSxZQUFRLFlBQVksTUFBTTtBQUFBLE1BQ3hCLEtBQUs7QUFDSCxlQUFPLEtBQUssZUFBZSxhQUFhLFNBQVMsSUFBSTtBQUFBLE1BQ3ZELEtBQUs7QUFDSCxlQUFPLEtBQUssa0JBQWtCLGFBQWEsU0FBUyxJQUFJO0FBQUEsTUFDMUQsS0FBSztBQUNILGVBQU8sS0FBSyxpQkFBaUIsYUFBYSxTQUFTLElBQUk7QUFBQSxNQUN6RCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0gsWUFBSSx1QkFBTyxHQUFHLFlBQVksSUFBSSxLQUFLLFlBQVksSUFBSSx1Q0FBdUM7QUFDMUY7QUFBQSxNQUNGO0FBQ0UsZUFBTyxLQUFLLG1CQUFtQixhQUFhLFNBQVMsSUFBSTtBQUFBLElBQzdEO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLG1CQUNaLGFBQ0EsU0FDQSxNQUNBO0FBQ0EsVUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBTSxTQUFTLFFBQVE7QUFDdkIsUUFBSTtBQUNGLFVBQUksdUJBQU8sYUFBYSxLQUFLLFlBQU8sWUFBWSxJQUFJLEtBQUs7QUFDekQsWUFBTSxNQUFNLEdBQUcsWUFBWSxJQUFJLFFBQVEsT0FBTyxFQUFFLENBQUM7QUFDakQsWUFBTSxXQUFXLFVBQU0sNEJBQVc7QUFBQSxRQUNoQztBQUFBLFFBQ0EsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsZ0JBQWdCO0FBQUEsVUFDaEIsaUJBQWlCLFlBQVk7QUFBQSxRQUMvQjtBQUFBLFFBQ0EsTUFBTSxLQUFLLFVBQVUsT0FBTztBQUFBLE1BQzlCLENBQUM7QUFDRCxVQUFJLFNBQVMsVUFBVSxPQUFPLFNBQVMsU0FBUyxLQUFLO0FBQ25ELFlBQUksT0FBTztBQUNYLFlBQUk7QUFDRixnQkFBTSxPQUFPLFNBQVM7QUFDdEIsY0FBSSxNQUFNLFNBQVUsUUFBTztBQUFBLFFBQzdCLFFBQVE7QUFBQSxRQUFpQjtBQUN6QixZQUFJLHVCQUFPLEdBQUcsSUFBSSxLQUFLLEtBQUssUUFBUSxZQUFZLElBQUksT0FBTyxNQUFNLEVBQUU7QUFDbkUsYUFBSyxxQkFBcUIsWUFBWSxJQUFJO0FBQzFDLFlBQUk7QUFDSixZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxTQUFTO0FBQ3RCLDJCQUFrQixNQUFNLE9BQ3RCLEdBQUcsWUFBWSxJQUFJLFFBQVEsT0FBTyxFQUFFLENBQUMsSUFBSSxRQUFRLElBQWM7QUFBQSxRQUNuRSxRQUFRO0FBQ04sMkJBQWlCLEdBQUcsWUFBWSxJQUFJLFFBQVEsT0FBTyxFQUFFLENBQUMsSUFBSSxRQUFRLElBQWM7QUFBQSxRQUNsRjtBQUNBLGNBQU0sS0FBSyxpQkFBaUIsTUFBTSxZQUFZLE1BQU0sY0FBYztBQUFBLE1BQ3BFLE9BQU87QUFDTCxZQUFJO0FBQ0osWUFBSTtBQUNGLGdCQUFNLE9BQU8sU0FBUztBQUN0Qix3QkFBZSxNQUFNLFNBQW9CLE9BQU8sU0FBUyxNQUFNO0FBQUEsUUFDakUsUUFBUTtBQUFFLHdCQUFjLE9BQU8sU0FBUyxNQUFNO0FBQUEsUUFBRztBQUNqRCxZQUFJLHVCQUFPLFlBQVksWUFBWSxJQUFJLFlBQVksV0FBVyxFQUFFO0FBQUEsTUFDbEU7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLFVBQUksdUJBQU8sZ0JBQWdCLFlBQVksSUFBSSxNQUFNLGVBQWUsUUFBUSxJQUFJLFVBQVUsZUFBZSxFQUFFO0FBQUEsSUFDekc7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsZUFDWixhQUNBLFNBQ0EsTUFDQTtBQUNBLFVBQU0sUUFBUSxRQUFRO0FBQ3RCLFFBQUk7QUFDRixVQUFJLHVCQUFPLGFBQWEsS0FBSyxvQkFBZSxZQUFZLElBQUksTUFBTTtBQUNsRSxZQUFNLFFBQVMsUUFBUSxRQUFxQixDQUFDLEdBQzFDLE1BQU0sR0FBRyxDQUFDLEVBQ1YsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsUUFBUSxjQUFjLEVBQUUsQ0FBQztBQUN2RCxZQUFNLFVBQW1DO0FBQUEsUUFDdkM7QUFBQSxRQUNBLGVBQWUsUUFBUTtBQUFBLFFBQ3ZCLFdBQVcsUUFBUSxXQUFXO0FBQUEsUUFDOUI7QUFBQSxRQUNBLGFBQWMsUUFBUSxXQUFzQjtBQUFBLE1BQzlDO0FBQ0EsVUFBSSxRQUFRLGFBQWMsU0FBUSxnQkFBZ0IsUUFBUTtBQUMxRCxVQUFJLFFBQVEsV0FBWSxTQUFRLGFBQWEsUUFBUTtBQUNyRCxZQUFNLFdBQVcsVUFBTSw0QkFBVztBQUFBLFFBQ2hDLEtBQUs7QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLGdCQUFnQjtBQUFBLFVBQ2hCLFdBQVcsWUFBWTtBQUFBLFFBQ3pCO0FBQUEsUUFDQSxNQUFNLEtBQUssVUFBVSxFQUFFLFFBQVEsQ0FBQztBQUFBLE1BQ2xDLENBQUM7QUFDRCxVQUFJLFNBQVMsVUFBVSxPQUFPLFNBQVMsU0FBUyxLQUFLO0FBQ25ELGNBQU0sT0FBTyxTQUFTO0FBQ3RCLGNBQU0sYUFBc0IsTUFBTSxPQUFrQjtBQUNwRCxZQUFJLHVCQUFPLFdBQVcsS0FBSyxhQUFhO0FBQ3hDLGFBQUsscUJBQXFCLFFBQVE7QUFDbEMsY0FBTSxLQUFLLGlCQUFpQixNQUFNLFlBQVksTUFBTSxVQUFVO0FBQUEsTUFDaEUsT0FBTztBQUNMLFlBQUk7QUFDSixZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxTQUFTO0FBQ3RCLHdCQUFlLE1BQU0sU0FBb0IsT0FBTyxTQUFTLE1BQU07QUFBQSxRQUNqRSxRQUFRO0FBQUUsd0JBQWMsT0FBTyxTQUFTLE1BQU07QUFBQSxRQUFHO0FBQ2pELFlBQUksdUJBQU8sd0JBQXdCLFdBQVcsRUFBRTtBQUFBLE1BQ2xEO0FBQUEsSUFDRixTQUFTLEtBQUs7QUFDWixVQUFJLHVCQUFPLGlCQUFpQixlQUFlLFFBQVEsSUFBSSxVQUFVLGVBQWUsRUFBRTtBQUFBLElBQ3BGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLGtCQUNaLGFBQ0EsU0FDQSxNQUNBO0FBQ0EsVUFBTSxRQUFRLFFBQVE7QUFDdEIsUUFBSTtBQUNGLFVBQUksdUJBQU8sYUFBYSxLQUFLLHNCQUFpQixZQUFZLElBQUksTUFBTTtBQUNwRSxZQUFNLFVBQVcsUUFBUSxXQUFzQjtBQUMvQyxZQUFNLGVBQWdCLFFBQVEsZ0JBQTJCO0FBQ3pELFlBQU0sYUFBYSxDQUFDLE9BQU8sU0FBUyxZQUFZLEVBQUUsT0FBTyxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQzdFLFlBQU0sZUFBZSxZQUFZLGVBQWUsSUFBSSxRQUFRLE9BQU8sRUFBRTtBQUNyRSxZQUFNLFdBQVcsVUFBTSw0QkFBVztBQUFBLFFBQ2hDLEtBQUssR0FBRyxXQUFXO0FBQUEsUUFDbkIsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsZ0JBQWdCO0FBQUEsVUFDaEIsaUJBQWlCLFVBQVUsWUFBWSxXQUFXO0FBQUEsUUFDcEQ7QUFBQSxRQUNBLE1BQU0sS0FBSyxVQUFVLEVBQUUsUUFBUSxZQUFZLFlBQVksU0FBUyxDQUFDO0FBQUEsTUFDbkUsQ0FBQztBQUNELFVBQUksU0FBUyxVQUFVLE9BQU8sU0FBUyxTQUFTLEtBQUs7QUFDbkQsY0FBTSxPQUFPLFNBQVM7QUFDdEIsY0FBTSxZQUFxQixNQUFNLE9BQWtCO0FBQ25ELFlBQUksdUJBQU8sV0FBVyxLQUFLLGVBQWU7QUFDMUMsYUFBSyxxQkFBcUIsVUFBVTtBQUNwQyxjQUFNLEtBQUssaUJBQWlCLE1BQU0sWUFBWSxNQUFNLFNBQVM7QUFBQSxNQUMvRCxPQUFPO0FBQ0wsWUFBSTtBQUNKLFlBQUk7QUFDRixnQkFBTSxPQUFPLFNBQVM7QUFDdEIsd0JBQWUsTUFBTSxTQUFvQixPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQ2pFLFFBQVE7QUFBRSx3QkFBYyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUc7QUFDakQsWUFBSSx1QkFBTywwQkFBMEIsV0FBVyxFQUFFO0FBQUEsTUFDcEQ7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLFVBQUksdUJBQU8sbUJBQW1CLGVBQWUsUUFBUSxJQUFJLFVBQVUsZUFBZSxFQUFFO0FBQUEsSUFDdEY7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsaUJBQ1osYUFDQSxTQUNBLE1BQ0E7QUFDQSxVQUFNLFFBQVEsUUFBUTtBQUN0QixRQUFJO0FBQ0YsVUFBSSx1QkFBTyxhQUFhLEtBQUsscUJBQWdCLFlBQVksSUFBSSxNQUFNO0FBR25FLFlBQU0sZUFBZSxVQUFNLDRCQUFXO0FBQUEsUUFDcEMsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxRQUM5QyxNQUFNLEtBQUssVUFBVTtBQUFBLFVBQ25CLFlBQVksWUFBWTtBQUFBLFVBQ3hCLFVBQVUsWUFBWTtBQUFBLFFBQ3hCLENBQUM7QUFBQSxNQUNILENBQUM7QUFDRCxVQUFJLGFBQWEsU0FBUyxPQUFPLGFBQWEsVUFBVSxLQUFLO0FBQzNELFlBQUksdUJBQU8sd0JBQXdCLGFBQWEsTUFBTSxFQUFFO0FBQ3hEO0FBQUEsTUFDRjtBQUNBLFlBQU0sRUFBRSxLQUFLLFVBQVUsSUFBSSxhQUFhO0FBR3hDLFlBQU0sZUFBZ0IsUUFBUSxnQkFBMkI7QUFDekQsWUFBTSxVQUFXLFFBQVEsV0FBc0I7QUFDL0MsWUFBTSxXQUFXLENBQUMsT0FBTyxPQUFPLEVBQUUsT0FBTyxPQUFPLEVBQUUsS0FBSyxVQUFLO0FBQzVELFlBQU0sVUFBVSxPQUFPLGVBQWUsYUFBYSxTQUFTLElBQUk7QUFDaEUsWUFBTSxRQUFRLFNBQVMsU0FBUyxVQUM1QixTQUFTLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxXQUNyQyxhQUNDLGVBQWUsSUFBSSxZQUFZLEtBQUs7QUFFekMsWUFBTSxhQUFzQztBQUFBLFFBQzFDLE9BQU87QUFBQSxRQUNQO0FBQUEsUUFDQSxZQUFXLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQUEsUUFDbEMsT0FBTyxDQUFDLElBQUk7QUFBQSxNQUNkO0FBQ0EsVUFBSSxjQUFjO0FBQ2hCLGNBQU0sV0FBVyxLQUFLLFlBQVksWUFBWTtBQUM5QyxtQkFBVyxTQUFTLENBQUM7QUFBQSxVQUNuQixPQUFPO0FBQUEsWUFBRSxXQUFXLElBQUksWUFBWSxFQUFFLE9BQU8sS0FBSyxVQUFVLEdBQUcsUUFBUSxDQUFDLEVBQUU7QUFBQSxZQUNqRSxTQUFXLElBQUksWUFBWSxFQUFFLE9BQU8sS0FBSyxVQUFVLEdBQUcsV0FBVyxhQUFhLE1BQU0sQ0FBQyxFQUFFO0FBQUEsVUFBTztBQUFBLFVBQ3ZHLFVBQVUsQ0FBQyxFQUFFLE9BQU8sZ0NBQWdDLEtBQUssYUFBYSxDQUFDO0FBQUEsUUFDekUsQ0FBQztBQUFBLE1BQ0g7QUFFQSxZQUFNLGlCQUFpQixVQUFNLDRCQUFXO0FBQUEsUUFDdEMsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsZ0JBQWdCO0FBQUEsVUFDaEIsaUJBQWlCLFVBQVUsU0FBUztBQUFBLFFBQ3RDO0FBQUEsUUFDQSxNQUFNLEtBQUssVUFBVTtBQUFBLFVBQ25CLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFBQSxNQUNILENBQUM7QUFDRCxVQUFJLGVBQWUsVUFBVSxPQUFPLGVBQWUsU0FBUyxLQUFLO0FBQy9ELGNBQU0sYUFBYSxlQUFlO0FBQ2xDLGNBQU0sTUFBZSxZQUFZLE9BQWtCO0FBQ25ELGNBQU0sVUFBVSxNQUNaLDRCQUE0QixZQUFZLE1BQU0sU0FBUyxJQUFJLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxLQUMzRTtBQUNKLFlBQUksdUJBQU8sV0FBVyxLQUFLLGNBQWM7QUFDekMsYUFBSyxxQkFBcUIsU0FBUztBQUNuQyxjQUFNLEtBQUssaUJBQWlCLE1BQU0sWUFBWSxNQUFNLE9BQU87QUFBQSxNQUM3RCxPQUFPO0FBQ0wsWUFBSTtBQUNKLFlBQUk7QUFDRixnQkFBTSxhQUFhLGVBQWU7QUFDbEMsd0JBQWMsT0FBUSxZQUFZLFdBQXNCLGVBQWUsTUFBTTtBQUFBLFFBQy9FLFFBQVE7QUFBRSx3QkFBYyxPQUFPLGVBQWUsTUFBTTtBQUFBLFFBQUc7QUFDdkQsWUFBSSx1QkFBTyx5QkFBeUIsV0FBVyxFQUFFO0FBQUEsTUFDbkQ7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLFVBQUksdUJBQU8sa0JBQWtCLGVBQWUsUUFBUSxJQUFJLFVBQVUsZUFBZSxFQUFFO0FBQUEsSUFDckY7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsV0FBVyxnQkFBd0M7QUFDL0QsVUFBTSxFQUFFLGFBQWEsSUFBSSxLQUFLO0FBQzlCLFFBQUksYUFBYSxXQUFXLEdBQUc7QUFDN0IsVUFBSSx1QkFBTywwQ0FBMEM7QUFDckQ7QUFBQSxJQUNGO0FBQ0EsVUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw0QkFBWTtBQUNoRSxRQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTTtBQUN2QixVQUFJLHVCQUFPLDRCQUE0QjtBQUN2QztBQUFBLElBQ0Y7QUFDQSxVQUFNLFVBQVUsTUFBTSxLQUFLLGFBQWEsS0FBSyxNQUFNLGNBQWM7QUFDakUsUUFBSSx1QkFBTyxhQUFhLE9BQU8sUUFBUSxLQUFLLENBQUMsUUFBUSxhQUFhLE1BQU0sb0JBQW9CO0FBQzVGLGVBQVcsUUFBUSxjQUFjO0FBQy9CLFVBQUksS0FBSyxvQkFBb0IsSUFBSSxHQUFHO0FBQ2xDLGNBQU0sS0FBSyxxQkFBcUIsTUFBTSxTQUFTLEtBQUssSUFBSTtBQUFBLE1BQzFELE9BQU87QUFDTCxZQUFJLHVCQUFPLGFBQWEsS0FBSyxJQUFJLHFDQUFnQztBQUFBLE1BQ25FO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0Esb0JBQW9CLE1BQTRCO0FBQzlDLFlBQVEsS0FBSyxNQUFNO0FBQUEsTUFDakIsS0FBSztBQUFZLGVBQU8sQ0FBQyxDQUFDLEtBQUs7QUFBQSxNQUMvQixLQUFLO0FBQVksZUFBTyxDQUFDLEVBQUUsS0FBSyxlQUFlLEtBQUs7QUFBQSxNQUNwRCxLQUFLO0FBQVksZUFBTyxDQUFDLEVBQUUsS0FBSyxVQUFVLEtBQUs7QUFBQSxNQUMvQyxLQUFLO0FBQVksZUFBTyxDQUFDLENBQUMsS0FBSztBQUFBLE1BQy9CLEtBQUs7QUFBWSxlQUFPLENBQUMsRUFBRSxLQUFLLGtCQUFrQixLQUFLLHNCQUFzQixLQUFLO0FBQUEsTUFDbEYsS0FBSztBQUFZLGVBQU8sQ0FBQyxFQUFFLEtBQUssaUJBQWlCLEtBQUs7QUFBQSxNQUN0RCxLQUFLO0FBQVksZUFBTyxDQUFDLEVBQUUsS0FBSyx1QkFBdUIsS0FBSztBQUFBLE1BQzVELEtBQUs7QUFBWSxlQUFPLENBQUMsRUFBRSxLQUFLLGdCQUFnQixLQUFLO0FBQUEsTUFDckQ7QUFBaUIsZUFBTyxDQUFDLEVBQUUsS0FBSyxPQUFPLEtBQUs7QUFBQSxJQUM5QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBYyxpQkFBaUIsTUFBYSxNQUFjLEtBQWE7QUFDckUsVUFBTSxLQUFLLElBQUksWUFBWSxtQkFBbUIsTUFBTSxDQUFDLE9BQWdDO0FBQ25GLFVBQUksQ0FBQyxNQUFNLFFBQVEsR0FBRyxXQUFXLEVBQUcsSUFBRyxjQUFjLENBQUM7QUFDdEQsWUFBTSxVQUFVLEdBQUc7QUFDbkIsWUFBTSxXQUFXLFFBQVEsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLElBQUk7QUFDcEQsVUFBSSxVQUFVO0FBQ1osaUJBQVMsTUFBTTtBQUFBLE1BQ2pCLE9BQU87QUFDTCxnQkFBUSxLQUFLLEVBQUUsS0FBSyxLQUFLLENBQUM7QUFBQSxNQUM1QjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVRLHFCQUFxQixVQUFrQjtBQUM3QyxRQUFJLENBQUMsS0FBSyxZQUFhO0FBQ3ZCLFNBQUssWUFBWSxRQUFRLGlCQUFZLFFBQVEsRUFBRTtBQUMvQyxXQUFPLFdBQVcsTUFBTTtBQUN0QixVQUFJLEtBQUssWUFBYSxNQUFLLFlBQVksUUFBUSxFQUFFO0FBQUEsSUFDbkQsR0FBRyxHQUFJO0FBQUEsRUFDVDtBQUFBO0FBQUEsRUFHUSxjQUFjO0FBQ3BCLFVBQU0sT0FBTyxLQUFLLElBQUksVUFBVSxvQkFBb0IsNEJBQVk7QUFDaEUsUUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLE1BQU07QUFDdkIsVUFBSSx1QkFBTyw0QkFBNEI7QUFDdkM7QUFBQSxJQUNGO0FBQ0EsVUFBTSxZQUFZLEtBQUssSUFBSSxjQUFjLGFBQWEsS0FBSyxJQUFJO0FBQy9ELFVBQU0sS0FBSyxXQUFXO0FBQ3RCLFVBQU0sY0FBdUIsSUFBSTtBQUNqQyxVQUFNLFFBQVMsSUFBSSxTQUFvQixLQUFLLEtBQUs7QUFDakQsUUFBSSxpQkFBaUIsS0FBSyxLQUFLLE9BQU8sV0FBVyxFQUFFLEtBQUs7QUFBQSxFQUMxRDtBQUNGO0FBSUEsSUFBTSxzQkFBTixjQUFrQyxzQkFBTTtBQUFBLEVBS3RDLFlBQ0UsS0FDQSxTQUNBLGFBQ0EsV0FDQTtBQUNBLFVBQU0sR0FBRztBQUNULFNBQUssVUFBVTtBQUNmLFNBQUssY0FBYztBQUNuQixTQUFLLFlBQVk7QUFBQSxFQUNuQjtBQUFBLEVBRUEsU0FBUztBQUNQLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxTQUFTLCtCQUErQjtBQUVsRCxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEQsY0FBVSxTQUFTLEtBQUs7QUFBQSxNQUN0QixNQUFNLDZCQUE2QixLQUFLLFlBQVksSUFBSTtBQUFBLElBQzFELENBQUM7QUFFRCxVQUFNLFVBQVUsVUFBVSxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUM5RCxZQUFRLFNBQVMsT0FBTyxFQUFFLE1BQU0sVUFBVSxPQUFPLEtBQUssUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3hFLFlBQVEsU0FBUyxPQUFPLEVBQUUsTUFBTSxTQUFTLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDdEUsWUFBUSxTQUFTLE9BQU8sRUFBRSxNQUFNLFdBQVcsT0FBTyxLQUFLLFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUMxRSxZQUFRLFNBQVMsT0FBTyxFQUFFLE1BQU0sU0FBUyxPQUFPLEtBQUssUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDO0FBRXRFLFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBRXJFLFVBQU0sWUFBWSxRQUFRLFNBQVMsVUFBVSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQy9ELGNBQVUsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUV0RCxVQUFNLGFBQWEsUUFBUSxTQUFTLFVBQVU7QUFBQSxNQUM1QyxNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQ0QsZUFBVyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3pDLFdBQUssTUFBTTtBQUNYLFdBQUssVUFBVTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxVQUFVO0FBQ1IsU0FBSyxVQUFVLE1BQU07QUFBQSxFQUN2QjtBQUNGO0FBSUEsSUFBTSxrQkFBTixjQUE4Qiw2QkFBMEI7QUFBQSxFQUl0RCxZQUFZLEtBQVUsY0FBNkIsVUFBOEM7QUFDL0YsVUFBTSxHQUFHO0FBQ1QsU0FBSyxlQUFlO0FBQ3BCLFNBQUssV0FBVztBQUNoQixTQUFLLGVBQWUscUNBQXFDO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLGVBQWUsT0FBOEI7QUFDM0MsVUFBTSxRQUFRLE1BQU0sWUFBWTtBQUNoQyxXQUFPLEtBQUssYUFBYTtBQUFBLE1BQ3ZCLENBQUMsTUFDQyxFQUFFLEtBQUssWUFBWSxFQUFFLFNBQVMsS0FBSyxLQUNuQyxFQUFFLElBQUksWUFBWSxFQUFFLFNBQVMsS0FBSztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBRUEsaUJBQWlCLGFBQTBCLElBQWlCO0FBQzFELE9BQUcsU0FBUyxPQUFPLEVBQUUsTUFBTSxZQUFZLE1BQU0sS0FBSyxtQkFBbUIsQ0FBQztBQUN0RSxPQUFHLFNBQVMsU0FBUyxFQUFFLE1BQU0sWUFBWSxLQUFLLEtBQUssa0JBQWtCLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBRUEsbUJBQW1CLGFBQTBCO0FBQzNDLFNBQUssU0FBUyxXQUFXO0FBQUEsRUFDM0I7QUFDRjtBQUlBLElBQU0sMkJBQU4sY0FBdUMsaUNBQWlCO0FBQUEsRUFHdEQsWUFBWSxLQUFVLFFBQThCO0FBQ2xELFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIsZ0JBQVksTUFBTTtBQUVsQixRQUFJLHdCQUFRLFdBQVcsRUFBRSxRQUFRLHFCQUFxQixFQUFFLFdBQVc7QUFFbkUsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsb0JBQW9CLEVBQzVCLFFBQVEsd0hBQW1ILEVBQzNIO0FBQUEsTUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLHNCQUFzQixFQUNyQyxTQUFTLEtBQUssT0FBTyxTQUFTLGdCQUFnQixFQUM5QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxtQkFBbUI7QUFDeEMsWUFBSSxTQUFTLENBQUMsTUFBTSxXQUFXLFVBQVUsS0FBSyxDQUFDLE1BQU0sV0FBVyxrQkFBa0IsR0FBRztBQUNuRixjQUFJLHVCQUFPLHdEQUF3RDtBQUFBLFFBQ3JFO0FBQ0EsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQUUsUUFBUSxjQUFjLEVBQUUsV0FBVztBQUU1RCxTQUFLLE9BQU8sU0FBUyxhQUFhLFFBQVEsQ0FBQyxhQUFhLFVBQVU7QUFDaEUsWUFBTSxnQkFBZ0IsWUFBWSxVQUFVO0FBQUEsUUFDMUMsS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUNELFVBQUksd0JBQVEsYUFBYSxFQUFFLFFBQVEsWUFBWSxRQUFRLGVBQWUsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXO0FBRTlGLFVBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGtCQUFrQixFQUMxQixRQUFRLDZDQUE2QyxFQUNyRDtBQUFBLFFBQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxTQUFTLEVBQ3hCLFNBQVMsWUFBWSxJQUFJLEVBQ3pCLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGVBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLE9BQU87QUFDaEQsZ0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxRQUNqQyxDQUFDO0FBQUEsTUFDTDtBQUVGLFVBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLE1BQU0sRUFDZCxRQUFRLHdCQUF3QixFQUNoQztBQUFBLFFBQVksQ0FBQyxPQUNaLEdBQ0csVUFBVSxjQUFjLFlBQVksRUFDcEMsVUFBVSxTQUFTLFFBQVEsRUFDM0IsVUFBVSxZQUFZLFVBQVUsRUFDaEMsVUFBVSxXQUFXLFNBQVMsRUFDOUIsVUFBVSxVQUFVLFFBQVEsRUFDNUIsVUFBVSxVQUFVLFFBQVEsRUFDNUIsVUFBVSxXQUFXLFNBQVMsRUFDOUIsVUFBVSxZQUFZLFVBQVUsRUFDaEMsVUFBVSxVQUFVLFFBQVEsRUFDNUIsU0FBUyxZQUFZLFFBQVEsWUFBWSxFQUN6QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixlQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxPQUFPO0FBQ2hELGdCQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLGVBQUssUUFBUTtBQUFBLFFBQ2YsQ0FBQztBQUFBLE1BQ0w7QUFFRixZQUFNLFdBQVcsWUFBWSxRQUFRO0FBRXJDLFVBQUksYUFBYSxjQUFjO0FBQzdCLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLFVBQVUsRUFDbEIsUUFBUSxpREFBaUQsRUFDekQ7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUscUJBQXFCLEVBQ3BDLFNBQVMsWUFBWSxPQUFPLEVBQUUsRUFDOUIsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLE1BQU07QUFDL0MsZ0JBQUksU0FBUyxDQUFDLE1BQU0sV0FBVyxVQUFVLEtBQUssQ0FBQyxNQUFNLFdBQVcsa0JBQWtCLEdBQUc7QUFDbkYsa0JBQUksdUJBQU8scURBQXFEO0FBQUEsWUFDbEU7QUFDQSxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQ0YsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsU0FBUyxFQUNqQixRQUFRLGdEQUFnRCxFQUN4RCxRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsZUFBZSxFQUM5QixTQUFTLFlBQVksVUFBVSxFQUFFLEVBQ2pDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxTQUFTO0FBQ2xELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUFBLE1BQ0wsV0FBVyxhQUFhLFNBQVM7QUFDL0IsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsZ0JBQWdCLEVBQ3hCLFFBQVEseUNBQXlDLEVBQ2pELFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxzQkFBc0IsRUFDckMsU0FBUyxZQUFZLFVBQVUsRUFBRSxFQUNqQyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsU0FBUztBQUNsRCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFDSCxlQUFLLFFBQVEsT0FBTztBQUNwQixlQUFLLFFBQVEsZUFBZTtBQUFBLFFBQzlCLENBQUM7QUFBQSxNQUNMLFdBQVcsYUFBYSxZQUFZO0FBQ2xDLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGNBQWMsRUFDdEIsUUFBUSx1REFBdUQsRUFDL0Q7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUseUJBQXlCLEVBQ3hDLFNBQVMsWUFBWSxlQUFlLEVBQUUsRUFDdEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGNBQWM7QUFDdkQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQUEsUUFDTDtBQUNGLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGNBQWMsRUFDdEIsUUFBUSxnRkFBc0UsRUFDOUUsUUFBUSxDQUFDLFNBQVM7QUFDakIsZUFDRyxlQUFlLG9CQUFvQixFQUNuQyxTQUFTLFlBQVksZUFBZSxFQUFFLEVBQ3RDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxjQUFjO0FBQ3ZELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUFBLE1BQ0wsV0FBVyxhQUFhLFdBQVc7QUFDakMsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsZ0JBQWdCLEVBQ3hCLFFBQVEseUNBQXlDLEVBQ2pEO0FBQUEsVUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLHNCQUFzQixFQUNyQyxTQUFTLFlBQVksVUFBVSxFQUFFLEVBQ2pDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxTQUFTO0FBQ2xELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFDRixZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxjQUFjLEVBQ3RCLFFBQVEsNkVBQXdFLEVBQ2hGLFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxxQkFBcUIsRUFDcEMsU0FBUyxZQUFZLGVBQWUsRUFBRSxFQUN0QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsY0FBYztBQUN2RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFDSCxlQUFLLFFBQVEsT0FBTztBQUNwQixlQUFLLFFBQVEsZUFBZTtBQUFBLFFBQzlCLENBQUM7QUFBQSxNQUNMLFdBQVcsYUFBYSxVQUFVO0FBQ2hDLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLFlBQVksRUFDcEIsUUFBUSxxR0FBcUc7QUFDaEgsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsbUJBQW1CLEVBQzNCLFFBQVEsb0ZBQXFFLEVBQzdFLFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxnQ0FBZ0MsRUFDL0MsU0FBUyxZQUFZLGVBQWUsRUFBRSxFQUN0QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsY0FBYztBQUN2RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFDSCxlQUFLLFFBQVEsT0FBTztBQUNwQixlQUFLLFFBQVEsZUFBZTtBQUFBLFFBQzlCLENBQUM7QUFBQSxNQUNMLFdBQVcsYUFBYSxVQUFVO0FBQ2hDLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLFdBQVcsRUFDbkIsUUFBUSw4REFBMkQsRUFDbkU7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsV0FBVyxFQUMxQixTQUFTLFlBQVksa0JBQWtCLEVBQUUsRUFDekMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGlCQUFpQjtBQUMxRCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQ0YsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsZUFBZSxFQUN2QixRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsZUFBZSxFQUM5QixTQUFTLFlBQVksc0JBQXNCLEVBQUUsRUFDN0MsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLHFCQUFxQjtBQUM5RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFDSCxlQUFLLFFBQVEsT0FBTztBQUNwQixlQUFLLFFBQVEsZUFBZTtBQUFBLFFBQzlCLENBQUM7QUFDSCxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxlQUFlLEVBQ3ZCLFFBQVEscURBQXFELEVBQzdELFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxlQUFlLEVBQzlCLFNBQVMsWUFBWSxzQkFBc0IsRUFBRSxFQUM3QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUscUJBQXFCO0FBQzlELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUNILFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGlCQUFpQixFQUN6QjtBQUFBLFVBQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxZQUFZLEVBQzNCLFNBQVMsWUFBWSxrQkFBa0IsRUFBRSxFQUN6QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsaUJBQWlCO0FBQzFELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFDRixZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxtQkFBbUIsRUFDM0IsUUFBUSwrRUFBNEUsRUFDcEY7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsaUJBQWlCLEVBQ2hDLFNBQVMsWUFBWSwwQkFBMEIsRUFBRSxFQUNqRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUseUJBQXlCO0FBQ2xFLGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFBQSxNQUNKLFdBQVcsYUFBYSxXQUFXO0FBQ2pDLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGlCQUFpQixFQUN6QixRQUFRLHdDQUF3QyxFQUNoRDtBQUFBLFVBQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxXQUFXLEVBQzFCLFNBQVMsWUFBWSxpQkFBaUIsRUFBRSxFQUN4QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsZ0JBQWdCO0FBQ3pELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFDRixZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxjQUFjLEVBQ3RCLFFBQVEseUVBQXlFLEVBQ2pGLFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxvQkFBb0IsRUFDbkMsU0FBUyxZQUFZLHNCQUFzQixFQUFFLEVBQzdDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxxQkFBcUI7QUFDOUQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQUEsTUFDTCxXQUFXLGFBQWEsWUFBWTtBQUNsQyxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxjQUFjLEVBQ3RCLFFBQVEsdURBQXVELEVBQy9ELFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxvQkFBb0IsRUFDbkMsU0FBUyxZQUFZLHVCQUF1QixFQUFFLEVBQzlDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxzQkFBc0I7QUFDL0Qsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQ0gsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsbUJBQW1CLEVBQzNCLFFBQVEsaUNBQWlDLEVBQ3pDO0FBQUEsVUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLG1CQUFtQixFQUNsQyxTQUFTLFlBQVkscUJBQXFCLEVBQUUsRUFDNUMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLG9CQUFvQjtBQUM3RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQUEsTUFDSixXQUFXLGFBQWEsVUFBVTtBQUNoQyxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxVQUFVLEVBQ2xCLFFBQVEscURBQXFELEVBQzdEO0FBQUEsVUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLGVBQWUsRUFDOUIsU0FBUyxZQUFZLGdCQUFnQixFQUFFLEVBQ3ZDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxlQUFlO0FBQ3hELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFDRixZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxhQUFhLEVBQ3JCLFFBQVEsZ0ZBQWdGLEVBQ3hGLFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxPQUFPLEVBQ3RCLFNBQVMsWUFBWSxrQkFBa0IsRUFBRSxFQUN6QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsaUJBQWlCO0FBQzFELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUNILFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLFdBQVcsRUFDbkIsUUFBUSwwREFBMEQsRUFDbEU7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsYUFBYSxFQUM1QixTQUFTLFlBQVksaUJBQWlCLEVBQUUsRUFDeEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGdCQUFnQjtBQUN6RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQUEsTUFDSjtBQUVBLFVBQUksd0JBQVEsYUFBYSxFQUN0QjtBQUFBLFFBQVUsQ0FBQyxRQUNWLElBQUksY0FBYyxpQkFBaUIsRUFBRSxRQUFRLE1BQU07QUFDakQsY0FBSSxDQUFDLEtBQUssT0FBTyxvQkFBb0IsV0FBVyxHQUFHO0FBQ2pELGdCQUFJLHVCQUFPLDZCQUE2QjtBQUN4QztBQUFBLFVBQ0Y7QUFDQSxjQUFJLGFBQWEsY0FBYztBQUM3QixrQkFBTSxNQUFNLEdBQUcsWUFBWSxJQUFJLFFBQVEsT0FBTyxFQUFFLENBQUM7QUFDakQsNENBQVc7QUFBQSxjQUNUO0FBQUEsY0FDQSxRQUFRO0FBQUEsY0FDUixTQUFTLEVBQUUsaUJBQWlCLFlBQVksT0FBTztBQUFBLFlBQ2pELENBQUMsRUFBRSxLQUFLLENBQUMsYUFBYTtBQUNwQixrQkFBSSxTQUFTLFVBQVUsT0FBTyxTQUFTLFNBQVMsS0FBSztBQUNuRCxvQkFBSSx1QkFBTyxpQkFBaUIsWUFBWSxRQUFRLFlBQVksR0FBRyxhQUFhO0FBQUEsY0FDOUUsT0FBTztBQUNMLG9CQUFJLHVCQUFPLEdBQUcsWUFBWSxRQUFRLFlBQVksR0FBRyxtQkFBbUIsU0FBUyxNQUFNLEVBQUU7QUFBQSxjQUN2RjtBQUFBLFlBQ0YsQ0FBQyxFQUFFLE1BQU0sTUFBTTtBQUNiLGtCQUFJLHVCQUFPLG1CQUFtQixZQUFZLFFBQVEsWUFBWSxHQUFHLEVBQUU7QUFBQSxZQUNyRSxDQUFDO0FBQUEsVUFDSCxPQUFPO0FBQ0wsZ0JBQUksdUJBQU8sbUNBQW1DLFlBQVksSUFBSSxvQkFBb0I7QUFBQSxVQUNwRjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0gsRUFDQztBQUFBLFFBQVUsQ0FBQyxRQUNWLElBQ0csY0FBYyxvQkFBb0IsRUFDbEMsV0FBVyxFQUNYLFFBQVEsTUFBTTtBQUNiLGdCQUFNLFlBQVksY0FBYyxVQUFVO0FBQUEsWUFDeEMsS0FBSztBQUFBLFVBQ1AsQ0FBQztBQUNELG9CQUFVLFNBQVMsUUFBUTtBQUFBLFlBQ3pCLE1BQU0sV0FBVyxZQUFZLFFBQVEsa0JBQWtCO0FBQUEsVUFDekQsQ0FBQztBQUNELGdCQUFNLFNBQVMsVUFBVSxTQUFTLFVBQVU7QUFBQSxZQUMxQyxNQUFNO0FBQUEsWUFDTixLQUFLO0FBQUEsVUFDUCxDQUFDO0FBQ0QsZ0JBQU0sUUFBUSxVQUFVLFNBQVMsVUFBVSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzdELGlCQUFPLGlCQUFpQixTQUFTLE1BQU07QUFDckMsaUJBQUssT0FBTyxTQUFTLGFBQWEsT0FBTyxPQUFPLENBQUM7QUFDakQsaUJBQUssS0FBSyxPQUFPLGFBQWEsRUFBRSxLQUFLLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFBQSxVQUMzRCxDQUFDO0FBQ0QsZ0JBQU0saUJBQWlCLFNBQVMsTUFBTSxVQUFVLE9BQU8sQ0FBQztBQUFBLFFBQzFELENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSixDQUFDO0FBRUQsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCO0FBQUEsTUFBVSxDQUFDLFFBQ1YsSUFDRyxjQUFjLGlCQUFpQixFQUMvQixPQUFPLEVBQ1AsUUFBUSxNQUFNO0FBQ2IsYUFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLO0FBQUEsVUFDckMsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sS0FBSztBQUFBLFVBQ0wsUUFBUTtBQUFBLFFBQ1YsQ0FBQztBQUNELGFBQUssS0FBSyxPQUFPLGFBQWEsRUFBRSxLQUFLLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFBQSxNQUMzRCxDQUFDO0FBQUEsSUFDTDtBQUVGLFFBQUksd0JBQVEsV0FBVyxFQUFFLFFBQVEsVUFBVSxFQUFFLFdBQVc7QUFFeEQsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsZ0JBQWdCLEVBQ3hCLFFBQVEsMERBQTBELEVBQ2xFO0FBQUEsTUFBWSxDQUFDLGFBQ1osU0FDRyxVQUFVLFNBQVMsT0FBTyxFQUMxQixVQUFVLGFBQWEsV0FBVyxFQUNsQyxTQUFTLEtBQUssT0FBTyxTQUFTLGFBQWEsRUFDM0MsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsZ0JBQWdCO0FBR3JDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUVGLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLDJCQUEyQixFQUNuQyxRQUFRLCtEQUErRCxFQUN2RTtBQUFBLE1BQVUsQ0FBQyxXQUNWLE9BQ0csU0FBUyxLQUFLLE9BQU8sU0FBUyxvQkFBb0IsRUFDbEQsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsdUJBQXVCO0FBQzVDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUVGLFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLDZCQUE2QixFQUNyQztBQUFBLE1BQ0M7QUFBQSxJQUNGLEVBQ0M7QUFBQSxNQUFVLENBQUMsV0FDVixPQUNHLFNBQVMsS0FBSyxPQUFPLFNBQVMsbUJBQW1CLEVBQ2pELFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLHNCQUFzQjtBQUMzQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFBRSxRQUFRLGNBQWMsRUFBRSxXQUFXO0FBRTVELFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLHNCQUFzQixFQUM5QjtBQUFBLE1BQ0M7QUFBQSxJQUVGLEVBQ0M7QUFBQSxNQUFVLENBQUMsV0FDVixPQUNHLFNBQVMsS0FBSyxPQUFPLFNBQVMsaUJBQWlCLEVBQy9DLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGFBQUssT0FBTyxTQUFTLG9CQUFvQjtBQUN6QyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsTUFDakMsQ0FBQztBQUFBLElBQ0w7QUFFRixVQUFNLGlCQUFpQixLQUFLLE9BQU8sU0FBUyxhQUFhLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxZQUFZO0FBQzlGLFFBQUksZUFBZSxTQUFTLEdBQUc7QUFDN0IsVUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsMEJBQTBCLEVBQ2xDLFFBQVEsb0ZBQW9GLEVBQzVGLFlBQVksQ0FBQyxPQUFPO0FBQ25CLFdBQUcsVUFBVSxJQUFJLDhCQUE4QjtBQUMvQyxtQkFBVyxLQUFLLGdCQUFnQjtBQUM5QixhQUFHLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSTtBQUFBLFFBQzdCO0FBQ0EsV0FBRyxTQUFTLEtBQUssT0FBTyxTQUFTLHNCQUFzQixFQUNwRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixlQUFLLE9BQU8sU0FBUyx5QkFBeUI7QUFDOUMsZ0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxRQUNqQyxDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUdBLFFBQUksd0JBQVEsV0FBVyxFQUFFLFFBQVEsU0FBUyxFQUFFLFdBQVc7QUFDdkQsZ0JBQVksU0FBUyxLQUFLO0FBQUEsTUFDeEIsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUVELFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLGlCQUFpQixFQUN6QixRQUFRLCtCQUErQixFQUN2QztBQUFBLE1BQVUsQ0FBQyxRQUNWLElBQUksY0FBYyxTQUFTLEVBQUUsUUFBUSxNQUFNO0FBQ3pDLGVBQU8sS0FBSyx5Q0FBeUMsUUFBUTtBQUFBLE1BQy9ELENBQUM7QUFBQSxJQUNIO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsaUJBQWlCLEVBQ3pCLFFBQVEsb0NBQW9DLEVBQzVDO0FBQUEsTUFBVSxDQUFDLFFBQ1YsSUFBSSxjQUFjLFNBQVMsRUFBRSxRQUFRLE1BQU07QUFDekMsZUFBTyxLQUFLLDZDQUE2QyxRQUFRO0FBQUEsTUFDbkUsQ0FBQztBQUFBLElBQ0g7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxxQkFBcUIsRUFDN0IsUUFBUSx5QkFBeUIsRUFDakM7QUFBQSxNQUFVLENBQUMsUUFDVixJQUFJLGNBQWMsTUFBTSxFQUFFLFFBQVEsTUFBTTtBQUN0QyxlQUFPLEtBQUssbUNBQW1DLFFBQVE7QUFBQSxNQUN6RCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0o7QUFDRjtBQU1BLElBQU0sbUJBQU4sY0FBK0Isc0JBQU07QUFBQSxFQUluQyxZQUFZLEtBQVUsT0FBZSxhQUFzQjtBQUN6RCxVQUFNLEdBQUc7QUFDVCxTQUFLLFFBQVE7QUFDYixTQUFLLGNBQWM7QUFBQSxFQUNyQjtBQUFBLEVBRUEsU0FBUztBQUNQLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxTQUFTLCtCQUErQjtBQUNsRCxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELGNBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSxTQUFTLE9BQU8sS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBRS9ELFVBQU0sVUFBVSxNQUFNLFFBQVEsS0FBSyxXQUFXLElBQ3pDLEtBQUssY0FDTixDQUFDO0FBRUwsUUFBSSxRQUFRLFdBQVcsR0FBRztBQUN4QixnQkFBVSxTQUFTLEtBQUs7QUFBQSxRQUN0QixNQUFNO0FBQUEsTUFDUixDQUFDO0FBQUEsSUFDSCxPQUFPO0FBQ0wsZ0JBQVUsU0FBUyxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsUUFBUSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hGLFlBQU0sT0FBTyxVQUFVLFNBQVMsSUFBSTtBQUNwQyxpQkFBVyxTQUFTLFNBQVM7QUFDM0IsY0FBTSxLQUFLLEtBQUssU0FBUyxJQUFJO0FBQzdCLFlBQUksTUFBTSxLQUFLO0FBQ2IsZ0JBQU0sSUFBSSxHQUFHLFNBQVMsS0FBSyxFQUFFLE1BQU0sTUFBTSxRQUFRLE1BQU0sSUFBSSxDQUFDO0FBQzVELFlBQUUsT0FBTyxNQUFNO0FBQ2YsWUFBRSxTQUFTO0FBQ1gsWUFBRSxNQUFNO0FBQUEsUUFDVixPQUFPO0FBQ0wsYUFBRyxRQUFRLE1BQU0sUUFBUSxTQUFTO0FBQUEsUUFDcEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBQ3JFLFVBQU0sV0FBVyxRQUFRLFNBQVMsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzdELGFBQVMsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUFBLEVBQ3ZEO0FBQUEsRUFFQSxVQUFVO0FBQ1IsU0FBSyxVQUFVLE1BQU07QUFBQSxFQUN2QjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
