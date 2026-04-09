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
  stripObsidianSyntax: true
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
  }
  onunload() {
    this.statusBarEl = null;
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
          if (response.json?.upserted) verb = "Updated";
        } catch {
        }
        new import_obsidian.Notice(`${verb} "${title}" on ${destination.name} as ${status}`);
        this.showStatusBarSuccess(destination.name);
        let syndicationUrl;
        try {
          syndicationUrl = response.json?.url || `${destination.url.replace(/\/$/, "")}/${payload.slug}`;
        } catch {
          syndicationUrl = `${destination.url.replace(/\/$/, "")}/${payload.slug}`;
        }
        await this.writeSyndication(file, destination.name, syndicationUrl);
      } else {
        let errorDetail;
        try {
          errorDetail = response.json?.error || String(response.status);
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
        const articleUrl = response.json?.url || "https://dev.to";
        new import_obsidian.Notice(`POSSEd "${title}" to Dev.to`);
        this.showStatusBarSuccess("Dev.to");
        await this.writeSyndication(file, destination.name, articleUrl);
      } else {
        let errorDetail;
        try {
          errorDetail = response.json?.error || String(response.status);
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
        const statusUrl = response.json?.url || instanceUrl;
        new import_obsidian.Notice(`POSSEd "${title}" to Mastodon`);
        this.showStatusBarSuccess("Mastodon");
        await this.writeSyndication(file, destination.name, statusUrl);
      } else {
        let errorDetail;
        try {
          errorDetail = response.json?.error || String(response.status);
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
        const uri = createResponse.json?.uri || "";
        const postUrl = uri ? `https://bsky.app/profile/${destination.handle}/post/${uri.split("/").pop()}` : "https://bsky.app";
        new import_obsidian.Notice(`POSSEd "${title}" to Bluesky`);
        this.showStatusBarSuccess("Bluesky");
        await this.writeSyndication(file, destination.name, postUrl);
      } else {
        let errorDetail;
        try {
          errorDetail = String(createResponse.json?.message || createResponse.status);
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
    const syndication = fileCache?.frontmatter?.syndication;
    const title = fileCache?.frontmatter?.title || view.file.basename;
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
    new import_obsidian.Setting(containerEl).setName("Canonical base URL").setDesc("Your own site's root URL. Every published post will include a canonicalUrl pointing here \u2014 the original you own.").addText(
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
        (dd) => dd.addOption("custom-api", "Custom API").addOption("devto", "Dev.to").addOption("mastodon", "Mastodon").addOption("bluesky", "Bluesky").addOption("medium", "Medium").addOption("reddit", "Reddit").addOption("threads", "Threads").addOption("linkedin", "LinkedIn").addOption("ecency", "Ecency (hive)").setValue(destination.type || "custom-api").onChange(async (value) => {
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
        new import_obsidian.Setting(destContainer).setName("Refresh token").setDesc("OAuth2 refresh token for your Reddit account").addText((text) => {
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
        new import_obsidian.Setting(destContainer).setName("Access token").setDesc("OAuth2 bearer token with w_member_social scope").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.linkedinAccessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].linkedinAccessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Person urn").setDesc("Your LinkedIn member urn, e.g. Urn:li:person:abc123").addText(
          (text) => text.setPlaceholder("Urn:li:person:...").setValue(destination.linkedinPersonUrn || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].linkedinPersonUrn = value;
            await this.plugin.saveSettings();
          })
        );
      } else if (destType === "ecency") {
        new import_obsidian.Setting(destContainer).setName("Hive username").setDesc("Your hive/ecency account name (without @)").addText(
          (text) => text.setPlaceholder("Yourusername").setValue(destination.hiveUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hiveUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Posting key").setDesc("Your hive private posting key (not the owner or active key)").addText((text) => {
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
        text: "This note has not been POSSEd to any destination yet."
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiIHwgXCJtZWRpdW1cIiB8IFwicmVkZGl0XCIgfCBcInRocmVhZHNcIiB8IFwibGlua2VkaW5cIiB8IFwiZWNlbmN5XCI7XHJcblxyXG5pbnRlcmZhY2UgRGVzdGluYXRpb24ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB0eXBlOiBEZXN0aW5hdGlvblR5cGU7XHJcbiAgLy8gY3VzdG9tLWFwaVxyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG4gIC8vIG1hc3RvZG9uXHJcbiAgaW5zdGFuY2VVcmw/OiBzdHJpbmc7XHJcbiAgYWNjZXNzVG9rZW4/OiBzdHJpbmc7XHJcbiAgLy8gYmx1ZXNreVxyXG4gIGhhbmRsZT86IHN0cmluZztcclxuICBhcHBQYXNzd29yZD86IHN0cmluZztcclxuICAvLyBtZWRpdW1cclxuICBtZWRpdW1Ub2tlbj86IHN0cmluZztcclxuICBtZWRpdW1BdXRob3JJZD86IHN0cmluZztcclxuICAvLyByZWRkaXRcclxuICByZWRkaXRDbGllbnRJZD86IHN0cmluZztcclxuICByZWRkaXRDbGllbnRTZWNyZXQ/OiBzdHJpbmc7XHJcbiAgcmVkZGl0UmVmcmVzaFRva2VuPzogc3RyaW5nO1xyXG4gIHJlZGRpdFVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHJlZGRpdERlZmF1bHRTdWJyZWRkaXQ/OiBzdHJpbmc7XHJcbiAgLy8gdGhyZWFkc1xyXG4gIHRocmVhZHNVc2VySWQ/OiBzdHJpbmc7XHJcbiAgdGhyZWFkc0FjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGxpbmtlZGluXHJcbiAgbGlua2VkaW5BY2Nlc3NUb2tlbj86IHN0cmluZztcclxuICBsaW5rZWRpblBlcnNvblVybj86IHN0cmluZztcclxuICAvLyBlY2VuY3kgLyBoaXZlXHJcbiAgaGl2ZVVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIGhpdmVQb3N0aW5nS2V5Pzogc3RyaW5nO1xyXG4gIGhpdmVDb21tdW5pdHk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IHtcclxuICBkZXN0aW5hdGlvbnM6IFtdLFxyXG4gIGNhbm9uaWNhbEJhc2VVcmw6IFwiXCIsXHJcbiAgZGVmYXVsdFN0YXR1czogXCJkcmFmdFwiLFxyXG4gIGNvbmZpcm1CZWZvcmVQdWJsaXNoOiB0cnVlLFxyXG4gIHN0cmlwT2JzaWRpYW5TeW50YXg6IHRydWUsXHJcbn07XHJcblxyXG5pbnRlcmZhY2UgRnJvbnRtYXR0ZXIge1xyXG4gIHRpdGxlPzogc3RyaW5nO1xyXG4gIHNsdWc/OiBzdHJpbmc7XHJcbiAgZXhjZXJwdD86IHN0cmluZztcclxuICB0eXBlPzogc3RyaW5nO1xyXG4gIHN0YXR1cz86IHN0cmluZztcclxuICB0YWdzPzogc3RyaW5nW107XHJcbiAgcGlsbGFyPzogc3RyaW5nO1xyXG4gIGNvdmVySW1hZ2U/OiBzdHJpbmc7XHJcbiAgZmVhdHVyZWQ/OiBib29sZWFuO1xyXG4gIG1ldGFUaXRsZT86IHN0cmluZztcclxuICBtZXRhRGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbiAgb2dJbWFnZT86IHN0cmluZztcclxuICB2aWRlb1VybD86IHN0cmluZztcclxuICBjYW5vbmljYWxVcmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBFeHRyYWN0IGJvZHkgY29udGVudCBiZWxvdyB0aGUgWUFNTCBmcm9udG1hdHRlciBmZW5jZS4gKi9cclxuZnVuY3Rpb24gZXh0cmFjdEJvZHkoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXHI/XFxuW1xcc1xcU10qP1xccj9cXG4tLS1cXHI/XFxuPyhbXFxzXFxTXSopJC8pO1xyXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRyaW0oKSA6IGNvbnRlbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBhIEZyb250bWF0dGVyIG9iamVjdCBmcm9tIE9ic2lkaWFuJ3MgY2FjaGVkIG1ldGFkYXRhLlxyXG4gKiBGYWxscyBiYWNrIGdyYWNlZnVsbHkgd2hlbiBmaWVsZHMgYXJlIGFic2VudC5cclxuICovXHJcbmZ1bmN0aW9uIGJ1aWxkRnJvbnRtYXR0ZXIoY2FjaGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKTogRnJvbnRtYXR0ZXIge1xyXG4gIGlmICghY2FjaGUpIHJldHVybiB7fTtcclxuICBjb25zdCBmbTogRnJvbnRtYXR0ZXIgPSB7fTtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50aXRsZSA9PT0gXCJzdHJpbmdcIikgZm0udGl0bGUgPSBjYWNoZS50aXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnNsdWcgPT09IFwic3RyaW5nXCIpIGZtLnNsdWcgPSBjYWNoZS5zbHVnO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuZXhjZXJwdCA9PT0gXCJzdHJpbmdcIikgZm0uZXhjZXJwdCA9IGNhY2hlLmV4Y2VycHQ7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50eXBlID09PSBcInN0cmluZ1wiKSBmbS50eXBlID0gY2FjaGUudHlwZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnN0YXR1cyA9PT0gXCJzdHJpbmdcIikgZm0uc3RhdHVzID0gY2FjaGUuc3RhdHVzO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUucGlsbGFyID09PSBcInN0cmluZ1wiKSBmbS5waWxsYXIgPSBjYWNoZS5waWxsYXI7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jb3ZlckltYWdlID09PSBcInN0cmluZ1wiKSBmbS5jb3ZlckltYWdlID0gY2FjaGUuY292ZXJJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFUaXRsZSA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YVRpdGxlID0gY2FjaGUubWV0YVRpdGxlO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUubWV0YURlc2NyaXB0aW9uID09PSBcInN0cmluZ1wiKSBmbS5tZXRhRGVzY3JpcHRpb24gPSBjYWNoZS5tZXRhRGVzY3JpcHRpb247XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5vZ0ltYWdlID09PSBcInN0cmluZ1wiKSBmbS5vZ0ltYWdlID0gY2FjaGUub2dJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnZpZGVvVXJsID09PSBcInN0cmluZ1wiKSBmbS52aWRlb1VybCA9IGNhY2hlLnZpZGVvVXJsO1xyXG5cclxuICBpZiAodHlwZW9mIGNhY2hlLmZlYXR1cmVkID09PSBcImJvb2xlYW5cIikgZm0uZmVhdHVyZWQgPSBjYWNoZS5mZWF0dXJlZDtcclxuICBlbHNlIGlmIChjYWNoZS5mZWF0dXJlZCA9PT0gXCJ0cnVlXCIpIGZtLmZlYXR1cmVkID0gdHJ1ZTtcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2FjaGUudGFncykpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzLm1hcCgodDogdW5rbm93bikgPT4gU3RyaW5nKHQpLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGNhY2hlLnRhZ3MgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzXHJcbiAgICAgIC5yZXBsYWNlKC9eXFxbfFxcXSQvZywgXCJcIilcclxuICAgICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgICAubWFwKCh0OiBzdHJpbmcpID0+IHQudHJpbSgpKVxyXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jYW5vbmljYWxVcmwgPT09IFwic3RyaW5nXCIpIGZtLmNhbm9uaWNhbFVybCA9IGNhY2hlLmNhbm9uaWNhbFVybDtcclxuXHJcbiAgcmV0dXJuIGZtO1xyXG59XHJcblxyXG4vKiogQ29udmVydCBhIHRpdGxlIHN0cmluZyB0byBhIFVSTC1zYWZlIHNsdWcsIGhhbmRsaW5nIGRpYWNyaXRpY3MuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1NsdWcodGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHRpdGxlXHJcbiAgICAubm9ybWFsaXplKFwiTkZEXCIpXHJcbiAgICAucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCBcIi1cIilcclxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCBcIlwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFByZS1wcm9jZXNzIE9ic2lkaWFuLXNwZWNpZmljIG1hcmtkb3duIGJlZm9yZSBzZW5kaW5nIHRvIHRoZSBibG9nIEFQSS5cclxuICogU3RyaXBzIHdpa2ktbGlua3MsIGVtYmVkcywgY29tbWVudHMsIGFuZCBkYXRhdmlldyBibG9ja3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2Vzc0NvbnRlbnQoYm9keTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAvLyBSZW1vdmUgT2JzaWRpYW4gY29tbWVudHM6ICUlLi4uJSVcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8lJVtcXHNcXFNdKj8lJS9nLCBcIlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmsgZW1iZWRzOiAhW1tmaWxlXV0gXHUyMTkyIChyZW1vdmVkKVxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoLyFcXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRoIGFsaWFzOiBbW3RhcmdldHxhbGlhc11dIFx1MjE5MiBhbGlhc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXXxdKylcXHwoW15cXF1dKylcXF1cXF0vZywgXCIkMlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmtzIHdpdGhvdXQgYWxpYXM6IFtbdGFyZ2V0XV0gXHUyMTkyIHRhcmdldFxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXV0rKVxcXVxcXS9nLCBcIiQxXCIpO1xyXG5cclxuICAvLyBSZW1vdmUgZGF0YXZpZXcgY29kZSBibG9ja3NcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9gYGBkYXRhdmlld1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdqc1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcblxyXG4gIC8vIENsZWFuIHVwIGV4Y2VzcyBibGFuayBsaW5lcyBsZWZ0IGJ5IHJlbW92YWxzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGJvZHkudHJpbSgpO1xyXG59XHJcblxyXG4vKiogRXNjYXBlIEhUTUwgc3BlY2lhbCBjaGFyYWN0ZXJzLiAqL1xyXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gc3RyXHJcbiAgICAucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpXHJcbiAgICAucmVwbGFjZSgvPC9nLCBcIiZsdDtcIilcclxuICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBiYXNpYyBNYXJrZG93biB0byBIVE1MLiBIYW5kbGVzIGhlYWRpbmdzLCBib2xkLCBpdGFsaWMsIGlubGluZSBjb2RlLFxyXG4gKiBsaW5rcywgaW1hZ2VzLCBsaXN0cywgYmxvY2txdW90ZXMsIGhvcml6b250YWwgcnVsZXMsIGZlbmNlZCBjb2RlIGJsb2NrcywgYW5kIHBhcmFncmFwaHMuXHJcbiAqIE5vIGV4dGVybmFsIGRlcGVuZGVuY2llcyBcdTIwMTQgcmVnZXggb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93blRvSHRtbChtYXJrZG93bjogc3RyaW5nKTogc3RyaW5nIHtcclxuICBsZXQgaHRtbCA9IG1hcmtkb3duO1xyXG5cclxuICAvLyBGZW5jZWQgY29kZSBibG9ja3MgKHByb2Nlc3MgZmlyc3QgdG8gYXZvaWQgbWFuZ2xpbmcgdGhlaXIgY29udGVudHMpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvYGBgKFxcdyopXFxuKFtcXHNcXFNdKj8pYGBgL2csIChfLCBsYW5nLCBjb2RlKSA9PlxyXG4gICAgYDxwcmU+PGNvZGUke2xhbmcgPyBgIGNsYXNzPVwibGFuZ3VhZ2UtJHtsYW5nfVwiYCA6IFwiXCJ9PiR7ZXNjYXBlSHRtbChjb2RlLnRyaW0oKSl9PC9jb2RlPjwvcHJlPmBcclxuICApO1xyXG5cclxuICAvLyBIZWFkaW5nc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjIyMgKC4rKSQvZ20sIFwiPGg2PiQxPC9oNj5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXiMjIyMjICguKykkL2dtLCBcIjxoNT4kMTwvaDU+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjICguKykkL2dtLCBcIjxoND4kMTwvaDQ+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMgKC4rKSQvZ20sIFwiPGgzPiQxPC9oMz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXiMjICguKykkL2dtLCBcIjxoMj4kMTwvaDI+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jICguKykkL2dtLCBcIjxoMT4kMTwvaDE+XCIpO1xyXG5cclxuICAvLyBIb3Jpem9udGFsIHJ1bGVzXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXlstKl9dezMsfVxccyokL2dtLCBcIjxocj5cIik7XHJcblxyXG4gIC8vIEJsb2NrcXVvdGVzXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXj4gKC4rKSQvZ20sIFwiPGJsb2NrcXVvdGU+JDE8L2Jsb2NrcXVvdGU+XCIpO1xyXG5cclxuICAvLyBCb2xkICsgaXRhbGljIChvcmRlcjogdHJpcGxlIFx1MjE5MiBkb3VibGUgXHUyMTkyIHNpbmdsZSlcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXCpcXCpcXCooLis/KVxcKlxcKlxcKi9nLCBcIjxzdHJvbmc+PGVtPiQxPC9lbT48L3N0cm9uZz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFwqXFwqKC4rPylcXCpcXCovZywgXCI8c3Ryb25nPiQxPC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcKiguKz8pXFwqL2csIFwiPGVtPiQxPC9lbT5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvX19fKC4rPylfX18vZywgXCI8c3Ryb25nPjxlbT4kMTwvZW0+PC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL19fKC4rPylfXy9nLCBcIjxzdHJvbmc+JDE8L3N0cm9uZz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXyguKz8pXy9nLCBcIjxlbT4kMTwvZW0+XCIpO1xyXG5cclxuICAvLyBJbmxpbmUgY29kZVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL2AoW15gXSspYC9nLCBcIjxjb2RlPiQxPC9jb2RlPlwiKTtcclxuXHJcbiAgLy8gSW1hZ2VzIChiZWZvcmUgbGlua3MpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKChbXildKylcXCkvZywgJzxpbWcgc3JjPVwiJDJcIiBhbHQ9XCIkMVwiPicpO1xyXG5cclxuICAvLyBMaW5rc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKChbXildKylcXCkvZywgJzxhIGhyZWY9XCIkMlwiPiQxPC9hPicpO1xyXG5cclxuICAvLyBVbm9yZGVyZWQgbGlzdCBpdGVtc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15bLSorXSAoLispJC9nbSwgXCI8bGk+JDE8L2xpPlwiKTtcclxuXHJcbiAgLy8gT3JkZXJlZCBsaXN0IGl0ZW1zXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXlxcZCtcXC4gKC4rKSQvZ20sIFwiPGxpPiQxPC9saT5cIik7XHJcblxyXG4gIC8vIFdyYXAgPGxpPiBydW5zIGluIDx1bD5cclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC8oPGxpPltcXHNcXFNdKj88XFwvbGk+XFxuPykrL2csIChtYXRjaCkgPT4gYDx1bD4ke21hdGNofTwvdWw+YCk7XHJcblxyXG4gIC8vIFBhcmFncmFwaHMgKGRvdWJsZSBuZXdsaW5lIFx1MjE5MiBwYXJhZ3JhcGggYmxvY2spXHJcbiAgaHRtbCA9IGh0bWxcclxuICAgIC5zcGxpdCgvXFxuXFxuKy8pXHJcbiAgICAubWFwKChibG9jaykgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkID0gYmxvY2sudHJpbSgpO1xyXG4gICAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBcIlwiO1xyXG4gICAgICBpZiAoL148KGhbMS02XXx1bHxvbHxsaXxibG9ja3F1b3RlfHByZXxocikvLnRlc3QodHJpbW1lZCkpIHJldHVybiB0cmltbWVkO1xyXG4gICAgICByZXR1cm4gYDxwPiR7dHJpbW1lZC5yZXBsYWNlKC9cXG4vZywgXCI8YnI+XCIpfTwvcD5gO1xyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgIC5qb2luKFwiXFxuXCIpO1xyXG5cclxuICByZXR1cm4gaHRtbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmlwIGFsbCBNYXJrZG93biBzeW50YXggdG8gcHJvZHVjZSBwbGFpbiB0ZXh0IHN1aXRhYmxlIGZvclxyXG4gKiBjaGFyYWN0ZXItbGltaXRlZCBwbGF0Zm9ybXMgKFRocmVhZHMsIE1hc3RvZG9uIHByZXZpZXcsIGV0Yy4pLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duVG9QbGFpblRleHQobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgbGV0IHRleHQgPSBtYXJrZG93bjtcclxuICAvLyBGZW5jZWQgY29kZSBibG9ja3MgXHUyMTkyIGtlZXAgY29udGVudFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2BgYFxcdypcXG4oW1xcc1xcU10qPylgYGAvZywgXCIkMVwiKTtcclxuICAvLyBSZW1vdmUgaGVhZGluZyBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXiN7MSw2fSAvZ20sIFwiXCIpO1xyXG4gIC8vIEJvbGQvaXRhbGljIG1hcmtlcnNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXCp7MSwzfXxfezEsM30vZywgXCJcIik7XHJcbiAgLy8gSW5saW5lIGNvZGUgXHUyMTkyIHVud3JhcFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2AoW15gXSspYC9nLCBcIiQxXCIpO1xyXG4gIC8vIEltYWdlcyBcdTIxOTIgYWx0IHRleHRcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8hXFxbKFteXFxdXSopXFxdXFwoW14pXStcXCkvZywgXCIkMVwiKTtcclxuICAvLyBMaW5rcyBcdTIxOTIgbGluayB0ZXh0XHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoW14pXStcXCkvZywgXCIkMVwiKTtcclxuICAvLyBCbG9ja3F1b3Rlc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14+IC9nbSwgXCJcIik7XHJcbiAgLy8gTGlzdCBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlstKitcXGQuXSAvZ20sIFwiXCIpO1xyXG4gIC8vIEhvcml6b250YWwgcnVsZXNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eWy0qX117Myx9XFxzKiQvZ20sIFwiXCIpO1xyXG4gIC8vIENvbGxhcHNlIG11bHRpcGxlIGJsYW5rIGxpbmVzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuICByZXR1cm4gdGV4dC50cmltKCk7XHJcbn1cclxuXHJcbmNvbnN0IEZST05UTUFUVEVSX1RFTVBMQVRFID0gYC0tLVxyXG50aXRsZTogXHJcbnNsdWc6IFxyXG5leGNlcnB0OiBcclxudHlwZTogYmxvZ1xyXG5zdGF0dXM6IGRyYWZ0XHJcbnRhZ3M6IFtdXHJcbnBpbGxhcjogXHJcbmNvdmVySW1hZ2U6IFxyXG5mZWF0dXJlZDogZmFsc2VcclxubWV0YVRpdGxlOiBcclxubWV0YURlc2NyaXB0aW9uOiBcclxub2dJbWFnZTogXHJcbnZpZGVvVXJsOiBcclxuY2Fub25pY2FsVXJsOiBcclxuc3luZGljYXRpb246IFtdXHJcbi0tLVxyXG5cclxuYDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvc3NlUHVibGlzaGVyUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuICBzZXR0aW5nczogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XHJcbiAgcHJpdmF0ZSBzdGF0dXNCYXJFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgYXN5bmMgb25sb2FkKCkge1xyXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuICAgIHRoaXMubWlncmF0ZVNldHRpbmdzKCk7XHJcblxyXG4gICAgdGhpcy5zdGF0dXNCYXJFbCA9IHRoaXMuYWRkU3RhdHVzQmFySXRlbSgpO1xyXG5cclxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcInNlbmRcIiwgXCJQb3NzZSBwdWJsaXNoXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2hcIixcclxuICAgICAgbmFtZTogXCJQb3NzZSBwdWJsaXNoXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1kcmFmdFwiLFxyXG4gICAgICBuYW1lOiBcIlBvc3NlIHB1Ymxpc2ggYXMgZHJhZnRcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwiZHJhZnRcIiksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoLWxpdmVcIixcclxuICAgICAgbmFtZTogXCJQb3NzZSBwdWJsaXNoIGxpdmVcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwicHVibGlzaGVkXCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtaW5zZXJ0LXRlbXBsYXRlXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgaW5zZXJ0IGZyb250bWF0dGVyIHRlbXBsYXRlXCIsXHJcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIGlmIChjb250ZW50LnRyaW1TdGFydCgpLnN0YXJ0c1dpdGgoXCItLS1cIikpIHtcclxuICAgICAgICAgIG5ldyBOb3RpY2UoXCJGcm9udG1hdHRlciBhbHJlYWR5IGV4aXN0cyBpbiB0aGlzIG5vdGVcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3IoMCwgMCk7XHJcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShGUk9OVE1BVFRFUl9URU1QTEFURSwgeyBsaW5lOiAwLCBjaDogMCB9KTtcclxuICAgICAgICAvLyBQbGFjZSBjdXJzb3Igb24gdGhlIHRpdGxlIGxpbmVcclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDEsIDcpO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtdG8tYWxsXCIsXHJcbiAgICAgIG5hbWU6IFwiUG9zc2UgdG8gYWxsIGRlc3RpbmF0aW9uc1wiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5wb3NzZVRvQWxsKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1zdGF0dXNcIixcclxuICAgICAgbmFtZTogXCJQb3NzZSBzdGF0dXMgXHUyMDE0IHZpZXcgc3luZGljYXRpb25cIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VTdGF0dXMoKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBvbnVubG9hZCgpIHtcclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgLy8gTWlncmF0ZSB2MSBzaW5nbGUtc2l0ZSBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIixcclxuICAgICAgICAgIHVybDogcmF3LnNpdGVVcmwsXHJcbiAgICAgICAgICBhcGlLZXk6IChyYXcuYXBpS2V5IGFzIHN0cmluZykgfHwgXCJcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVVcmw7XHJcbiAgICAgIGRlbGV0ZSByYXcuYXBpS2V5O1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBNaWdyYXRlIHNpdGVzIFx1MjE5MiBkZXN0aW5hdGlvbnMga2V5XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcuc2l0ZXMpICYmICFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IHJhdy5zaXRlcyBhcyBEZXN0aW5hdGlvbltdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVzO1xyXG4gICAgICB2b2lkIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucykpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcclxuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBpY2tTaXRlQW5kUHVibGlzaChvdmVycmlkZVN0YXR1cz86IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCIpIHtcclxuICAgIGNvbnN0IHsgZGVzdGluYXRpb25zIH0gPSB0aGlzLnNldHRpbmdzO1xyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbmV3IE5vdGljZShcIkFkZCBhdCBsZWFzdCBvbmUgZGVzdGluYXRpb24gaW4gc2V0dGluZ3NcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHZvaWQgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0aW5hdGlvbnNbMF0sIG92ZXJyaWRlU3RhdHVzKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbmV3IFNpdGVQaWNrZXJNb2RhbCh0aGlzLmFwcCwgZGVzdGluYXRpb25zLCAoZGVzdCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMucHJlcGFyZVB1Ymxpc2goZGVzdCwgb3ZlcnJpZGVTdGF0dXMpO1xyXG4gICAgfSkub3BlbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnVpbGQgdGhlIHB1Ymxpc2ggcGF5bG9hZCBmcm9tIHRoZSBhY3RpdmUgZmlsZSBhbmQgc2V0dGluZ3MuXHJcbiAgICogU2hhcmVkIGJ5IHByZXBhcmVQdWJsaXNoKCkgYW5kIHBvc3NlVG9BbGwoKSB0byBhdm9pZCBkdXBsaWNhdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIGJ1aWxkUGF5bG9hZChcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICAgb3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiLFxyXG4gICk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+IHtcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xyXG4gICAgY29uc3QgZmlsZUNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XHJcbiAgICBjb25zdCBmcm9udG1hdHRlciA9IGJ1aWxkRnJvbnRtYXR0ZXIoZmlsZUNhY2hlPy5mcm9udG1hdHRlcik7XHJcbiAgICBjb25zdCBib2R5ID0gZXh0cmFjdEJvZHkoY29udGVudCk7XHJcbiAgICBjb25zdCBwcm9jZXNzZWRCb2R5ID0gdGhpcy5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4ID8gcHJlcHJvY2Vzc0NvbnRlbnQoYm9keSkgOiBib2R5O1xyXG4gICAgY29uc3QgdGl0bGUgPSBmcm9udG1hdHRlci50aXRsZSB8fCBmaWxlLmJhc2VuYW1lIHx8IFwiVW50aXRsZWRcIjtcclxuICAgIGNvbnN0IHNsdWcgPSBmcm9udG1hdHRlci5zbHVnIHx8IHRvU2x1Zyh0aXRsZSk7XHJcbiAgICBjb25zdCBzdGF0dXMgPSBvdmVycmlkZVN0YXR1cyB8fCBmcm9udG1hdHRlci5zdGF0dXMgfHwgdGhpcy5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzO1xyXG4gICAgY29uc3QgcG9zdFR5cGUgPSBmcm9udG1hdHRlci50eXBlIHx8IFwiYmxvZ1wiO1xyXG4gICAgLy8gVXNlIGZyb250bWF0dGVyIGNhbm9uaWNhbFVybCBvdmVycmlkZSBpZiBwcmVzZW50OyBvdGhlcndpc2UgYXV0by1nZW5lcmF0ZVxyXG4gICAgY29uc3QgY2Fub25pY2FsVXJsID1cclxuICAgICAgZnJvbnRtYXR0ZXIuY2Fub25pY2FsVXJsIHx8XHJcbiAgICAgICh0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmxcclxuICAgICAgICA/IGAke3RoaXMuc2V0dGluZ3MuY2Fub25pY2FsQmFzZVVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9LyR7cG9zdFR5cGV9LyR7c2x1Z31gXHJcbiAgICAgICAgOiBcIlwiKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRpdGxlLFxyXG4gICAgICBzbHVnLFxyXG4gICAgICBib2R5OiBwcm9jZXNzZWRCb2R5LFxyXG4gICAgICBleGNlcnB0OiBmcm9udG1hdHRlci5leGNlcnB0IHx8IFwiXCIsXHJcbiAgICAgIHR5cGU6IHBvc3RUeXBlLFxyXG4gICAgICBzdGF0dXMsXHJcbiAgICAgIHRhZ3M6IGZyb250bWF0dGVyLnRhZ3MgfHwgW10sXHJcbiAgICAgIHBpbGxhcjogZnJvbnRtYXR0ZXIucGlsbGFyIHx8IFwiXCIsXHJcbiAgICAgIGZlYXR1cmVkOiBmcm9udG1hdHRlci5mZWF0dXJlZCB8fCBmYWxzZSxcclxuICAgICAgY292ZXJJbWFnZTogZnJvbnRtYXR0ZXIuY292ZXJJbWFnZSB8fCBcIlwiLFxyXG4gICAgICBtZXRhVGl0bGU6IGZyb250bWF0dGVyLm1ldGFUaXRsZSB8fCBcIlwiLFxyXG4gICAgICBtZXRhRGVzY3JpcHRpb246IGZyb250bWF0dGVyLm1ldGFEZXNjcmlwdGlvbiB8fCBcIlwiLFxyXG4gICAgICBvZ0ltYWdlOiBmcm9udG1hdHRlci5vZ0ltYWdlIHx8IFwiXCIsXHJcbiAgICAgIHZpZGVvVXJsOiBmcm9udG1hdHRlci52aWRlb1VybCB8fCBcIlwiLFxyXG4gICAgICAuLi4oY2Fub25pY2FsVXJsICYmIHsgY2Fub25pY2FsVXJsIH0pLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcHJlcGFyZVB1Ymxpc2goZGVzdGluYXRpb246IERlc3RpbmF0aW9uLCBvdmVycmlkZVN0YXR1cz86IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCIpIHtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBNYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdGluYXRpb24pKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYENvbmZpZ3VyZSBjcmVkZW50aWFscyBmb3IgXCIke2Rlc3RpbmF0aW9uLm5hbWV9XCIgaW4gc2V0dGluZ3NgKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCB0aGlzLmJ1aWxkUGF5bG9hZCh2aWV3LmZpbGUsIG92ZXJyaWRlU3RhdHVzKTtcclxuXHJcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5jb25maXJtQmVmb3JlUHVibGlzaCkge1xyXG4gICAgICBuZXcgQ29uZmlybVB1Ymxpc2hNb2RhbCh0aGlzLmFwcCwgcGF5bG9hZCwgZGVzdGluYXRpb24sICgpID0+IHtcclxuICAgICAgICB2b2lkIHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdGluYXRpb24sIHBheWxvYWQsIHZpZXcuZmlsZSEpO1xyXG4gICAgICB9KS5vcGVuKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2b2lkIHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdGluYXRpb24sIHBheWxvYWQsIHZpZXcuZmlsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUm91dGUgYSBwdWJsaXNoIHRvIHRoZSBjb3JyZWN0IHBsYXRmb3JtIGhhbmRsZXIuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9EZXN0aW5hdGlvbihcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBzd2l0Y2ggKGRlc3RpbmF0aW9uLnR5cGUpIHtcclxuICAgICAgY2FzZSBcImRldnRvXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvRGV2VG8oZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwibWFzdG9kb25cIjpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9NYXN0b2RvbihkZXN0aW5hdGlvbiwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgICAgIGNhc2UgXCJibHVlc2t5XCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvQmx1ZXNreShkZXN0aW5hdGlvbiwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgICAgIGNhc2UgXCJtZWRpdW1cIjpcclxuICAgICAgY2FzZSBcInJlZGRpdFwiOlxyXG4gICAgICBjYXNlIFwidGhyZWFkc1wiOlxyXG4gICAgICBjYXNlIFwibGlua2VkaW5cIjpcclxuICAgICAgY2FzZSBcImVjZW5jeVwiOlxyXG4gICAgICAgIG5ldyBOb3RpY2UoYCR7ZGVzdGluYXRpb24ubmFtZX06ICR7ZGVzdGluYXRpb24udHlwZX0gc3VwcG9ydCBpcyBjb21pbmcgaW4gYSBmdXR1cmUgdXBkYXRlYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0N1c3RvbUFwaShkZXN0aW5hdGlvbiwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBhIGN1c3RvbSAvYXBpL3B1Ymxpc2ggZW5kcG9pbnQuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9DdXN0b21BcGkoXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIGNvbnN0IHN0YXR1cyA9IHBheWxvYWQuc3RhdHVzIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgJHtkZXN0aW5hdGlvbi5uYW1lfS4uLmApO1xyXG4gICAgICBjb25zdCB1cmwgPSBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS9hcGkvcHVibGlzaGA7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIngtcHVibGlzaC1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBsZXQgdmVyYiA9IFwiUE9TU0VkXCI7XHJcbiAgICAgICAgdHJ5IHsgaWYgKHJlc3BvbnNlLmpzb24/LnVwc2VydGVkKSB2ZXJiID0gXCJVcGRhdGVkXCI7IH0gY2F0Y2ggeyAvKiBub24tSlNPTiAqLyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgJHt2ZXJifSBcIiR7dGl0bGV9XCIgb24gJHtkZXN0aW5hdGlvbi5uYW1lfSBhcyAke3N0YXR1c31gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKGRlc3RpbmF0aW9uLm5hbWUpO1xyXG4gICAgICAgIGxldCBzeW5kaWNhdGlvblVybDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBzeW5kaWNhdGlvblVybCA9IHJlc3BvbnNlLmpzb24/LnVybCB8fFxyXG4gICAgICAgICAgICBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3BheWxvYWQuc2x1ZyBhcyBzdHJpbmd9YDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHN5bmRpY2F0aW9uVXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwYXlsb2FkLnNsdWcgYXMgc3RyaW5nfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBzeW5kaWNhdGlvblVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSByZXNwb25zZS5qc29uPy5lcnJvciB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFIHRvICR7ZGVzdGluYXRpb24ubmFtZX0gZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0UgZXJyb3IgKCR7ZGVzdGluYXRpb24ubmFtZX0pOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIERldi50byB2aWEgdGhlaXIgYXJ0aWNsZXMgQVBJLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGV2VG8oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgRGV2LnRvICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCB0YWdzID0gKChwYXlsb2FkLnRhZ3MgYXMgc3RyaW5nW10pIHx8IFtdKVxyXG4gICAgICAgIC5zbGljZSgwLCA0KVxyXG4gICAgICAgIC5tYXAoKHQpID0+IHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywgXCJcIikpO1xyXG4gICAgICBjb25zdCBhcnRpY2xlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcclxuICAgICAgICB0aXRsZSxcclxuICAgICAgICBib2R5X21hcmtkb3duOiBwYXlsb2FkLmJvZHkgYXMgc3RyaW5nLFxyXG4gICAgICAgIHB1Ymxpc2hlZDogcGF5bG9hZC5zdGF0dXMgPT09IFwicHVibGlzaGVkXCIsXHJcbiAgICAgICAgdGFncyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCIsXHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChwYXlsb2FkLmNhbm9uaWNhbFVybCkgYXJ0aWNsZS5jYW5vbmljYWxfdXJsID0gcGF5bG9hZC5jYW5vbmljYWxVcmw7XHJcbiAgICAgIGlmIChwYXlsb2FkLmNvdmVySW1hZ2UpIGFydGljbGUubWFpbl9pbWFnZSA9IHBheWxvYWQuY292ZXJJbWFnZTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9kZXYudG8vYXBpL2FydGljbGVzXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiYXBpLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFydGljbGUgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCBhcnRpY2xlVXJsOiBzdHJpbmcgPSByZXNwb25zZS5qc29uPy51cmwgfHwgXCJodHRwczovL2Rldi50b1wiO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gRGV2LnRvYCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIkRldi50b1wiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgYXJ0aWNsZVVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSByZXNwb25zZS5qc29uPy5lcnJvciB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYERldi50byBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBEZXYudG8gZXJyb3I6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gTWFzdG9kb24gYnkgcG9zdGluZyBhIHN0YXR1cyB3aXRoIHRoZSBjYW5vbmljYWwgbGluay4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb01hc3RvZG9uKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIE1hc3RvZG9uICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCBleGNlcnB0ID0gKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSBbdGl0bGUsIGV4Y2VycHQsIGNhbm9uaWNhbFVybF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIik7XHJcbiAgICAgIGNvbnN0IGluc3RhbmNlVXJsID0gKGRlc3RpbmF0aW9uLmluc3RhbmNlVXJsIHx8IFwiXCIpLnJlcGxhY2UoL1xcLyQvLCBcIlwiKTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IGAke2luc3RhbmNlVXJsfS9hcGkvdjEvc3RhdHVzZXNgLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke2Rlc3RpbmF0aW9uLmFjY2Vzc1Rva2VufWAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN0YXR1czogc3RhdHVzVGV4dCwgdmlzaWJpbGl0eTogXCJwdWJsaWNcIiB9KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c1VybDogc3RyaW5nID0gcmVzcG9uc2UuanNvbj8udXJsIHx8IGluc3RhbmNlVXJsO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gTWFzdG9kb25gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiTWFzdG9kb25cIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHN0YXR1c1VybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSByZXNwb25zZS5qc29uPy5lcnJvciB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYE1hc3RvZG9uIFBPU1NFIGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYE1hc3RvZG9uIGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIEJsdWVza3kgdmlhIEFUIFByb3RvY29sLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQmx1ZXNreShcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBCbHVlc2t5ICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG5cclxuICAgICAgLy8gQXV0aGVudGljYXRlXHJcbiAgICAgIGNvbnN0IGF1dGhSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8uc2VydmVyLmNyZWF0ZVNlc3Npb25cIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBpZGVudGlmaWVyOiBkZXN0aW5hdGlvbi5oYW5kbGUsXHJcbiAgICAgICAgICBwYXNzd29yZDogZGVzdGluYXRpb24uYXBwUGFzc3dvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoYXV0aFJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCBhdXRoUmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgYXV0aCBmYWlsZWQ6ICR7YXV0aFJlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgeyBkaWQsIGFjY2Vzc0p3dCB9ID0gYXV0aFJlc3BvbnNlLmpzb24gYXMgeyBkaWQ6IHN0cmluZzsgYWNjZXNzSnd0OiBzdHJpbmcgfTtcclxuXHJcbiAgICAgIC8vIEJ1aWxkIHBvc3QgdGV4dCAoMzAwIGNoYXIgbGltaXQpXHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGV4Y2VycHQgPSAocGF5bG9hZC5leGNlcnB0IGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3QgYmFzZVRleHQgPSBbdGl0bGUsIGV4Y2VycHRdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFx1MjAxNCBcIik7XHJcbiAgICAgIGNvbnN0IG1heFRleHQgPSAzMDAgLSAoY2Fub25pY2FsVXJsID8gY2Fub25pY2FsVXJsLmxlbmd0aCArIDEgOiAwKTtcclxuICAgICAgY29uc3QgdGV4dCA9IChiYXNlVGV4dC5sZW5ndGggPiBtYXhUZXh0XHJcbiAgICAgICAgPyBiYXNlVGV4dC5zdWJzdHJpbmcoMCwgbWF4VGV4dCAtIDEpICsgXCJcdTIwMjZcIlxyXG4gICAgICAgIDogYmFzZVRleHRcclxuICAgICAgKSArIChjYW5vbmljYWxVcmwgPyBgICR7Y2Fub25pY2FsVXJsfWAgOiBcIlwiKTtcclxuXHJcbiAgICAgIGNvbnN0IHBvc3RSZWNvcmQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xyXG4gICAgICAgICR0eXBlOiBcImFwcC5ic2t5LmZlZWQucG9zdFwiLFxyXG4gICAgICAgIHRleHQsXHJcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgbGFuZ3M6IFtcImVuXCJdLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoY2Fub25pY2FsVXJsKSB7XHJcbiAgICAgICAgY29uc3QgdXJsU3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKGNhbm9uaWNhbFVybCk7XHJcbiAgICAgICAgcG9zdFJlY29yZC5mYWNldHMgPSBbe1xyXG4gICAgICAgICAgaW5kZXg6IHsgYnl0ZVN0YXJ0OiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGV4dC5zdWJzdHJpbmcoMCwgdXJsU3RhcnQpKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICBieXRlRW5kOiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh0ZXh0LnN1YnN0cmluZygwLCB1cmxTdGFydCArIGNhbm9uaWNhbFVybC5sZW5ndGgpKS5sZW5ndGggfSxcclxuICAgICAgICAgIGZlYXR1cmVzOiBbeyAkdHlwZTogXCJhcHAuYnNreS5yaWNodGV4dC5mYWNldCNsaW5rXCIsIHVyaTogY2Fub25pY2FsVXJsIH1dLFxyXG4gICAgICAgIH1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8ucmVwby5jcmVhdGVSZWNvcmRcIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHthY2Nlc3NKd3R9YCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIHJlcG86IGRpZCxcclxuICAgICAgICAgIGNvbGxlY3Rpb246IFwiYXBwLmJza3kuZmVlZC5wb3N0XCIsXHJcbiAgICAgICAgICByZWNvcmQ6IHBvc3RSZWNvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoY3JlYXRlUmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiBjcmVhdGVSZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCB1cmk6IHN0cmluZyA9IGNyZWF0ZVJlc3BvbnNlLmpzb24/LnVyaSB8fCBcIlwiO1xyXG4gICAgICAgIGNvbnN0IHBvc3RVcmwgPSB1cmlcclxuICAgICAgICAgID8gYGh0dHBzOi8vYnNreS5hcHAvcHJvZmlsZS8ke2Rlc3RpbmF0aW9uLmhhbmRsZX0vcG9zdC8ke3VyaS5zcGxpdChcIi9cIikucG9wKCl9YFxyXG4gICAgICAgICAgOiBcImh0dHBzOi8vYnNreS5hcHBcIjtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIEJsdWVza3lgKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiQmx1ZXNreVwiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgcG9zdFVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcoY3JlYXRlUmVzcG9uc2UuanNvbj8ubWVzc2FnZSB8fCBjcmVhdGVSZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhjcmVhdGVSZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBCbHVlc2t5IGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQT1NTRSB0byBhbGwgY29uZmlndXJlZCBkZXN0aW5hdGlvbnMgYXQgb25jZS4gKi9cclxuICBwcml2YXRlIGFzeW5jIHBvc3NlVG9BbGwob3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucyB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJBZGQgYXQgbGVhc3Qgb25lIGRlc3RpbmF0aW9uIGluIHNldHRpbmdzXCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgTWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKHZpZXcuZmlsZSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG4gICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke1N0cmluZyhwYXlsb2FkLnRpdGxlKX1cIiB0byAke2Rlc3RpbmF0aW9ucy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpLi4uYCk7XHJcbiAgICBmb3IgKGNvbnN0IGRlc3Qgb2YgZGVzdGluYXRpb25zKSB7XHJcbiAgICAgIGlmICh0aGlzLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdCkpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3QsIHBheWxvYWQsIHZpZXcuZmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgU2tpcHBpbmcgXCIke2Rlc3QubmFtZX1cIiBcdTIwMTQgY3JlZGVudGlhbHMgbm90IGNvbmZpZ3VyZWRgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrIHdoZXRoZXIgYSBkZXN0aW5hdGlvbiBoYXMgdGhlIHJlcXVpcmVkIGNyZWRlbnRpYWxzIGNvbmZpZ3VyZWQuICovXHJcbiAgaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0OiBEZXN0aW5hdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoIChkZXN0LnR5cGUpIHtcclxuICAgICAgY2FzZSBcImRldnRvXCI6ICAgIHJldHVybiAhIWRlc3QuYXBpS2V5O1xyXG4gICAgICBjYXNlIFwibWFzdG9kb25cIjogcmV0dXJuICEhKGRlc3QuaW5zdGFuY2VVcmwgJiYgZGVzdC5hY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJibHVlc2t5XCI6ICByZXR1cm4gISEoZGVzdC5oYW5kbGUgJiYgZGVzdC5hcHBQYXNzd29yZCk7XHJcbiAgICAgIGNhc2UgXCJtZWRpdW1cIjogICByZXR1cm4gISFkZXN0Lm1lZGl1bVRva2VuO1xyXG4gICAgICBjYXNlIFwicmVkZGl0XCI6ICAgcmV0dXJuICEhKGRlc3QucmVkZGl0Q2xpZW50SWQgJiYgZGVzdC5yZWRkaXRDbGllbnRTZWNyZXQgJiYgZGVzdC5yZWRkaXRSZWZyZXNoVG9rZW4pO1xyXG4gICAgICBjYXNlIFwidGhyZWFkc1wiOiAgcmV0dXJuICEhKGRlc3QudGhyZWFkc1VzZXJJZCAmJiBkZXN0LnRocmVhZHNBY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJsaW5rZWRpblwiOiByZXR1cm4gISEoZGVzdC5saW5rZWRpbkFjY2Vzc1Rva2VuICYmIGRlc3QubGlua2VkaW5QZXJzb25Vcm4pO1xyXG4gICAgICBjYXNlIFwiZWNlbmN5XCI6ICAgcmV0dXJuICEhKGRlc3QuaGl2ZVVzZXJuYW1lICYmIGRlc3QuaGl2ZVBvc3RpbmdLZXkpO1xyXG4gICAgICBkZWZhdWx0OiAgICAgICAgIHJldHVybiAhIShkZXN0LnVybCAmJiBkZXN0LmFwaUtleSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogV3JpdGUgYSBzeW5kaWNhdGlvbiBlbnRyeSBiYWNrIGludG8gdGhlIG5vdGUncyBmcm9udG1hdHRlci4gVXBkYXRlcyB0aGUgVVJMIGlmIHRoZSBkZXN0aW5hdGlvbiBhbHJlYWR5IGV4aXN0cy4gKi9cclxuICBwcml2YXRlIGFzeW5jIHdyaXRlU3luZGljYXRpb24oZmlsZTogVEZpbGUsIG5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcclxuICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZm0pID0+IHtcclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZtLnN5bmRpY2F0aW9uKSkgZm0uc3luZGljYXRpb24gPSBbXTtcclxuICAgICAgY29uc3QgZW50cmllcyA9IGZtLnN5bmRpY2F0aW9uIGFzIEFycmF5PHsgbmFtZT86IHN0cmluZzsgdXJsPzogc3RyaW5nIH0+O1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGVudHJpZXMuZmluZCgocykgPT4gcy5uYW1lID09PSBuYW1lKTtcclxuICAgICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgICAgZXhpc3RpbmcudXJsID0gdXJsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVudHJpZXMucHVzaCh7IHVybCwgbmFtZSB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dTdGF0dXNCYXJTdWNjZXNzKHNpdGVOYW1lOiBzdHJpbmcpIHtcclxuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KGBQT1NTRWQgXHUyNzEzICR7c2l0ZU5hbWV9YCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhckVsKSB0aGlzLnN0YXR1c0JhckVsLnNldFRleHQoXCJcIik7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcblxyXG4gIC8qKiBTaG93IGN1cnJlbnQgc3luZGljYXRpb24gc3RhdHVzIGZvciB0aGUgYWN0aXZlIG5vdGUuICovXHJcbiAgcHJpdmF0ZSBwb3NzZVN0YXR1cygpIHtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBNYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3Qgc3luZGljYXRpb24gPSBmaWxlQ2FjaGU/LmZyb250bWF0dGVyPy5zeW5kaWNhdGlvbjtcclxuICAgIGNvbnN0IHRpdGxlID0gZmlsZUNhY2hlPy5mcm9udG1hdHRlcj8udGl0bGUgfHwgdmlldy5maWxlLmJhc2VuYW1lO1xyXG4gICAgbmV3IFBvc3NlU3RhdHVzTW9kYWwodGhpcy5hcHAsIHRpdGxlLCBzeW5kaWNhdGlvbikub3BlbigpO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIENvbmZpcm1hdGlvbiBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIENvbmZpcm1QdWJsaXNoTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbjtcclxuICBwcml2YXRlIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBhcHA6IEFwcCxcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgb25Db25maXJtOiAoKSA9PiB2b2lkLFxyXG4gICkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XHJcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9uQ29uZmlybTtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwicG9zc2UtcHVibGlzaGVyLWNvbmZpcm0tbW9kYWxcIik7XHJcblxyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkNvbmZpcm0gcG9zc2VcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBgWW91IGFyZSBhYm91dCB0byBQT1NTRSB0byAke3RoaXMuZGVzdGluYXRpb24ubmFtZX06YCxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN1bW1hcnkgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInB1Ymxpc2gtc3VtbWFyeVwiIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUaXRsZTogJHtTdHJpbmcodGhpcy5wYXlsb2FkLnRpdGxlKX1gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBTbHVnOiAke1N0cmluZyh0aGlzLnBheWxvYWQuc2x1Zyl9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgU3RhdHVzOiAke1N0cmluZyh0aGlzLnBheWxvYWQuc3RhdHVzKX1gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUeXBlOiAke1N0cmluZyh0aGlzLnBheWxvYWQudHlwZSl9YCB9KTtcclxuXHJcbiAgICBjb25zdCBidXR0b25zID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJtb2RhbC1idXR0b24tY29udGFpbmVyXCIgfSk7XHJcblxyXG4gICAgY29uc3QgY2FuY2VsQnRuID0gYnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiQ2FuY2VsXCIgfSk7XHJcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XHJcblxyXG4gICAgY29uc3QgY29uZmlybUJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICB0ZXh0OiBcIlBPU1NFXCIsXHJcbiAgICAgIGNsczogXCJtb2QtY3RhXCIsXHJcbiAgICB9KTtcclxuICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICB0aGlzLm9uQ29uZmlybSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvbkNsb3NlKCkge1xyXG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBTaXRlIFBpY2tlciBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIFNpdGVQaWNrZXJNb2RhbCBleHRlbmRzIFN1Z2dlc3RNb2RhbDxEZXN0aW5hdGlvbj4ge1xyXG4gIHByaXZhdGUgZGVzdGluYXRpb25zOiBEZXN0aW5hdGlvbltdO1xyXG4gIHByaXZhdGUgb25DaG9vc2U6IChkZXN0aW5hdGlvbjogRGVzdGluYXRpb24pID0+IHZvaWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW10sIG9uQ2hvb3NlOiAoZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSA9PiB2b2lkKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gICAgdGhpcy5kZXN0aW5hdGlvbnMgPSBkZXN0aW5hdGlvbnM7XHJcbiAgICB0aGlzLm9uQ2hvb3NlID0gb25DaG9vc2U7XHJcbiAgICB0aGlzLnNldFBsYWNlaG9sZGVyKFwiQ2hvb3NlIGEgZGVzdGluYXRpb24gdG8gcG9zc2UgdG8uLi5cIik7XHJcbiAgfVxyXG5cclxuICBnZXRTdWdnZXN0aW9ucyhxdWVyeTogc3RyaW5nKTogRGVzdGluYXRpb25bXSB7XHJcbiAgICBjb25zdCBsb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gdGhpcy5kZXN0aW5hdGlvbnMuZmlsdGVyKFxyXG4gICAgICAoZCkgPT5cclxuICAgICAgICBkLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlcikgfHxcclxuICAgICAgICBkLnVybC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZW5kZXJTdWdnZXN0aW9uKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgZWw6IEhUTUxFbGVtZW50KSB7XHJcbiAgICBlbC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGRlc3RpbmF0aW9uLm5hbWUsIGNsczogXCJzdWdnZXN0aW9uLXRpdGxlXCIgfSk7XHJcbiAgICBlbC5jcmVhdGVFbChcInNtYWxsXCIsIHsgdGV4dDogZGVzdGluYXRpb24udXJsLCBjbHM6IFwic3VnZ2VzdGlvbi1ub3RlXCIgfSk7XHJcbiAgfVxyXG5cclxuICBvbkNob29zZVN1Z2dlc3Rpb24oZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSB7XHJcbiAgICB0aGlzLm9uQ2hvb3NlKGRlc3RpbmF0aW9uKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBTZXR0aW5ncyBUYWIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBQb3NzZVB1Ymxpc2hlclNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcclxuICBwbHVnaW46IFBvc3NlUHVibGlzaGVyUGx1Z2luO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQb3NzZVB1Ymxpc2hlclBsdWdpbikge1xyXG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xyXG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5KCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJZb3VyIGNhbm9uaWNhbCBzaXRlXCIpLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDYW5vbmljYWwgYmFzZSBVUkxcIilcclxuICAgICAgLnNldERlc2MoXCJZb3VyIG93biBzaXRlJ3Mgcm9vdCBVUkwuIEV2ZXJ5IHB1Ymxpc2hlZCBwb3N0IHdpbGwgaW5jbHVkZSBhIGNhbm9uaWNhbFVybCBwb2ludGluZyBoZXJlIFx1MjAxNCB0aGUgb3JpZ2luYWwgeW91IG93bi5cIilcclxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgdGV4dFxyXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly95b3Vyc2l0ZS5jb21cIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cDovL2xvY2FsaG9zdFwiKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBjYW5vbmljYWwgYmFzZSBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggSFRUUFM6Ly9cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIkRlc3RpbmF0aW9uc1wiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLmZvckVhY2goKGRlc3RpbmF0aW9uLCBpbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBkZXN0Q29udGFpbmVyID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHtcclxuICAgICAgICBjbHM6IFwicG9zc2UtcHVibGlzaGVyLXNpdGVcIixcclxuICAgICAgfSk7XHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpLnNldE5hbWUoZGVzdGluYXRpb24ubmFtZSB8fCBgRGVzdGluYXRpb24gJHtpbmRleCArIDF9YCkuc2V0SGVhZGluZygpO1xyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuc2V0TmFtZShcIkRlc3RpbmF0aW9uIG5hbWVcIilcclxuICAgICAgICAuc2V0RGVzYyhcIkEgbGFiZWwgZm9yIHRoaXMgZGVzdGluYXRpb24gKGUuZy4gTXkgYmxvZylcIilcclxuICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiTXkgc2l0ZVwiKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubmFtZSlcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuc2V0TmFtZShcIlR5cGVcIilcclxuICAgICAgICAuc2V0RGVzYyhcIlBsYXRmb3JtIHRvIHB1Ymxpc2ggdG9cIilcclxuICAgICAgICAuYWRkRHJvcGRvd24oKGRkKSA9PlxyXG4gICAgICAgICAgZGRcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImN1c3RvbS1hcGlcIiwgXCJDdXN0b20gQVBJXCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJkZXZ0b1wiLCBcIkRldi50b1wiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwibWFzdG9kb25cIiwgXCJNYXN0b2RvblwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiYmx1ZXNreVwiLCBcIkJsdWVza3lcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcIm1lZGl1bVwiLCBcIk1lZGl1bVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwicmVkZGl0XCIsIFwiUmVkZGl0XCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJ0aHJlYWRzXCIsIFwiVGhyZWFkc1wiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwibGlua2VkaW5cIiwgXCJMaW5rZWRJblwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiZWNlbmN5XCIsIFwiRWNlbmN5IChoaXZlKVwiKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udHlwZSB8fCBcImN1c3RvbS1hcGlcIilcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udHlwZSA9IHZhbHVlIGFzIERlc3RpbmF0aW9uVHlwZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnN0IGRlc3RUeXBlID0gZGVzdGluYXRpb24udHlwZSB8fCBcImN1c3RvbS1hcGlcIjtcclxuXHJcbiAgICAgIGlmIChkZXN0VHlwZSA9PT0gXCJjdXN0b20tYXBpXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJTaXRlIFVSTFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIHNpdGUncyBiYXNlIFVSTCAobXVzdCBzdGFydCB3aXRoIEhUVFBTOi8vKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJodHRwczovL2V4YW1wbGUuY29tXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnVybCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwczovL1wiKSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHA6Ly9sb2NhbGhvc3RcIikpIHtcclxuICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShcIldhcm5pbmc6IGRlc3RpbmF0aW9uIFVSTCBzaG91bGQgc3RhcnQgd2l0aCBIVFRQUzovL1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBUEkga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcImBQVUJMSVNIX0FQSV9LRVlgIGZyb20geW91ciBzaXRlJ3MgZW52aXJvbm1lbnRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwaUtleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBpS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiZGV2dG9cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkRldi50byBBUEkga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gaHR0cHM6Ly9kZXYudG8vc2V0dGluZ3MvZXh0ZW5zaW9uc1wiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGRldi50byBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwaUtleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBpS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibWFzdG9kb25cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkluc3RhbmNlIFVSTFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIE1hc3RvZG9uIGluc3RhbmNlIChlLmcuIGh0dHBzOi8vbWFzdG9kb24uc29jaWFsKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJIVFRQUzovL21hc3RvZG9uLnNvY2lhbFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5pbnN0YW5jZVVybCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaW5zdGFuY2VVcmwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSB5b3VyIG1hc3RvZG9uIGFjY291bnQ6IHNldHRpbmdzIFx1MjE5MiBkZXZlbG9wbWVudCBcdTIxOTIgbmV3IGFwcGxpY2F0aW9uXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgYWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImJsdWVza3lcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkJsdWVza3kgaGFuZGxlXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgaGFuZGxlIChlLmcuIFlvdXJuYW1lLmJza3kuc29jaWFsKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJZb3VybmFtZS5ic2t5LnNvY2lhbFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oYW5kbGUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhhbmRsZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFwcCBwYXNzd29yZFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIGh0dHBzOi8vYnNreS5hcHAvc2V0dGluZ3MvYXBwLXBhc3N3b3JkcyBcdTIwMTQgTk9UIHlvdXIgbG9naW4gcGFzc3dvcmRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJYeHh4LXh4eHgteHh4eC14eHh4XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwcFBhc3N3b3JkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcHBQYXNzd29yZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcIm1lZGl1bVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQVBJIG5vdGljZVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJUaGUgbWVkaXVtIEFQSSB3YXMgYXJjaGl2ZWQgaW4gbWFyY2ggMjAyMy4gSXQgbWF5IHN0aWxsIHdvcmsgYnV0IGNvdWxkIGJlIGRpc2NvbnRpbnVlZCBhdCBhbnkgdGltZS5cIik7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSW50ZWdyYXRpb24gdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBtZWRpdW0uY29tIFx1MjE5MiBzZXR0aW5ncyBcdTIxOTIgc2VjdXJpdHkgYW5kIGFwcHMgXHUyMTkyIGludGVncmF0aW9uIHRva2Vuc1wiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIG1lZGl1bSBpbnRlZ3JhdGlvbiB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5tZWRpdW1Ub2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubWVkaXVtVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJyZWRkaXRcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNsaWVudCBJRFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIHJlZGRpdC5jb20vcHJlZnMvYXBwcyBcdTIwMTQgY3JlYXRlIGEgXFxcInNjcmlwdFxcXCIgdHlwZSBhcHBcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiQ2xpZW50IElEXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdENsaWVudElkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRDbGllbnRJZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNsaWVudCBzZWNyZXRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJDbGllbnQgc2VjcmV0XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdENsaWVudFNlY3JldCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0Q2xpZW50U2VjcmV0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUmVmcmVzaCB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJPQXV0aDIgcmVmcmVzaCB0b2tlbiBmb3IgeW91ciBSZWRkaXQgYWNjb3VudFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlJlZnJlc2ggdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0UmVmcmVzaFRva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRSZWZyZXNoVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJSZWRkaXQgdXNlcm5hbWVcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiVS95b3VybmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRVc2VybmFtZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0VXNlcm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJEZWZhdWx0IHN1YnJlZGRpdFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJlLmcuIHIvd2ViZGV2IFx1MjAxNCBjYW4gYmUgb3ZlcnJpZGRlbiBwZXIgbm90ZSB3aXRoIFxcXCJzdWJyZWRkaXQ6XFxcIiBmcm9udG1hdHRlclwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJSL3N1YnJlZGRpdG5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0RGVmYXVsdFN1YnJlZGRpdCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0RGVmYXVsdFN1YnJlZGRpdCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcInRocmVhZHNcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlRocmVhZHMgdXNlciBJRFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIG51bWVyaWMgdGhyZWFkcy9pbnN0YWdyYW0gdXNlciBJRFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCIxMjM0NTY3ODlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udGhyZWFkc1VzZXJJZCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udGhyZWFkc1VzZXJJZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJMb25nLWxpdmVkIHRocmVhZHMgYWNjZXNzIHRva2VuIHdpdGggdGhyZWFkc19jb250ZW50X3B1Ymxpc2ggcGVybWlzc2lvblwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi50aHJlYWRzQWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnRocmVhZHNBY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImxpbmtlZGluXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiT0F1dGgyIGJlYXJlciB0b2tlbiB3aXRoIHdfbWVtYmVyX3NvY2lhbCBzY29wZVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5saW5rZWRpbkFjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5saW5rZWRpbkFjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUGVyc29uIHVyblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIExpbmtlZEluIG1lbWJlciB1cm4sIGUuZy4gVXJuOmxpOnBlcnNvbjphYmMxMjNcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiVXJuOmxpOnBlcnNvbjouLi5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubGlua2VkaW5QZXJzb25Vcm4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmxpbmtlZGluUGVyc29uVXJuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiZWNlbmN5XCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJIaXZlIHVzZXJuYW1lXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgaGl2ZS9lY2VuY3kgYWNjb3VudCBuYW1lICh3aXRob3V0IEApXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIllvdXJ1c2VybmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oaXZlVXNlcm5hbWUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVVc2VybmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlBvc3Rpbmcga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgaGl2ZSBwcml2YXRlIHBvc3Rpbmcga2V5IChub3QgdGhlIG93bmVyIG9yIGFjdGl2ZSBrZXkpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiNWsuLi5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGl2ZVBvc3RpbmdLZXkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVQb3N0aW5nS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQ29tbXVuaXR5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkhpdmUgY29tbXVuaXR5IHRhZyB0byBwb3N0IGluIChlLmcuIEhpdmUtMTc0MzAxIGZvciBvY2QpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkhpdmUtMTc0MzAxXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhpdmVDb21tdW5pdHkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVDb21tdW5pdHkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlRlc3QgY29ubmVjdGlvblwiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsdWdpbi5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJDb25maWd1cmUgY3JlZGVudGlhbHMgZmlyc3RcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkZXN0VHlwZSA9PT0gXCJjdXN0b20tYXBpXCIpIHtcclxuICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS9hcGkvcHVibGlzaGA7XHJcbiAgICAgICAgICAgICAgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiT1BUSU9OU1wiLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIngtcHVibGlzaC1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5IH0sXHJcbiAgICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDQwMCkge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBDb25uZWN0aW9uIHRvICR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9IHN1Y2Nlc3NmdWxgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYCR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9IHJlc3BvbmRlZCB3aXRoICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYENvdWxkIG5vdCByZWFjaCAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfWApO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoYENyZWRlbnRpYWxzIGxvb2sgY29uZmlndXJlZCBmb3IgJHtkZXN0aW5hdGlvbi5uYW1lfS4gUHVibGlzaCB0byB0ZXN0LmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICApXHJcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgICAgYnRuXHJcbiAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiUmVtb3ZlIGRlc3RpbmF0aW9uXCIpXHJcbiAgICAgICAgICAgIC5zZXRXYXJuaW5nKClcclxuICAgICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbmZpcm1FbCA9IGRlc3RDb250YWluZXIuY3JlYXRlRGl2KHtcclxuICAgICAgICAgICAgICAgIGNsczogXCJzZXR0aW5nLWl0ZW1cIixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25maXJtRWwuY3JlYXRlRWwoXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IGBSZW1vdmUgXCIke2Rlc3RpbmF0aW9uLm5hbWUgfHwgXCJ0aGlzIGRlc3RpbmF0aW9uXCJ9XCI/IGAsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgeWVzQnRuID0gY29uZmlybUVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiWWVzLCByZW1vdmVcIixcclxuICAgICAgICAgICAgICAgIGNsczogXCJtb2Qtd2FybmluZ1wiLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5vQnRuID0gY29uZmlybUVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDYW5jZWxcIiB9KTtcclxuICAgICAgICAgICAgICB5ZXNCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgdm9pZCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKS50aGVuKCgpID0+IHRoaXMuZGlzcGxheSgpKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBub0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gY29uZmlybUVsLnJlbW92ZSgpKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuXHJcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkFkZCBkZXN0aW5hdGlvblwiKVxyXG4gICAgICAgICAgLnNldEN0YSgpXHJcbiAgICAgICAgICAub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIlwiLFxyXG4gICAgICAgICAgICAgIHR5cGU6IFwiY3VzdG9tLWFwaVwiLFxyXG4gICAgICAgICAgICAgIHVybDogXCJcIixcclxuICAgICAgICAgICAgICBhcGlLZXk6IFwiXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2b2lkIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpLnRoZW4oKCkgPT4gdGhpcy5kaXNwbGF5KCkpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJEZWZhdWx0c1wiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiRGVmYXVsdCBzdGF0dXNcIilcclxuICAgICAgLnNldERlc2MoXCJEZWZhdWx0IHB1Ymxpc2ggc3RhdHVzIHdoZW4gbm90IHNwZWNpZmllZCBpbiBmcm9udG1hdHRlclwiKVxyXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxyXG4gICAgICAgIGRyb3Bkb3duXHJcbiAgICAgICAgICAuYWRkT3B0aW9uKFwiZHJhZnRcIiwgXCJEcmFmdFwiKVxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcInB1Ymxpc2hlZFwiLCBcIlB1Ymxpc2hlZFwiKVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRTdGF0dXMpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRTdGF0dXMgPSB2YWx1ZSBhc1xyXG4gICAgICAgICAgICAgIHwgXCJkcmFmdFwiXHJcbiAgICAgICAgICAgICAgfCBcInB1Ymxpc2hlZFwiO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkNvbmZpcm0gYmVmb3JlIHB1Ymxpc2hpbmdcIilcclxuICAgICAgLnNldERlc2MoXCJTaG93IGEgY29uZmlybWF0aW9uIG1vZGFsIHdpdGggcG9zdCBkZXRhaWxzIGJlZm9yZSBwdWJsaXNoaW5nXCIpXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb25maXJtQmVmb3JlUHVibGlzaClcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2ggPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJTdHJpcCB3aWtpLWxpbmtzIGFuZCBlbWJlZHNcIilcclxuICAgICAgLnNldERlc2MoXHJcbiAgICAgICAgXCJDb252ZXJ0IHdpa2ktbGlua3MsIHJlbW92ZSBlbWJlZHMsIGNvbW1lbnRzLCBhbmQgZGF0YXZpZXcgYmxvY2tzIGJlZm9yZSBwdWJsaXNoaW5nXCIsXHJcbiAgICAgIClcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXgpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXggPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICAvKiBcdTI1MDBcdTI1MDAgU3VwcG9ydCBzZWN0aW9uIFx1MjUwMFx1MjUwMCAqL1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJTdXBwb3J0XCIpLnNldEhlYWRpbmcoKTtcclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgIHRleHQ6IFwiVGhpcyBwbHVnaW4gaXMgZnJlZSBhbmQgb3BlbiBzb3VyY2UuIElmIGl0IHNhdmVzIHlvdSB0aW1lLCBjb25zaWRlciBzdXBwb3J0aW5nIGl0cyBkZXZlbG9wbWVudC5cIixcclxuICAgICAgY2xzOiBcInNldHRpbmctaXRlbS1kZXNjcmlwdGlvblwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQnV5IG1lIGEgY29mZmVlXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiT25lLXRpbWUgb3IgcmVjdXJyaW5nIHN1cHBvcnRcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiU3VwcG9ydFwiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cHM6Ly9idXltZWFjb2ZmZWUuY29tL3RoZW9mZmljYWxkbVwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJHaXRIdWIgc3BvbnNvcnNcIilcclxuICAgICAgLnNldERlc2MoXCJNb250aGx5IHNwb25zb3JzaGlwIHRocm91Z2ggR2l0SHViXCIpXHJcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlNwb25zb3JcIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cub3BlbihcImh0dHBzOi8vZ2l0aHViLmNvbS9zcG9uc29ycy9UaGVPZmZpY2lhbERNXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkFsbCBmdW5kaW5nIG9wdGlvbnNcIilcclxuICAgICAgLnNldERlc2MoXCJkZXZpbm1hcnNoYWxsLmluZm8vZnVuZFwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJWaWV3XCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2RldmlubWFyc2hhbGwuaW5mby9mdW5kXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIFBPU1NFIFN0YXR1cyBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbnR5cGUgU3luZGljYXRpb25FbnRyeSA9IHsgdXJsPzogc3RyaW5nOyBuYW1lPzogc3RyaW5nIH07XHJcblxyXG5jbGFzcyBQb3NzZVN0YXR1c01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIHN5bmRpY2F0aW9uOiB1bmtub3duO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgdGl0bGU6IHN0cmluZywgc3luZGljYXRpb246IHVua25vd24pIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XHJcbiAgICB0aGlzLnN5bmRpY2F0aW9uID0gc3luZGljYXRpb247XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKSB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcInBvc3NlLXB1Ymxpc2hlci1jb25maXJtLW1vZGFsXCIpO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlBvc3NlIHN0YXR1c1wiIH0pO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IGBOb3RlOiAke1N0cmluZyh0aGlzLnRpdGxlKX1gIH0pO1xyXG5cclxuICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5pc0FycmF5KHRoaXMuc3luZGljYXRpb24pXHJcbiAgICAgID8gKHRoaXMuc3luZGljYXRpb24gYXMgU3luZGljYXRpb25FbnRyeVtdKVxyXG4gICAgICA6IFtdO1xyXG5cclxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHtcclxuICAgICAgICB0ZXh0OiBcIlRoaXMgbm90ZSBoYXMgbm90IGJlZW4gUE9TU0VkIHRvIGFueSBkZXN0aW5hdGlvbiB5ZXQuXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKFwic3Ryb25nXCIsIHsgdGV4dDogYFN5bmRpY2F0ZWQgdG8gJHtlbnRyaWVzLmxlbmd0aH0gZGVzdGluYXRpb24ocyk6YCB9KTtcclxuICAgICAgY29uc3QgbGlzdCA9IGNvbnRlbnRFbC5jcmVhdGVFbChcInVsXCIpO1xyXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcclxuICAgICAgICBjb25zdCBsaSA9IGxpc3QuY3JlYXRlRWwoXCJsaVwiKTtcclxuICAgICAgICBpZiAoZW50cnkudXJsKSB7XHJcbiAgICAgICAgICBjb25zdCBhID0gbGkuY3JlYXRlRWwoXCJhXCIsIHsgdGV4dDogZW50cnkubmFtZSB8fCBlbnRyeS51cmwgfSk7XHJcbiAgICAgICAgICBhLmhyZWYgPSBlbnRyeS51cmw7XHJcbiAgICAgICAgICBhLnRhcmdldCA9IFwiX2JsYW5rXCI7XHJcbiAgICAgICAgICBhLnJlbCA9IFwibm9vcGVuZXJcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGkuc2V0VGV4dChlbnRyeS5uYW1lIHx8IFwiVW5rbm93blwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBidXR0b25zID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJtb2RhbC1idXR0b24tY29udGFpbmVyXCIgfSk7XHJcbiAgICBjb25zdCBjbG9zZUJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNsb3NlXCIgfSk7XHJcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcclxuICB9XHJcblxyXG4gIG9uQ2xvc2UoKSB7XHJcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQVdPO0FBNkNQLElBQU0sbUJBQTJDO0FBQUEsRUFDL0MsY0FBYyxDQUFDO0FBQUEsRUFDZixrQkFBa0I7QUFBQSxFQUNsQixlQUFlO0FBQUEsRUFDZixzQkFBc0I7QUFBQSxFQUN0QixxQkFBcUI7QUFDdkI7QUFvQkEsU0FBUyxZQUFZLFNBQXlCO0FBQzVDLFFBQU0sUUFBUSxRQUFRLE1BQU0sMkNBQTJDO0FBQ3ZFLFNBQU8sUUFBUSxNQUFNLENBQUMsRUFBRSxLQUFLLElBQUk7QUFDbkM7QUFNQSxTQUFTLGlCQUFpQixPQUF5RDtBQUNqRixNQUFJLENBQUMsTUFBTyxRQUFPLENBQUM7QUFDcEIsUUFBTSxLQUFrQixDQUFDO0FBRXpCLE1BQUksT0FBTyxNQUFNLFVBQVUsU0FBVSxJQUFHLFFBQVEsTUFBTTtBQUN0RCxNQUFJLE9BQU8sTUFBTSxTQUFTLFNBQVUsSUFBRyxPQUFPLE1BQU07QUFDcEQsTUFBSSxPQUFPLE1BQU0sWUFBWSxTQUFVLElBQUcsVUFBVSxNQUFNO0FBQzFE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
