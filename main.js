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
    this.addRibbonIcon("send", "POSSE Publish", () => {
      this.pickSiteAndPublish();
    });
    this.addCommand({
      id: "posse-publish",
      name: "POSSE Publish",
      callback: () => this.pickSiteAndPublish()
    });
    this.addCommand({
      id: "posse-publish-draft",
      name: "POSSE Publish as Draft",
      callback: () => this.pickSiteAndPublish("draft")
    });
    this.addCommand({
      id: "posse-publish-live",
      name: "POSSE Publish Live",
      callback: () => this.pickSiteAndPublish("published")
    });
    this.addCommand({
      id: "posse-insert-template",
      name: "POSSE Insert Frontmatter Template",
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
      name: "POSSE to All Destinations",
      callback: () => this.posseToAll()
    });
    this.addCommand({
      id: "posse-status",
      name: "POSSE Status \u2014 View Syndication",
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
      this.saveSettings();
    }
    if (Array.isArray(raw.sites) && !Array.isArray(this.settings.destinations)) {
      this.settings.destinations = raw.sites;
      delete raw.sites;
      this.saveSettings();
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
      new import_obsidian.Notice("Add at least one destination in POSSE Publisher settings");
      return;
    }
    if (destinations.length === 1) {
      this.preparePublish(destinations[0], overrideStatus);
      return;
    }
    new SitePickerModal(this.app, destinations, (dest) => {
      this.preparePublish(dest, overrideStatus);
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
      new import_obsidian.Notice("Open a markdown file first");
      return;
    }
    if (!this.hasValidCredentials(destination)) {
      new import_obsidian.Notice(`Configure credentials for "${destination.name}" in POSSE Publisher settings`);
      return;
    }
    const payload = await this.buildPayload(view.file, overrideStatus);
    if (this.settings.confirmBeforePublish) {
      new ConfirmPublishModal(this.app, payload, destination, () => {
        this.publishToDestination(destination, payload, view.file);
      }).open();
    } else {
      this.publishToDestination(destination, payload, view.file);
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
      new import_obsidian.Notice("Add at least one destination in POSSE Publisher settings");
      return;
    }
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || !view.file) {
      new import_obsidian.Notice("Open a markdown file first");
      return;
    }
    const payload = await this.buildPayload(view.file, overrideStatus);
    new import_obsidian.Notice(`POSSEing "${payload.title}" to ${destinations.length} destination(s)...`);
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
      new import_obsidian.Notice("Open a markdown file first");
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
    contentEl.createEl("h3", { text: "Confirm POSSE" });
    contentEl.createEl("p", {
      text: `You are about to POSSE to ${this.destination.name}:`
    });
    const summary = contentEl.createDiv({ cls: "publish-summary" });
    summary.createEl("div", { text: `Title: ${this.payload.title}` });
    summary.createEl("div", { text: `Slug: ${this.payload.slug}` });
    summary.createEl("div", { text: `Status: ${this.payload.status}` });
    summary.createEl("div", { text: `Type: ${this.payload.type}` });
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
    this.setPlaceholder("Choose a destination to POSSE to...");
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
          new import_obsidian.Notice("Warning: Canonical Base URL should start with https://");
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
      new import_obsidian.Setting(destContainer).setName("Destination name").setDesc("A label for this destination (e.g. My Blog)").addText(
        (text) => text.setPlaceholder("My Site").setValue(destination.name).onChange(async (value) => {
          this.plugin.settings.destinations[index].name = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(destContainer).setName("Type").setDesc("Platform to publish to").addDropdown(
        (dd) => dd.addOption("custom-api", "Custom API").addOption("devto", "Dev.to").addOption("mastodon", "Mastodon").addOption("bluesky", "Bluesky").addOption("medium", "Medium").addOption("reddit", "Reddit").addOption("threads", "Threads").addOption("linkedin", "LinkedIn").addOption("ecency", "Ecency (Hive)").setValue(destination.type || "custom-api").onChange(async (value) => {
          this.plugin.settings.destinations[index].type = value;
          await this.plugin.saveSettings();
          this.display();
        })
      );
      const destType = destination.type || "custom-api";
      if (destType === "custom-api") {
        new import_obsidian.Setting(destContainer).setName("Site URL").setDesc("Your site's base URL (must start with https://)").addText(
          (text) => text.setPlaceholder("https://example.com").setValue(destination.url || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].url = value;
            if (value && !value.startsWith("https://") && !value.startsWith("http://localhost")) {
              new import_obsidian.Notice("Warning: Destination URL should start with https://");
            }
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("API Key").setDesc("PUBLISH_API_KEY from your site's environment").addText((text) => {
          text.setPlaceholder("Enter API key").setValue(destination.apiKey || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].apiKey = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "devto") {
        new import_obsidian.Setting(destContainer).setName("Dev.to API Key").setDesc("From https://dev.to/settings/extensions").addText((text) => {
          text.setPlaceholder("Enter Dev.to API key").setValue(destination.apiKey || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].apiKey = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "mastodon") {
        new import_obsidian.Setting(destContainer).setName("Instance URL").setDesc("Your Mastodon instance (e.g. https://mastodon.social)").addText(
          (text) => text.setPlaceholder("https://mastodon.social").setValue(destination.instanceUrl || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].instanceUrl = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Access token").setDesc("From your Mastodon account: Settings \u2192 Development \u2192 New Application").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.accessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].accessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "bluesky") {
        new import_obsidian.Setting(destContainer).setName("Bluesky handle").setDesc("Your handle (e.g. yourname.bsky.social)").addText(
          (text) => text.setPlaceholder("yourname.bsky.social").setValue(destination.handle || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].handle = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("App password").setDesc("From https://bsky.app/settings/app-passwords \u2014 NOT your login password").addText((text) => {
          text.setPlaceholder("xxxx-xxxx-xxxx-xxxx").setValue(destination.appPassword || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].appPassword = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "medium") {
        new import_obsidian.Setting(destContainer).setName("Medium API notice").setDesc("The Medium API was archived in March 2023. It may still work but could be discontinued at any time.");
        new import_obsidian.Setting(destContainer).setName("Integration token").setDesc("From medium.com \u2192 Settings \u2192 Security and apps \u2192 Integration tokens").addText((text) => {
          text.setPlaceholder("Enter Medium integration token").setValue(destination.mediumToken || "").onChange(async (value) => {
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
          (text) => text.setPlaceholder("u/yourname").setValue(destination.redditUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Default subreddit").setDesc('e.g. r/webdev \u2014 can be overridden per note with "subreddit:" frontmatter').addText(
          (text) => text.setPlaceholder("r/subredditname").setValue(destination.redditDefaultSubreddit || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditDefaultSubreddit = value;
            await this.plugin.saveSettings();
          })
        );
      } else if (destType === "threads") {
        new import_obsidian.Setting(destContainer).setName("Threads user ID").setDesc("Your numeric Threads/Instagram user ID").addText(
          (text) => text.setPlaceholder("123456789").setValue(destination.threadsUserId || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].threadsUserId = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Access token").setDesc("Long-lived Threads access token with threads_content_publish permission").addText((text) => {
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
        new import_obsidian.Setting(destContainer).setName("Person URN").setDesc("Your LinkedIn member URN, e.g. urn:li:person:abc123").addText(
          (text) => text.setPlaceholder("urn:li:person:...").setValue(destination.linkedinPersonUrn || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].linkedinPersonUrn = value;
            await this.plugin.saveSettings();
          })
        );
      } else if (destType === "ecency") {
        new import_obsidian.Setting(destContainer).setName("Hive username").setDesc("Your Hive/Ecency account name (without @)").addText(
          (text) => text.setPlaceholder("yourusername").setValue(destination.hiveUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hiveUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Posting key").setDesc("Your Hive private posting key (not the owner or active key)").addText((text) => {
          text.setPlaceholder("5K...").setValue(destination.hivePostingKey || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hivePostingKey = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Community").setDesc("Hive community tag to post in (e.g. hive-174301 for OCD)").addText(
          (text) => text.setPlaceholder("hive-174301").setValue(destination.hiveCommunity || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hiveCommunity = value;
            await this.plugin.saveSettings();
          })
        );
      }
      new import_obsidian.Setting(destContainer).addButton(
        (btn) => btn.setButtonText("Test connection").onClick(async () => {
          if (!this.plugin.hasValidCredentials(destination)) {
            new import_obsidian.Notice("Configure credentials first");
            return;
          }
          if (destType === "custom-api") {
            try {
              const url = `${destination.url.replace(/\/$/, "")}/api/publish`;
              const response = await (0, import_obsidian.requestUrl)({
                url,
                method: "OPTIONS",
                headers: { "x-publish-key": destination.apiKey }
              });
              if (response.status >= 200 && response.status < 400) {
                new import_obsidian.Notice(`\u2713 Connection to ${destination.name || destination.url} successful`);
              } else {
                new import_obsidian.Notice(`\u2717 ${destination.name || destination.url} responded with ${response.status}`);
              }
            } catch {
              new import_obsidian.Notice(`\u2717 Could not reach ${destination.name || destination.url}`);
            }
          } else {
            new import_obsidian.Notice(`Credentials look configured for ${destination.name}. Publish to test.`);
          }
        })
      ).addButton(
        (btn) => btn.setButtonText("Remove destination").setWarning().onClick(async () => {
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
          yesBtn.addEventListener("click", async () => {
            this.plugin.settings.destinations.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          });
          noBtn.addEventListener("click", () => confirmEl.remove());
        })
      );
    });
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText("Add destination").setCta().onClick(async () => {
        this.plugin.settings.destinations.push({
          name: "",
          type: "custom-api",
          url: "",
          apiKey: ""
        });
        await this.plugin.saveSettings();
        this.display();
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
    new import_obsidian.Setting(containerEl).setName("Strip Obsidian syntax").setDesc(
      "Convert wiki-links, remove embeds, comments, and dataview blocks before publishing"
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.stripObsidianSyntax).onChange(async (value) => {
        this.plugin.settings.stripObsidianSyntax = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Support POSSE Publisher").setHeading();
    containerEl.createEl("p", {
      text: "POSSE Publisher is free and open source. If it saves you time, consider supporting its development.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("Buy Me a Coffee").setDesc("One-time or recurring support").addButton(
      (btn) => btn.setButtonText("\u2615 Support").onClick(() => {
        window.open("https://buymeacoffee.com/theofficaldm", "_blank");
      })
    );
    new import_obsidian.Setting(containerEl).setName("GitHub Sponsors").setDesc("Monthly sponsorship through GitHub").addButton(
      (btn) => btn.setButtonText("\u2764 Sponsor").onClick(() => {
        window.open("https://github.com/sponsors/TheOfficialDM", "_blank");
      })
    );
    new import_obsidian.Setting(containerEl).setName("All funding options").setDesc("devinmarshall.info/fund").addButton(
      (btn) => btn.setButtonText("\u{1F517} Fund").onClick(() => {
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
    contentEl.createEl("h3", { text: "POSSE Status" });
    contentEl.createEl("p", { text: `Note: ${this.title}` });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiIHwgXCJtZWRpdW1cIiB8IFwicmVkZGl0XCIgfCBcInRocmVhZHNcIiB8IFwibGlua2VkaW5cIiB8IFwiZWNlbmN5XCI7XHJcblxyXG5pbnRlcmZhY2UgRGVzdGluYXRpb24ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB0eXBlOiBEZXN0aW5hdGlvblR5cGU7XHJcbiAgLy8gY3VzdG9tLWFwaVxyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG4gIC8vIG1hc3RvZG9uXHJcbiAgaW5zdGFuY2VVcmw/OiBzdHJpbmc7XHJcbiAgYWNjZXNzVG9rZW4/OiBzdHJpbmc7XHJcbiAgLy8gYmx1ZXNreVxyXG4gIGhhbmRsZT86IHN0cmluZztcclxuICBhcHBQYXNzd29yZD86IHN0cmluZztcclxuICAvLyBtZWRpdW1cclxuICBtZWRpdW1Ub2tlbj86IHN0cmluZztcclxuICBtZWRpdW1BdXRob3JJZD86IHN0cmluZztcclxuICAvLyByZWRkaXRcclxuICByZWRkaXRDbGllbnRJZD86IHN0cmluZztcclxuICByZWRkaXRDbGllbnRTZWNyZXQ/OiBzdHJpbmc7XHJcbiAgcmVkZGl0UmVmcmVzaFRva2VuPzogc3RyaW5nO1xyXG4gIHJlZGRpdFVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHJlZGRpdERlZmF1bHRTdWJyZWRkaXQ/OiBzdHJpbmc7XHJcbiAgLy8gdGhyZWFkc1xyXG4gIHRocmVhZHNVc2VySWQ/OiBzdHJpbmc7XHJcbiAgdGhyZWFkc0FjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGxpbmtlZGluXHJcbiAgbGlua2VkaW5BY2Nlc3NUb2tlbj86IHN0cmluZztcclxuICBsaW5rZWRpblBlcnNvblVybj86IHN0cmluZztcclxuICAvLyBlY2VuY3kgLyBoaXZlXHJcbiAgaGl2ZVVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIGhpdmVQb3N0aW5nS2V5Pzogc3RyaW5nO1xyXG4gIGhpdmVDb21tdW5pdHk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IHtcclxuICBkZXN0aW5hdGlvbnM6IFtdLFxyXG4gIGNhbm9uaWNhbEJhc2VVcmw6IFwiXCIsXHJcbiAgZGVmYXVsdFN0YXR1czogXCJkcmFmdFwiLFxyXG4gIGNvbmZpcm1CZWZvcmVQdWJsaXNoOiB0cnVlLFxyXG4gIHN0cmlwT2JzaWRpYW5TeW50YXg6IHRydWUsXHJcbn07XHJcblxyXG5pbnRlcmZhY2UgRnJvbnRtYXR0ZXIge1xyXG4gIHRpdGxlPzogc3RyaW5nO1xyXG4gIHNsdWc/OiBzdHJpbmc7XHJcbiAgZXhjZXJwdD86IHN0cmluZztcclxuICB0eXBlPzogc3RyaW5nO1xyXG4gIHN0YXR1cz86IHN0cmluZztcclxuICB0YWdzPzogc3RyaW5nW107XHJcbiAgcGlsbGFyPzogc3RyaW5nO1xyXG4gIGNvdmVySW1hZ2U/OiBzdHJpbmc7XHJcbiAgZmVhdHVyZWQ/OiBib29sZWFuO1xyXG4gIG1ldGFUaXRsZT86IHN0cmluZztcclxuICBtZXRhRGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbiAgb2dJbWFnZT86IHN0cmluZztcclxuICB2aWRlb1VybD86IHN0cmluZztcclxuICBjYW5vbmljYWxVcmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBFeHRyYWN0IGJvZHkgY29udGVudCBiZWxvdyB0aGUgWUFNTCBmcm9udG1hdHRlciBmZW5jZS4gKi9cclxuZnVuY3Rpb24gZXh0cmFjdEJvZHkoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXHI/XFxuW1xcc1xcU10qP1xccj9cXG4tLS1cXHI/XFxuPyhbXFxzXFxTXSopJC8pO1xyXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRyaW0oKSA6IGNvbnRlbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBhIEZyb250bWF0dGVyIG9iamVjdCBmcm9tIE9ic2lkaWFuJ3MgY2FjaGVkIG1ldGFkYXRhLlxyXG4gKiBGYWxscyBiYWNrIGdyYWNlZnVsbHkgd2hlbiBmaWVsZHMgYXJlIGFic2VudC5cclxuICovXHJcbmZ1bmN0aW9uIGJ1aWxkRnJvbnRtYXR0ZXIoY2FjaGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKTogRnJvbnRtYXR0ZXIge1xyXG4gIGlmICghY2FjaGUpIHJldHVybiB7fTtcclxuICBjb25zdCBmbTogRnJvbnRtYXR0ZXIgPSB7fTtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50aXRsZSA9PT0gXCJzdHJpbmdcIikgZm0udGl0bGUgPSBjYWNoZS50aXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnNsdWcgPT09IFwic3RyaW5nXCIpIGZtLnNsdWcgPSBjYWNoZS5zbHVnO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuZXhjZXJwdCA9PT0gXCJzdHJpbmdcIikgZm0uZXhjZXJwdCA9IGNhY2hlLmV4Y2VycHQ7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50eXBlID09PSBcInN0cmluZ1wiKSBmbS50eXBlID0gY2FjaGUudHlwZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnN0YXR1cyA9PT0gXCJzdHJpbmdcIikgZm0uc3RhdHVzID0gY2FjaGUuc3RhdHVzO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUucGlsbGFyID09PSBcInN0cmluZ1wiKSBmbS5waWxsYXIgPSBjYWNoZS5waWxsYXI7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jb3ZlckltYWdlID09PSBcInN0cmluZ1wiKSBmbS5jb3ZlckltYWdlID0gY2FjaGUuY292ZXJJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFUaXRsZSA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YVRpdGxlID0gY2FjaGUubWV0YVRpdGxlO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUubWV0YURlc2NyaXB0aW9uID09PSBcInN0cmluZ1wiKSBmbS5tZXRhRGVzY3JpcHRpb24gPSBjYWNoZS5tZXRhRGVzY3JpcHRpb247XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5vZ0ltYWdlID09PSBcInN0cmluZ1wiKSBmbS5vZ0ltYWdlID0gY2FjaGUub2dJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnZpZGVvVXJsID09PSBcInN0cmluZ1wiKSBmbS52aWRlb1VybCA9IGNhY2hlLnZpZGVvVXJsO1xyXG5cclxuICBpZiAodHlwZW9mIGNhY2hlLmZlYXR1cmVkID09PSBcImJvb2xlYW5cIikgZm0uZmVhdHVyZWQgPSBjYWNoZS5mZWF0dXJlZDtcclxuICBlbHNlIGlmIChjYWNoZS5mZWF0dXJlZCA9PT0gXCJ0cnVlXCIpIGZtLmZlYXR1cmVkID0gdHJ1ZTtcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2FjaGUudGFncykpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzLm1hcCgodDogdW5rbm93bikgPT4gU3RyaW5nKHQpLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGNhY2hlLnRhZ3MgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzXHJcbiAgICAgIC5yZXBsYWNlKC9eXFxbfFxcXSQvZywgXCJcIilcclxuICAgICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgICAubWFwKCh0OiBzdHJpbmcpID0+IHQudHJpbSgpKVxyXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jYW5vbmljYWxVcmwgPT09IFwic3RyaW5nXCIpIGZtLmNhbm9uaWNhbFVybCA9IGNhY2hlLmNhbm9uaWNhbFVybDtcclxuXHJcbiAgcmV0dXJuIGZtO1xyXG59XHJcblxyXG4vKiogQ29udmVydCBhIHRpdGxlIHN0cmluZyB0byBhIFVSTC1zYWZlIHNsdWcsIGhhbmRsaW5nIGRpYWNyaXRpY3MuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1NsdWcodGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHRpdGxlXHJcbiAgICAubm9ybWFsaXplKFwiTkZEXCIpXHJcbiAgICAucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCBcIi1cIilcclxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCBcIlwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFByZS1wcm9jZXNzIE9ic2lkaWFuLXNwZWNpZmljIG1hcmtkb3duIGJlZm9yZSBzZW5kaW5nIHRvIHRoZSBibG9nIEFQSS5cclxuICogU3RyaXBzIHdpa2ktbGlua3MsIGVtYmVkcywgY29tbWVudHMsIGFuZCBkYXRhdmlldyBibG9ja3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2Vzc0NvbnRlbnQoYm9keTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAvLyBSZW1vdmUgT2JzaWRpYW4gY29tbWVudHM6ICUlLi4uJSVcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8lJVtcXHNcXFNdKj8lJS9nLCBcIlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmsgZW1iZWRzOiAhW1tmaWxlXV0gXHUyMTkyIChyZW1vdmVkKVxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoLyFcXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRoIGFsaWFzOiBbW3RhcmdldHxhbGlhc11dIFx1MjE5MiBhbGlhc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXXxdKylcXHwoW15cXF1dKylcXF1cXF0vZywgXCIkMlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmtzIHdpdGhvdXQgYWxpYXM6IFtbdGFyZ2V0XV0gXHUyMTkyIHRhcmdldFxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXV0rKVxcXVxcXS9nLCBcIiQxXCIpO1xyXG5cclxuICAvLyBSZW1vdmUgZGF0YXZpZXcgY29kZSBibG9ja3NcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9gYGBkYXRhdmlld1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdqc1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcblxyXG4gIC8vIENsZWFuIHVwIGV4Y2VzcyBibGFuayBsaW5lcyBsZWZ0IGJ5IHJlbW92YWxzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGJvZHkudHJpbSgpO1xyXG59XHJcblxyXG4vKiogRXNjYXBlIEhUTUwgc3BlY2lhbCBjaGFyYWN0ZXJzLiAqL1xyXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gc3RyXHJcbiAgICAucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpXHJcbiAgICAucmVwbGFjZSgvPC9nLCBcIiZsdDtcIilcclxuICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBiYXNpYyBNYXJrZG93biB0byBIVE1MLiBIYW5kbGVzIGhlYWRpbmdzLCBib2xkLCBpdGFsaWMsIGlubGluZSBjb2RlLFxyXG4gKiBsaW5rcywgaW1hZ2VzLCBsaXN0cywgYmxvY2txdW90ZXMsIGhvcml6b250YWwgcnVsZXMsIGZlbmNlZCBjb2RlIGJsb2NrcywgYW5kIHBhcmFncmFwaHMuXHJcbiAqIE5vIGV4dGVybmFsIGRlcGVuZGVuY2llcyBcdTIwMTQgcmVnZXggb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93blRvSHRtbChtYXJrZG93bjogc3RyaW5nKTogc3RyaW5nIHtcclxuICBsZXQgaHRtbCA9IG1hcmtkb3duO1xyXG5cclxuICAvLyBGZW5jZWQgY29kZSBibG9ja3MgKHByb2Nlc3MgZmlyc3QgdG8gYXZvaWQgbWFuZ2xpbmcgdGhlaXIgY29udGVudHMpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvYGBgKFxcdyopXFxuKFtcXHNcXFNdKj8pYGBgL2csIChfLCBsYW5nLCBjb2RlKSA9PlxyXG4gICAgYDxwcmU+PGNvZGUke2xhbmcgPyBgIGNsYXNzPVwibGFuZ3VhZ2UtJHtsYW5nfVwiYCA6IFwiXCJ9PiR7ZXNjYXBlSHRtbChjb2RlLnRyaW0oKSl9PC9jb2RlPjwvcHJlPmBcclxuICApO1xyXG5cclxuICAvLyBIZWFkaW5nc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjIyMgKC4rKSQvZ20sIFwiPGg2PiQxPC9oNj5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXiMjIyMjICguKykkL2dtLCBcIjxoNT4kMTwvaDU+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjICguKykkL2dtLCBcIjxoND4kMTwvaDQ+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMgKC4rKSQvZ20sIFwiPGgzPiQxPC9oMz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXiMjICguKykkL2dtLCBcIjxoMj4kMTwvaDI+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jICguKykkL2dtLCBcIjxoMT4kMTwvaDE+XCIpO1xyXG5cclxuICAvLyBIb3Jpem9udGFsIHJ1bGVzXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXlstKl9dezMsfVxccyokL2dtLCBcIjxocj5cIik7XHJcblxyXG4gIC8vIEJsb2NrcXVvdGVzXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXj4gKC4rKSQvZ20sIFwiPGJsb2NrcXVvdGU+JDE8L2Jsb2NrcXVvdGU+XCIpO1xyXG5cclxuICAvLyBCb2xkICsgaXRhbGljIChvcmRlcjogdHJpcGxlIFx1MjE5MiBkb3VibGUgXHUyMTkyIHNpbmdsZSlcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXCpcXCpcXCooLis/KVxcKlxcKlxcKi9nLCBcIjxzdHJvbmc+PGVtPiQxPC9lbT48L3N0cm9uZz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFwqXFwqKC4rPylcXCpcXCovZywgXCI8c3Ryb25nPiQxPC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcKiguKz8pXFwqL2csIFwiPGVtPiQxPC9lbT5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvX19fKC4rPylfX18vZywgXCI8c3Ryb25nPjxlbT4kMTwvZW0+PC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL19fKC4rPylfXy9nLCBcIjxzdHJvbmc+JDE8L3N0cm9uZz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXyguKz8pXy9nLCBcIjxlbT4kMTwvZW0+XCIpO1xyXG5cclxuICAvLyBJbmxpbmUgY29kZVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL2AoW15gXSspYC9nLCBcIjxjb2RlPiQxPC9jb2RlPlwiKTtcclxuXHJcbiAgLy8gSW1hZ2VzIChiZWZvcmUgbGlua3MpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKChbXildKylcXCkvZywgJzxpbWcgc3JjPVwiJDJcIiBhbHQ9XCIkMVwiPicpO1xyXG5cclxuICAvLyBMaW5rc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKChbXildKylcXCkvZywgJzxhIGhyZWY9XCIkMlwiPiQxPC9hPicpO1xyXG5cclxuICAvLyBVbm9yZGVyZWQgbGlzdCBpdGVtc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15bLSorXSAoLispJC9nbSwgXCI8bGk+JDE8L2xpPlwiKTtcclxuXHJcbiAgLy8gT3JkZXJlZCBsaXN0IGl0ZW1zXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXlxcZCtcXC4gKC4rKSQvZ20sIFwiPGxpPiQxPC9saT5cIik7XHJcblxyXG4gIC8vIFdyYXAgPGxpPiBydW5zIGluIDx1bD5cclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC8oPGxpPltcXHNcXFNdKj88XFwvbGk+XFxuPykrL2csIChtYXRjaCkgPT4gYDx1bD4ke21hdGNofTwvdWw+YCk7XHJcblxyXG4gIC8vIFBhcmFncmFwaHMgKGRvdWJsZSBuZXdsaW5lIFx1MjE5MiBwYXJhZ3JhcGggYmxvY2spXHJcbiAgaHRtbCA9IGh0bWxcclxuICAgIC5zcGxpdCgvXFxuXFxuKy8pXHJcbiAgICAubWFwKChibG9jaykgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkID0gYmxvY2sudHJpbSgpO1xyXG4gICAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBcIlwiO1xyXG4gICAgICBpZiAoL148KGhbMS02XXx1bHxvbHxsaXxibG9ja3F1b3RlfHByZXxocikvLnRlc3QodHJpbW1lZCkpIHJldHVybiB0cmltbWVkO1xyXG4gICAgICByZXR1cm4gYDxwPiR7dHJpbW1lZC5yZXBsYWNlKC9cXG4vZywgXCI8YnI+XCIpfTwvcD5gO1xyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgIC5qb2luKFwiXFxuXCIpO1xyXG5cclxuICByZXR1cm4gaHRtbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmlwIGFsbCBNYXJrZG93biBzeW50YXggdG8gcHJvZHVjZSBwbGFpbiB0ZXh0IHN1aXRhYmxlIGZvclxyXG4gKiBjaGFyYWN0ZXItbGltaXRlZCBwbGF0Zm9ybXMgKFRocmVhZHMsIE1hc3RvZG9uIHByZXZpZXcsIGV0Yy4pLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duVG9QbGFpblRleHQobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgbGV0IHRleHQgPSBtYXJrZG93bjtcclxuICAvLyBGZW5jZWQgY29kZSBibG9ja3MgXHUyMTkyIGtlZXAgY29udGVudFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2BgYFxcdypcXG4oW1xcc1xcU10qPylgYGAvZywgXCIkMVwiKTtcclxuICAvLyBSZW1vdmUgaGVhZGluZyBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXiN7MSw2fSAvZ20sIFwiXCIpO1xyXG4gIC8vIEJvbGQvaXRhbGljIG1hcmtlcnNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXCp7MSwzfXxfezEsM30vZywgXCJcIik7XHJcbiAgLy8gSW5saW5lIGNvZGUgXHUyMTkyIHVud3JhcFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2AoW15gXSspYC9nLCBcIiQxXCIpO1xyXG4gIC8vIEltYWdlcyBcdTIxOTIgYWx0IHRleHRcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8hXFxbKFteXFxdXSopXFxdXFwoW14pXStcXCkvZywgXCIkMVwiKTtcclxuICAvLyBMaW5rcyBcdTIxOTIgbGluayB0ZXh0XHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoW14pXStcXCkvZywgXCIkMVwiKTtcclxuICAvLyBCbG9ja3F1b3Rlc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14+IC9nbSwgXCJcIik7XHJcbiAgLy8gTGlzdCBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlstKitcXGQuXSAvZ20sIFwiXCIpO1xyXG4gIC8vIEhvcml6b250YWwgcnVsZXNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eWy0qX117Myx9XFxzKiQvZ20sIFwiXCIpO1xyXG4gIC8vIENvbGxhcHNlIG11bHRpcGxlIGJsYW5rIGxpbmVzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuICByZXR1cm4gdGV4dC50cmltKCk7XHJcbn1cclxuXHJcbmNvbnN0IEZST05UTUFUVEVSX1RFTVBMQVRFID0gYC0tLVxyXG50aXRsZTogXHJcbnNsdWc6IFxyXG5leGNlcnB0OiBcclxudHlwZTogYmxvZ1xyXG5zdGF0dXM6IGRyYWZ0XHJcbnRhZ3M6IFtdXHJcbnBpbGxhcjogXHJcbmNvdmVySW1hZ2U6IFxyXG5mZWF0dXJlZDogZmFsc2VcclxubWV0YVRpdGxlOiBcclxubWV0YURlc2NyaXB0aW9uOiBcclxub2dJbWFnZTogXHJcbnZpZGVvVXJsOiBcclxuY2Fub25pY2FsVXJsOiBcclxuc3luZGljYXRpb246IFtdXHJcbi0tLVxyXG5cclxuYDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvc3NlUHVibGlzaGVyUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuICBzZXR0aW5nczogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XHJcbiAgcHJpdmF0ZSBzdGF0dXNCYXJFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgYXN5bmMgb25sb2FkKCkge1xyXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuICAgIHRoaXMubWlncmF0ZVNldHRpbmdzKCk7XHJcblxyXG4gICAgdGhpcy5zdGF0dXNCYXJFbCA9IHRoaXMuYWRkU3RhdHVzQmFySXRlbSgpO1xyXG5cclxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcInNlbmRcIiwgXCJQT1NTRSBQdWJsaXNoXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2hcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBQdWJsaXNoXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1kcmFmdFwiLFxyXG4gICAgICBuYW1lOiBcIlBPU1NFIFB1Ymxpc2ggYXMgRHJhZnRcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwiZHJhZnRcIiksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoLWxpdmVcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBQdWJsaXNoIExpdmVcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwicHVibGlzaGVkXCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtaW5zZXJ0LXRlbXBsYXRlXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgSW5zZXJ0IEZyb250bWF0dGVyIFRlbXBsYXRlXCIsXHJcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIGlmIChjb250ZW50LnRyaW1TdGFydCgpLnN0YXJ0c1dpdGgoXCItLS1cIikpIHtcclxuICAgICAgICAgIG5ldyBOb3RpY2UoXCJGcm9udG1hdHRlciBhbHJlYWR5IGV4aXN0cyBpbiB0aGlzIG5vdGVcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3IoMCwgMCk7XHJcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShGUk9OVE1BVFRFUl9URU1QTEFURSwgeyBsaW5lOiAwLCBjaDogMCB9KTtcclxuICAgICAgICAvLyBQbGFjZSBjdXJzb3Igb24gdGhlIHRpdGxlIGxpbmVcclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDEsIDcpO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtdG8tYWxsXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgdG8gQWxsIERlc3RpbmF0aW9uc1wiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5wb3NzZVRvQWxsKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1zdGF0dXNcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBTdGF0dXMgXHUyMDE0IFZpZXcgU3luZGljYXRpb25cIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VTdGF0dXMoKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBvbnVubG9hZCgpIHtcclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgLy8gTWlncmF0ZSB2MSBzaW5nbGUtc2l0ZSBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIiBhcyBEZXN0aW5hdGlvblR5cGUsXHJcbiAgICAgICAgICB1cmw6IHJhdy5zaXRlVXJsIGFzIHN0cmluZyxcclxuICAgICAgICAgIGFwaUtleTogKHJhdy5hcGlLZXkgYXMgc3RyaW5nKSB8fCBcIlwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIGRlbGV0ZSByYXcuc2l0ZVVybDtcclxuICAgICAgZGVsZXRlIHJhdy5hcGlLZXk7XHJcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBNaWdyYXRlIHNpdGVzIFx1MjE5MiBkZXN0aW5hdGlvbnMga2V5XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcuc2l0ZXMpICYmICFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IHJhdy5zaXRlcyBhcyBEZXN0aW5hdGlvbltdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVzO1xyXG4gICAgICB0aGlzLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMpKSB7XHJcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zID0gW107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwaWNrU2l0ZUFuZFB1Ymxpc2gob3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucyB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJBZGQgYXQgbGVhc3Qgb25lIGRlc3RpbmF0aW9uIGluIFBPU1NFIFB1Ymxpc2hlciBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0aW5hdGlvbnNbMF0sIG92ZXJyaWRlU3RhdHVzKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbmV3IFNpdGVQaWNrZXJNb2RhbCh0aGlzLmFwcCwgZGVzdGluYXRpb25zLCAoZGVzdCkgPT4ge1xyXG4gICAgICB0aGlzLnByZXBhcmVQdWJsaXNoKGRlc3QsIG92ZXJyaWRlU3RhdHVzKTtcclxuICAgIH0pLm9wZW4oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJ1aWxkIHRoZSBwdWJsaXNoIHBheWxvYWQgZnJvbSB0aGUgYWN0aXZlIGZpbGUgYW5kIHNldHRpbmdzLlxyXG4gICAqIFNoYXJlZCBieSBwcmVwYXJlUHVibGlzaCgpIGFuZCBwb3NzZVRvQWxsKCkgdG8gYXZvaWQgZHVwbGljYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBidWlsZFBheWxvYWQoXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICAgIG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIixcclxuICApOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XHJcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY2FjaGVkUmVhZChmaWxlKTtcclxuICAgIGNvbnN0IGZpbGVDYWNoZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xyXG4gICAgY29uc3QgZnJvbnRtYXR0ZXIgPSBidWlsZEZyb250bWF0dGVyKGZpbGVDYWNoZT8uZnJvbnRtYXR0ZXIpO1xyXG4gICAgY29uc3QgYm9keSA9IGV4dHJhY3RCb2R5KGNvbnRlbnQpO1xyXG4gICAgY29uc3QgcHJvY2Vzc2VkQm9keSA9IHRoaXMuc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheCA/IHByZXByb2Nlc3NDb250ZW50KGJvZHkpIDogYm9keTtcclxuICAgIGNvbnN0IHRpdGxlID0gZnJvbnRtYXR0ZXIudGl0bGUgfHwgZmlsZS5iYXNlbmFtZSB8fCBcIlVudGl0bGVkXCI7XHJcbiAgICBjb25zdCBzbHVnID0gZnJvbnRtYXR0ZXIuc2x1ZyB8fCB0b1NsdWcodGl0bGUpO1xyXG4gICAgY29uc3Qgc3RhdHVzID0gb3ZlcnJpZGVTdGF0dXMgfHwgZnJvbnRtYXR0ZXIuc3RhdHVzIHx8IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFN0YXR1cztcclxuICAgIGNvbnN0IHBvc3RUeXBlID0gZnJvbnRtYXR0ZXIudHlwZSB8fCBcImJsb2dcIjtcclxuICAgIC8vIFVzZSBmcm9udG1hdHRlciBjYW5vbmljYWxVcmwgb3ZlcnJpZGUgaWYgcHJlc2VudDsgb3RoZXJ3aXNlIGF1dG8tZ2VuZXJhdGVcclxuICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9XHJcbiAgICAgIGZyb250bWF0dGVyLmNhbm9uaWNhbFVybCB8fFxyXG4gICAgICAodGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsXHJcbiAgICAgICAgPyBgJHt0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3Bvc3RUeXBlfS8ke3NsdWd9YFxyXG4gICAgICAgIDogXCJcIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgc2x1ZyxcclxuICAgICAgYm9keTogcHJvY2Vzc2VkQm9keSxcclxuICAgICAgZXhjZXJwdDogZnJvbnRtYXR0ZXIuZXhjZXJwdCB8fCBcIlwiLFxyXG4gICAgICB0eXBlOiBwb3N0VHlwZSxcclxuICAgICAgc3RhdHVzLFxyXG4gICAgICB0YWdzOiBmcm9udG1hdHRlci50YWdzIHx8IFtdLFxyXG4gICAgICBwaWxsYXI6IGZyb250bWF0dGVyLnBpbGxhciB8fCBcIlwiLFxyXG4gICAgICBmZWF0dXJlZDogZnJvbnRtYXR0ZXIuZmVhdHVyZWQgfHwgZmFsc2UsXHJcbiAgICAgIGNvdmVySW1hZ2U6IGZyb250bWF0dGVyLmNvdmVySW1hZ2UgfHwgXCJcIixcclxuICAgICAgbWV0YVRpdGxlOiBmcm9udG1hdHRlci5tZXRhVGl0bGUgfHwgXCJcIixcclxuICAgICAgbWV0YURlc2NyaXB0aW9uOiBmcm9udG1hdHRlci5tZXRhRGVzY3JpcHRpb24gfHwgXCJcIixcclxuICAgICAgb2dJbWFnZTogZnJvbnRtYXR0ZXIub2dJbWFnZSB8fCBcIlwiLFxyXG4gICAgICB2aWRlb1VybDogZnJvbnRtYXR0ZXIudmlkZW9VcmwgfHwgXCJcIixcclxuICAgICAgLi4uKGNhbm9uaWNhbFVybCAmJiB7IGNhbm9uaWNhbFVybCB9KSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgb3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgbWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICBuZXcgTm90aWNlKGBDb25maWd1cmUgY3JlZGVudGlhbHMgZm9yIFwiJHtkZXN0aW5hdGlvbi5uYW1lfVwiIGluIFBPU1NFIFB1Ymxpc2hlciBzZXR0aW5nc2ApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKHZpZXcuZmlsZSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG5cclxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoKSB7XHJcbiAgICAgIG5ldyBDb25maXJtUHVibGlzaE1vZGFsKHRoaXMuYXBwLCBwYXlsb2FkLCBkZXN0aW5hdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdGluYXRpb24sIHBheWxvYWQsIHZpZXcuZmlsZSEpO1xyXG4gICAgICB9KS5vcGVuKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJvdXRlIGEgcHVibGlzaCB0byB0aGUgY29ycmVjdCBwbGF0Zm9ybSBoYW5kbGVyLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGVzdGluYXRpb24oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgc3dpdGNoIChkZXN0aW5hdGlvbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJkZXZ0b1wiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0RldlRvKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcIm1hc3RvZG9uXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvTWFzdG9kb24oZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwiYmx1ZXNreVwiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0JsdWVza3koZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwibWVkaXVtXCI6XHJcbiAgICAgIGNhc2UgXCJyZWRkaXRcIjpcclxuICAgICAgY2FzZSBcInRocmVhZHNcIjpcclxuICAgICAgY2FzZSBcImxpbmtlZGluXCI6XHJcbiAgICAgIGNhc2UgXCJlY2VuY3lcIjpcclxuICAgICAgICBuZXcgTm90aWNlKGAke2Rlc3RpbmF0aW9uLm5hbWV9OiAke2Rlc3RpbmF0aW9uLnR5cGV9IHN1cHBvcnQgaXMgY29taW5nIGluIGEgZnV0dXJlIHVwZGF0ZWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9DdXN0b21BcGkoZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gYSBjdXN0b20gL2FwaS9wdWJsaXNoIGVuZHBvaW50LiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQ3VzdG9tQXBpKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICBjb25zdCBzdGF0dXMgPSBwYXlsb2FkLnN0YXR1cyBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyICR7ZGVzdGluYXRpb24ubmFtZX0uLi5gKTtcclxuICAgICAgY29uc3QgdXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYXBpL3B1Ymxpc2hgO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJ4LXB1Ymxpc2gta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgbGV0IHZlcmIgPSBcIlBPU1NFZFwiO1xyXG4gICAgICAgIHRyeSB7IGlmIChyZXNwb25zZS5qc29uPy51cHNlcnRlZCkgdmVyYiA9IFwiVXBkYXRlZFwiOyB9IGNhdGNoIHsgLyogbm9uLUpTT04gKi8gfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYCR7dmVyYn0gXCIke3RpdGxlfVwiIG9uICR7ZGVzdGluYXRpb24ubmFtZX0gYXMgJHtzdGF0dXN9YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhkZXN0aW5hdGlvbi5uYW1lKTtcclxuICAgICAgICBsZXQgc3luZGljYXRpb25Vcmw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgc3luZGljYXRpb25VcmwgPSByZXNwb25zZS5qc29uPy51cmwgfHxcclxuICAgICAgICAgICAgYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwYXlsb2FkLnNsdWcgYXMgc3RyaW5nfWA7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICBzeW5kaWNhdGlvblVybCA9IGAke2Rlc3RpbmF0aW9uLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9LyR7cGF5bG9hZC5zbHVnIGFzIHN0cmluZ31gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgc3luZGljYXRpb25VcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gcmVzcG9uc2UuanNvbj8uZXJyb3IgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRSB0byAke2Rlc3RpbmF0aW9uLm5hbWV9IGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFIGVycm9yICgke2Rlc3RpbmF0aW9uLm5hbWV9KTogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBEZXYudG8gdmlhIHRoZWlyIGFydGljbGVzIEFQSS4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb0RldlRvKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIERldi50byAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuICAgICAgY29uc3QgdGFncyA9ICgocGF5bG9hZC50YWdzIGFzIHN0cmluZ1tdKSB8fCBbXSlcclxuICAgICAgICAuc2xpY2UoMCwgNClcclxuICAgICAgICAubWFwKCh0KSA9PiB0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldL2csIFwiXCIpKTtcclxuICAgICAgY29uc3QgYXJ0aWNsZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XHJcbiAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgYm9keV9tYXJrZG93bjogcGF5bG9hZC5ib2R5IGFzIHN0cmluZyxcclxuICAgICAgICBwdWJsaXNoZWQ6IHBheWxvYWQuc3RhdHVzID09PSBcInB1Ymxpc2hlZFwiLFxyXG4gICAgICAgIHRhZ3MsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IChwYXlsb2FkLmV4Y2VycHQgYXMgc3RyaW5nKSB8fCBcIlwiLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAocGF5bG9hZC5jYW5vbmljYWxVcmwpIGFydGljbGUuY2Fub25pY2FsX3VybCA9IHBheWxvYWQuY2Fub25pY2FsVXJsO1xyXG4gICAgICBpZiAocGF5bG9hZC5jb3ZlckltYWdlKSBhcnRpY2xlLm1haW5faW1hZ2UgPSBwYXlsb2FkLmNvdmVySW1hZ2U7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vZGV2LnRvL2FwaS9hcnRpY2xlc1wiLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcImFwaS1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBhcnRpY2xlIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QgYXJ0aWNsZVVybDogc3RyaW5nID0gcmVzcG9uc2UuanNvbj8udXJsIHx8IFwiaHR0cHM6Ly9kZXYudG9cIjtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIERldi50b2ApO1xyXG4gICAgICAgIHRoaXMuc2hvd1N0YXR1c0JhclN1Y2Nlc3MoXCJEZXYudG9cIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIGFydGljbGVVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gcmVzcG9uc2UuanNvbj8uZXJyb3IgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBEZXYudG8gUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgRGV2LnRvIGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIE1hc3RvZG9uIGJ5IHBvc3RpbmcgYSBzdGF0dXMgd2l0aCB0aGUgY2Fub25pY2FsIGxpbmsuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9NYXN0b2RvbihcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBNYXN0b2RvbiAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuICAgICAgY29uc3QgZXhjZXJwdCA9IChwYXlsb2FkLmV4Y2VycHQgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSAocGF5bG9hZC5jYW5vbmljYWxVcmwgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBzdGF0dXNUZXh0ID0gW3RpdGxlLCBleGNlcnB0LCBjYW5vbmljYWxVcmxdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXFxuXCIpO1xyXG4gICAgICBjb25zdCBpbnN0YW5jZVVybCA9IChkZXN0aW5hdGlvbi5pbnN0YW5jZVVybCB8fCBcIlwiKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBgJHtpbnN0YW5jZVVybH0vYXBpL3YxL3N0YXR1c2VzYCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtkZXN0aW5hdGlvbi5hY2Nlc3NUb2tlbn1gLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdGF0dXM6IHN0YXR1c1RleHQsIHZpc2liaWxpdHk6IFwicHVibGljXCIgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCBzdGF0dXNVcmw6IHN0cmluZyA9IHJlc3BvbnNlLmpzb24/LnVybCB8fCBpbnN0YW5jZVVybDtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIE1hc3RvZG9uYCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIk1hc3RvZG9uXCIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBzdGF0dXNVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gcmVzcG9uc2UuanNvbj8uZXJyb3IgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBNYXN0b2RvbiBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBNYXN0b2RvbiBlcnJvcjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBCbHVlc2t5IHZpYSBBVCBQcm90b2NvbC4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb0JsdWVza3koXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgQmx1ZXNreSAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuXHJcbiAgICAgIC8vIEF1dGhlbnRpY2F0ZVxyXG4gICAgICBjb25zdCBhdXRoUmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ic2t5LnNvY2lhbC94cnBjL2NvbS5hdHByb3RvLnNlcnZlci5jcmVhdGVTZXNzaW9uXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgaWRlbnRpZmllcjogZGVzdGluYXRpb24uaGFuZGxlLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6IGRlc3RpbmF0aW9uLmFwcFBhc3N3b3JkLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGF1dGhSZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgYXV0aFJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcclxuICAgICAgICBuZXcgTm90aWNlKGBCbHVlc2t5IGF1dGggZmFpbGVkOiAke2F1dGhSZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHsgZGlkLCBhY2Nlc3NKd3QgfSA9IGF1dGhSZXNwb25zZS5qc29uIGFzIHsgZGlkOiBzdHJpbmc7IGFjY2Vzc0p3dDogc3RyaW5nIH07XHJcblxyXG4gICAgICAvLyBCdWlsZCBwb3N0IHRleHQgKDMwMCBjaGFyIGxpbWl0KVxyXG4gICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSAocGF5bG9hZC5jYW5vbmljYWxVcmwgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBleGNlcnB0ID0gKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGJhc2VUZXh0ID0gW3RpdGxlLCBleGNlcnB0XS5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcdTIwMTQgXCIpO1xyXG4gICAgICBjb25zdCBtYXhUZXh0ID0gMzAwIC0gKGNhbm9uaWNhbFVybCA/IGNhbm9uaWNhbFVybC5sZW5ndGggKyAxIDogMCk7XHJcbiAgICAgIGNvbnN0IHRleHQgPSAoYmFzZVRleHQubGVuZ3RoID4gbWF4VGV4dFxyXG4gICAgICAgID8gYmFzZVRleHQuc3Vic3RyaW5nKDAsIG1heFRleHQgLSAxKSArIFwiXHUyMDI2XCJcclxuICAgICAgICA6IGJhc2VUZXh0XHJcbiAgICAgICkgKyAoY2Fub25pY2FsVXJsID8gYCAke2Nhbm9uaWNhbFVybH1gIDogXCJcIik7XHJcblxyXG4gICAgICBjb25zdCBwb3N0UmVjb3JkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcclxuICAgICAgICAkdHlwZTogXCJhcHAuYnNreS5mZWVkLnBvc3RcIixcclxuICAgICAgICB0ZXh0LFxyXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIGxhbmdzOiBbXCJlblwiXSxcclxuICAgICAgfTtcclxuICAgICAgaWYgKGNhbm9uaWNhbFVybCkge1xyXG4gICAgICAgIGNvbnN0IHVybFN0YXJ0ID0gdGV4dC5sYXN0SW5kZXhPZihjYW5vbmljYWxVcmwpO1xyXG4gICAgICAgIHBvc3RSZWNvcmQuZmFjZXRzID0gW3tcclxuICAgICAgICAgIGluZGV4OiB7IGJ5dGVTdGFydDogbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHRleHQuc3Vic3RyaW5nKDAsIHVybFN0YXJ0KSkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgYnl0ZUVuZDogICBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGV4dC5zdWJzdHJpbmcoMCwgdXJsU3RhcnQgKyBjYW5vbmljYWxVcmwubGVuZ3RoKSkubGVuZ3RoIH0sXHJcbiAgICAgICAgICBmZWF0dXJlczogW3sgJHR5cGU6IFwiYXBwLmJza3kucmljaHRleHQuZmFjZXQjbGlua1wiLCB1cmk6IGNhbm9uaWNhbFVybCB9XSxcclxuICAgICAgICB9XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ic2t5LnNvY2lhbC94cnBjL2NvbS5hdHByb3RvLnJlcG8uY3JlYXRlUmVjb3JkXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7YWNjZXNzSnd0fWAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICByZXBvOiBkaWQsXHJcbiAgICAgICAgICBjb2xsZWN0aW9uOiBcImFwcC5ic2t5LmZlZWQucG9zdFwiLFxyXG4gICAgICAgICAgcmVjb3JkOiBwb3N0UmVjb3JkLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QgdXJpOiBzdHJpbmcgPSBjcmVhdGVSZXNwb25zZS5qc29uPy51cmkgfHwgXCJcIjtcclxuICAgICAgICBjb25zdCBwb3N0VXJsID0gdXJpXHJcbiAgICAgICAgICA/IGBodHRwczovL2Jza3kuYXBwL3Byb2ZpbGUvJHtkZXN0aW5hdGlvbi5oYW5kbGV9L3Bvc3QvJHt1cmkuc3BsaXQoXCIvXCIpLnBvcCgpfWBcclxuICAgICAgICAgIDogXCJodHRwczovL2Jza3kuYXBwXCI7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0VkIFwiJHt0aXRsZX1cIiB0byBCbHVlc2t5YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIkJsdWVza3lcIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHBvc3RVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gU3RyaW5nKGNyZWF0ZVJlc3BvbnNlLmpzb24/Lm1lc3NhZ2UgfHwgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcoY3JlYXRlUmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBlcnJvcjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUE9TU0UgdG8gYWxsIGNvbmZpZ3VyZWQgZGVzdGluYXRpb25zIGF0IG9uY2UuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwb3NzZVRvQWxsKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBQT1NTRSBQdWJsaXNoZXIgc2V0dGluZ3NcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBtYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5idWlsZFBheWxvYWQodmlldy5maWxlLCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7cGF5bG9hZC50aXRsZX1cIiB0byAke2Rlc3RpbmF0aW9ucy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpLi4uYCk7XHJcbiAgICBmb3IgKGNvbnN0IGRlc3Qgb2YgZGVzdGluYXRpb25zKSB7XHJcbiAgICAgIGlmICh0aGlzLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdCkpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3QsIHBheWxvYWQsIHZpZXcuZmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgU2tpcHBpbmcgXCIke2Rlc3QubmFtZX1cIiBcdTIwMTQgY3JlZGVudGlhbHMgbm90IGNvbmZpZ3VyZWRgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrIHdoZXRoZXIgYSBkZXN0aW5hdGlvbiBoYXMgdGhlIHJlcXVpcmVkIGNyZWRlbnRpYWxzIGNvbmZpZ3VyZWQuICovXHJcbiAgaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0OiBEZXN0aW5hdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoIChkZXN0LnR5cGUpIHtcclxuICAgICAgY2FzZSBcImRldnRvXCI6ICAgIHJldHVybiAhIWRlc3QuYXBpS2V5O1xyXG4gICAgICBjYXNlIFwibWFzdG9kb25cIjogcmV0dXJuICEhKGRlc3QuaW5zdGFuY2VVcmwgJiYgZGVzdC5hY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJibHVlc2t5XCI6ICByZXR1cm4gISEoZGVzdC5oYW5kbGUgJiYgZGVzdC5hcHBQYXNzd29yZCk7XHJcbiAgICAgIGNhc2UgXCJtZWRpdW1cIjogICByZXR1cm4gISFkZXN0Lm1lZGl1bVRva2VuO1xyXG4gICAgICBjYXNlIFwicmVkZGl0XCI6ICAgcmV0dXJuICEhKGRlc3QucmVkZGl0Q2xpZW50SWQgJiYgZGVzdC5yZWRkaXRDbGllbnRTZWNyZXQgJiYgZGVzdC5yZWRkaXRSZWZyZXNoVG9rZW4pO1xyXG4gICAgICBjYXNlIFwidGhyZWFkc1wiOiAgcmV0dXJuICEhKGRlc3QudGhyZWFkc1VzZXJJZCAmJiBkZXN0LnRocmVhZHNBY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJsaW5rZWRpblwiOiByZXR1cm4gISEoZGVzdC5saW5rZWRpbkFjY2Vzc1Rva2VuICYmIGRlc3QubGlua2VkaW5QZXJzb25Vcm4pO1xyXG4gICAgICBjYXNlIFwiZWNlbmN5XCI6ICAgcmV0dXJuICEhKGRlc3QuaGl2ZVVzZXJuYW1lICYmIGRlc3QuaGl2ZVBvc3RpbmdLZXkpO1xyXG4gICAgICBkZWZhdWx0OiAgICAgICAgIHJldHVybiAhIShkZXN0LnVybCAmJiBkZXN0LmFwaUtleSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogV3JpdGUgYSBzeW5kaWNhdGlvbiBlbnRyeSBiYWNrIGludG8gdGhlIG5vdGUncyBmcm9udG1hdHRlci4gVXBkYXRlcyB0aGUgVVJMIGlmIHRoZSBkZXN0aW5hdGlvbiBhbHJlYWR5IGV4aXN0cy4gKi9cclxuICBwcml2YXRlIGFzeW5jIHdyaXRlU3luZGljYXRpb24oZmlsZTogVEZpbGUsIG5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcclxuICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZm0pID0+IHtcclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZtLnN5bmRpY2F0aW9uKSkgZm0uc3luZGljYXRpb24gPSBbXTtcclxuICAgICAgY29uc3QgZW50cmllcyA9IGZtLnN5bmRpY2F0aW9uIGFzIEFycmF5PHsgbmFtZT86IHN0cmluZzsgdXJsPzogc3RyaW5nIH0+O1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGVudHJpZXMuZmluZCgocykgPT4gcy5uYW1lID09PSBuYW1lKTtcclxuICAgICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgICAgZXhpc3RpbmcudXJsID0gdXJsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVudHJpZXMucHVzaCh7IHVybCwgbmFtZSB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dTdGF0dXNCYXJTdWNjZXNzKHNpdGVOYW1lOiBzdHJpbmcpIHtcclxuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KGBQT1NTRWQgXHUyNzEzICR7c2l0ZU5hbWV9YCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhckVsKSB0aGlzLnN0YXR1c0JhckVsLnNldFRleHQoXCJcIik7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcblxyXG4gIC8qKiBTaG93IGN1cnJlbnQgc3luZGljYXRpb24gc3RhdHVzIGZvciB0aGUgYWN0aXZlIG5vdGUuICovXHJcbiAgcHJpdmF0ZSBwb3NzZVN0YXR1cygpIHtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBtYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3Qgc3luZGljYXRpb24gPSBmaWxlQ2FjaGU/LmZyb250bWF0dGVyPy5zeW5kaWNhdGlvbjtcclxuICAgIGNvbnN0IHRpdGxlID0gZmlsZUNhY2hlPy5mcm9udG1hdHRlcj8udGl0bGUgfHwgdmlldy5maWxlLmJhc2VuYW1lO1xyXG4gICAgbmV3IFBvc3NlU3RhdHVzTW9kYWwodGhpcy5hcHAsIHRpdGxlLCBzeW5kaWNhdGlvbikub3BlbigpO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIENvbmZpcm1hdGlvbiBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIENvbmZpcm1QdWJsaXNoTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbjtcclxuICBwcml2YXRlIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBhcHA6IEFwcCxcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgb25Db25maXJtOiAoKSA9PiB2b2lkLFxyXG4gICkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XHJcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9uQ29uZmlybTtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwicG9zc2UtcHVibGlzaGVyLWNvbmZpcm0tbW9kYWxcIik7XHJcblxyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkNvbmZpcm0gUE9TU0VcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBgWW91IGFyZSBhYm91dCB0byBQT1NTRSB0byAke3RoaXMuZGVzdGluYXRpb24ubmFtZX06YCxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN1bW1hcnkgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInB1Ymxpc2gtc3VtbWFyeVwiIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUaXRsZTogJHt0aGlzLnBheWxvYWQudGl0bGV9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgU2x1ZzogJHt0aGlzLnBheWxvYWQuc2x1Z31gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBTdGF0dXM6ICR7dGhpcy5wYXlsb2FkLnN0YXR1c31gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUeXBlOiAke3RoaXMucGF5bG9hZC50eXBlfWAgfSk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhbmNlbEJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNhbmNlbFwiIH0pO1xyXG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xyXG5cclxuICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgdGV4dDogXCJQT1NTRVwiLFxyXG4gICAgICBjbHM6IFwibW9kLWN0YVwiLFxyXG4gICAgfSk7XHJcbiAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpIHtcclxuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2l0ZSBQaWNrZXIgTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBTaXRlUGlja2VyTW9kYWwgZXh0ZW5kcyBTdWdnZXN0TW9kYWw8RGVzdGluYXRpb24+IHtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uczogRGVzdGluYXRpb25bXTtcclxuICBwcml2YXRlIG9uQ2hvb3NlOiAoZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgZGVzdGluYXRpb25zOiBEZXN0aW5hdGlvbltdLCBvbkNob29zZTogKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikgPT4gdm9pZCkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMuZGVzdGluYXRpb25zID0gZGVzdGluYXRpb25zO1xyXG4gICAgdGhpcy5vbkNob29zZSA9IG9uQ2hvb3NlO1xyXG4gICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIkNob29zZSBhIGRlc3RpbmF0aW9uIHRvIFBPU1NFIHRvLi4uXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IERlc3RpbmF0aW9uW10ge1xyXG4gICAgY29uc3QgbG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25zLmZpbHRlcihcclxuICAgICAgKGQpID0+XHJcbiAgICAgICAgZC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXIpIHx8XHJcbiAgICAgICAgZC51cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlciksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyU3VnZ2VzdGlvbihkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sIGVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgZWwuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBkZXN0aW5hdGlvbi5uYW1lLCBjbHM6IFwic3VnZ2VzdGlvbi10aXRsZVwiIH0pO1xyXG4gICAgZWwuY3JlYXRlRWwoXCJzbWFsbFwiLCB7IHRleHQ6IGRlc3RpbmF0aW9uLnVybCwgY2xzOiBcInN1Z2dlc3Rpb24tbm90ZVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DaG9vc2VTdWdnZXN0aW9uKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikge1xyXG4gICAgdGhpcy5vbkNob29zZShkZXN0aW5hdGlvbik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2V0dGluZ3MgVGFiIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxuY2xhc3MgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBQb3NzZVB1Ymxpc2hlclBsdWdpbjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogUG9zc2VQdWJsaXNoZXJQbHVnaW4pIHtcclxuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gIH1cclxuXHJcbiAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiWW91ciBjYW5vbmljYWwgc2l0ZVwiKS5zZXRIZWFkaW5nKCk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQ2Fub25pY2FsIGJhc2UgVVJMXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiWW91ciBvd24gc2l0ZSdzIHJvb3QgVVJMLiBFdmVyeSBwdWJsaXNoZWQgcG9zdCB3aWxsIGluY2x1ZGUgYSBjYW5vbmljYWxVcmwgcG9pbnRpbmcgaGVyZSBcdTIwMTQgdGhlIG9yaWdpbmFsIHlvdSBvd24uXCIpXHJcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgIHRleHRcclxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8veW91cnNpdGUuY29tXCIpXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY2Fub25pY2FsQmFzZVVybClcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY2Fub25pY2FsQmFzZVVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwczovL1wiKSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHA6Ly9sb2NhbGhvc3RcIikpIHtcclxuICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiV2FybmluZzogQ2Fub25pY2FsIEJhc2UgVVJMIHNob3VsZCBzdGFydCB3aXRoIGh0dHBzOi8vXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJEZXN0aW5hdGlvbnNcIikuc2V0SGVhZGluZygpO1xyXG5cclxuICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5mb3JFYWNoKChkZXN0aW5hdGlvbiwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgZGVzdENvbnRhaW5lciA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7XHJcbiAgICAgICAgY2xzOiBcInBvc3NlLXB1Ymxpc2hlci1zaXRlXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKS5zZXROYW1lKGRlc3RpbmF0aW9uLm5hbWUgfHwgYERlc3RpbmF0aW9uICR7aW5kZXggKyAxfWApLnNldEhlYWRpbmcoKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJEZXN0aW5hdGlvbiBuYW1lXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJBIGxhYmVsIGZvciB0aGlzIGRlc3RpbmF0aW9uIChlLmcuIE15IEJsb2cpXCIpXHJcbiAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIk15IFNpdGVcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLm5hbWUpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJUeXBlXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJQbGF0Zm9ybSB0byBwdWJsaXNoIHRvXCIpXHJcbiAgICAgICAgLmFkZERyb3Bkb3duKChkZCkgPT5cclxuICAgICAgICAgIGRkXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJjdXN0b20tYXBpXCIsIFwiQ3VzdG9tIEFQSVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiZGV2dG9cIiwgXCJEZXYudG9cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcIm1hc3RvZG9uXCIsIFwiTWFzdG9kb25cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImJsdWVza3lcIiwgXCJCbHVlc2t5XCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJtZWRpdW1cIiwgXCJNZWRpdW1cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcInJlZGRpdFwiLCBcIlJlZGRpdFwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwidGhyZWFkc1wiLCBcIlRocmVhZHNcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImxpbmtlZGluXCIsIFwiTGlua2VkSW5cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImVjZW5jeVwiLCBcIkVjZW5jeSAoSGl2ZSlcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnR5cGUgfHwgXCJjdXN0b20tYXBpXCIpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnR5cGUgPSB2YWx1ZSBhcyBEZXN0aW5hdGlvblR5cGU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICBjb25zdCBkZXN0VHlwZSA9IGRlc3RpbmF0aW9uLnR5cGUgfHwgXCJjdXN0b20tYXBpXCI7XHJcblxyXG4gICAgICBpZiAoZGVzdFR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiU2l0ZSBVUkxcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBzaXRlJ3MgYmFzZSBVUkwgKG11c3Qgc3RhcnQgd2l0aCBodHRwczovLylcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi51cmwgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwOi8vbG9jYWxob3N0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBEZXN0aW5hdGlvbiBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggaHR0cHM6Ly9cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQVBJIEtleVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJQVUJMSVNIX0FQSV9LRVkgZnJvbSB5b3VyIHNpdGUncyBlbnZpcm9ubWVudFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIEFQSSBrZXlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBpS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJkZXZ0b1wiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiRGV2LnRvIEFQSSBLZXlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBodHRwczovL2Rldi50by9zZXR0aW5ncy9leHRlbnNpb25zXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgRGV2LnRvIEFQSSBrZXlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBpS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJtYXN0b2RvblwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSW5zdGFuY2UgVVJMXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgTWFzdG9kb24gaW5zdGFuY2UgKGUuZy4gaHR0cHM6Ly9tYXN0b2Rvbi5zb2NpYWwpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vbWFzdG9kb24uc29jaWFsXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmluc3RhbmNlVXJsIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5pbnN0YW5jZVVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIHlvdXIgTWFzdG9kb24gYWNjb3VudDogU2V0dGluZ3MgXHUyMTkyIERldmVsb3BtZW50IFx1MjE5MiBOZXcgQXBwbGljYXRpb25cIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiYmx1ZXNreVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQmx1ZXNreSBoYW5kbGVcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBoYW5kbGUgKGUuZy4geW91cm5hbWUuYnNreS5zb2NpYWwpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInlvdXJuYW1lLmJza3kuc29jaWFsXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhhbmRsZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaGFuZGxlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQXBwIHBhc3N3b3JkXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gaHR0cHM6Ly9ic2t5LmFwcC9zZXR0aW5ncy9hcHAtcGFzc3dvcmRzIFx1MjAxNCBOT1QgeW91ciBsb2dpbiBwYXNzd29yZFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInh4eHgteHh4eC14eHh4LXh4eHhcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBwUGFzc3dvcmQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFwcFBhc3N3b3JkID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibWVkaXVtXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJNZWRpdW0gQVBJIG5vdGljZVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJUaGUgTWVkaXVtIEFQSSB3YXMgYXJjaGl2ZWQgaW4gTWFyY2ggMjAyMy4gSXQgbWF5IHN0aWxsIHdvcmsgYnV0IGNvdWxkIGJlIGRpc2NvbnRpbnVlZCBhdCBhbnkgdGltZS5cIik7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSW50ZWdyYXRpb24gdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBtZWRpdW0uY29tIFx1MjE5MiBTZXR0aW5ncyBcdTIxOTIgU2VjdXJpdHkgYW5kIGFwcHMgXHUyMTkyIEludGVncmF0aW9uIHRva2Vuc1wiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIE1lZGl1bSBpbnRlZ3JhdGlvbiB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5tZWRpdW1Ub2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubWVkaXVtVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJyZWRkaXRcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNsaWVudCBJRFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIHJlZGRpdC5jb20vcHJlZnMvYXBwcyBcdTIwMTQgY3JlYXRlIGEgXFxcInNjcmlwdFxcXCIgdHlwZSBhcHBcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiQ2xpZW50IElEXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdENsaWVudElkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRDbGllbnRJZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNsaWVudCBzZWNyZXRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJDbGllbnQgc2VjcmV0XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdENsaWVudFNlY3JldCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0Q2xpZW50U2VjcmV0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUmVmcmVzaCB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJPQXV0aDIgcmVmcmVzaCB0b2tlbiBmb3IgeW91ciBSZWRkaXQgYWNjb3VudFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIlJlZnJlc2ggdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0UmVmcmVzaFRva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5yZWRkaXRSZWZyZXNoVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJSZWRkaXQgdXNlcm5hbWVcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwidS95b3VybmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRVc2VybmFtZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0VXNlcm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJEZWZhdWx0IHN1YnJlZGRpdFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJlLmcuIHIvd2ViZGV2IFx1MjAxNCBjYW4gYmUgb3ZlcnJpZGRlbiBwZXIgbm90ZSB3aXRoIFxcXCJzdWJyZWRkaXQ6XFxcIiBmcm9udG1hdHRlclwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJyL3N1YnJlZGRpdG5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0RGVmYXVsdFN1YnJlZGRpdCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0RGVmYXVsdFN1YnJlZGRpdCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcInRocmVhZHNcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlRocmVhZHMgdXNlciBJRFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIG51bWVyaWMgVGhyZWFkcy9JbnN0YWdyYW0gdXNlciBJRFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCIxMjM0NTY3ODlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udGhyZWFkc1VzZXJJZCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0udGhyZWFkc1VzZXJJZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJMb25nLWxpdmVkIFRocmVhZHMgYWNjZXNzIHRva2VuIHdpdGggdGhyZWFkc19jb250ZW50X3B1Ymxpc2ggcGVybWlzc2lvblwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi50aHJlYWRzQWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnRocmVhZHNBY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImxpbmtlZGluXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiT0F1dGgyIGJlYXJlciB0b2tlbiB3aXRoIHdfbWVtYmVyX3NvY2lhbCBzY29wZVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIGFjY2VzcyB0b2tlblwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5saW5rZWRpbkFjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5saW5rZWRpbkFjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUGVyc29uIFVSTlwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIExpbmtlZEluIG1lbWJlciBVUk4sIGUuZy4gdXJuOmxpOnBlcnNvbjphYmMxMjNcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwidXJuOmxpOnBlcnNvbjouLi5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubGlua2VkaW5QZXJzb25Vcm4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmxpbmtlZGluUGVyc29uVXJuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiZWNlbmN5XCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJIaXZlIHVzZXJuYW1lXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgSGl2ZS9FY2VuY3kgYWNjb3VudCBuYW1lICh3aXRob3V0IEApXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInlvdXJ1c2VybmFtZVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oaXZlVXNlcm5hbWUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVVc2VybmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlBvc3Rpbmcga2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgSGl2ZSBwcml2YXRlIHBvc3Rpbmcga2V5IChub3QgdGhlIG93bmVyIG9yIGFjdGl2ZSBrZXkpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiNUsuLi5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGl2ZVBvc3RpbmdLZXkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVQb3N0aW5nS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQ29tbXVuaXR5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkhpdmUgY29tbXVuaXR5IHRhZyB0byBwb3N0IGluIChlLmcuIGhpdmUtMTc0MzAxIGZvciBPQ0QpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImhpdmUtMTc0MzAxXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhpdmVDb21tdW5pdHkgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhpdmVDb21tdW5pdHkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgICBidG4uc2V0QnV0dG9uVGV4dChcIlRlc3QgY29ubmVjdGlvblwiKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsdWdpbi5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJDb25maWd1cmUgY3JlZGVudGlhbHMgZmlyc3RcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkZXN0VHlwZSA9PT0gXCJjdXN0b20tYXBpXCIpIHtcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYXBpL3B1Ymxpc2hgO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiT1BUSU9OU1wiLFxyXG4gICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwieC1wdWJsaXNoLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXkgfSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgNDAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcxMyBDb25uZWN0aW9uIHRvICR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9IHN1Y2Nlc3NmdWxgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcxNyAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfSByZXNwb25kZWQgd2l0aCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoYFx1MjcxNyBDb3VsZCBub3QgcmVhY2ggJHtkZXN0aW5hdGlvbi5uYW1lIHx8IGRlc3RpbmF0aW9uLnVybH1gKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgQ3JlZGVudGlhbHMgbG9vayBjb25maWd1cmVkIGZvciAke2Rlc3RpbmF0aW9uLm5hbWV9LiBQdWJsaXNoIHRvIHRlc3QuYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgIClcclxuICAgICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgICBidG5cclxuICAgICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJSZW1vdmUgZGVzdGluYXRpb25cIilcclxuICAgICAgICAgICAgLnNldFdhcm5pbmcoKVxyXG4gICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29uZmlybUVsID0gZGVzdENvbnRhaW5lci5jcmVhdGVEaXYoe1xyXG4gICAgICAgICAgICAgICAgY2xzOiBcInNldHRpbmctaXRlbVwiLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbmZpcm1FbC5jcmVhdGVFbChcInNwYW5cIiwge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogYFJlbW92ZSBcIiR7ZGVzdGluYXRpb24ubmFtZSB8fCBcInRoaXMgZGVzdGluYXRpb25cIn1cIj8gYCxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25zdCB5ZXNCdG4gPSBjb25maXJtRWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogXCJZZXMsIHJlbW92ZVwiLFxyXG4gICAgICAgICAgICAgICAgY2xzOiBcIm1vZC13YXJuaW5nXCIsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3Qgbm9CdG4gPSBjb25maXJtRWwuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNhbmNlbFwiIH0pO1xyXG4gICAgICAgICAgICAgIHllc0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG5vQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBjb25maXJtRWwucmVtb3ZlKCkpO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICBidG5cclxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiQWRkIGRlc3RpbmF0aW9uXCIpXHJcbiAgICAgICAgICAuc2V0Q3RhKClcclxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwiXCIsXHJcbiAgICAgICAgICAgICAgdHlwZTogXCJjdXN0b20tYXBpXCIsXHJcbiAgICAgICAgICAgICAgdXJsOiBcIlwiLFxyXG4gICAgICAgICAgICAgIGFwaUtleTogXCJcIixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiRGVmYXVsdHNcIikuc2V0SGVhZGluZygpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkRlZmF1bHQgc3RhdHVzXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiRGVmYXVsdCBwdWJsaXNoIHN0YXR1cyB3aGVuIG5vdCBzcGVjaWZpZWQgaW4gZnJvbnRtYXR0ZXJcIilcclxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cclxuICAgICAgICBkcm9wZG93blxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcImRyYWZ0XCIsIFwiRHJhZnRcIilcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJwdWJsaXNoZWRcIiwgXCJQdWJsaXNoZWRcIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzID0gdmFsdWUgYXNcclxuICAgICAgICAgICAgICB8IFwiZHJhZnRcIlxyXG4gICAgICAgICAgICAgIHwgXCJwdWJsaXNoZWRcIjtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDb25maXJtIGJlZm9yZSBwdWJsaXNoaW5nXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiU2hvdyBhIGNvbmZpcm1hdGlvbiBtb2RhbCB3aXRoIHBvc3QgZGV0YWlscyBiZWZvcmUgcHVibGlzaGluZ1wiKVxyXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2gpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiU3RyaXAgT2JzaWRpYW4gc3ludGF4XCIpXHJcbiAgICAgIC5zZXREZXNjKFxyXG4gICAgICAgIFwiQ29udmVydCB3aWtpLWxpbmtzLCByZW1vdmUgZW1iZWRzLCBjb21tZW50cywgYW5kIGRhdGF2aWV3IGJsb2NrcyBiZWZvcmUgcHVibGlzaGluZ1wiLFxyXG4gICAgICApXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4KVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgLyogXHUyNTAwXHUyNTAwIFN1cHBvcnQgc2VjdGlvbiBcdTI1MDBcdTI1MDAgKi9cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiU3VwcG9ydCBQT1NTRSBQdWJsaXNoZXJcIikuc2V0SGVhZGluZygpO1xyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJwXCIsIHtcclxuICAgICAgdGV4dDogXCJQT1NTRSBQdWJsaXNoZXIgaXMgZnJlZSBhbmQgb3BlbiBzb3VyY2UuIElmIGl0IHNhdmVzIHlvdSB0aW1lLCBjb25zaWRlciBzdXBwb3J0aW5nIGl0cyBkZXZlbG9wbWVudC5cIixcclxuICAgICAgY2xzOiBcInNldHRpbmctaXRlbS1kZXNjcmlwdGlvblwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQnV5IE1lIGEgQ29mZmVlXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiT25lLXRpbWUgb3IgcmVjdXJyaW5nIHN1cHBvcnRcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiXFx1MjYxNSBTdXBwb3J0XCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2J1eW1lYWNvZmZlZS5jb20vdGhlb2ZmaWNhbGRtXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkdpdEh1YiBTcG9uc29yc1wiKVxyXG4gICAgICAuc2V0RGVzYyhcIk1vbnRobHkgc3BvbnNvcnNoaXAgdGhyb3VnaCBHaXRIdWJcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiXFx1Mjc2NCBTcG9uc29yXCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2dpdGh1Yi5jb20vc3BvbnNvcnMvVGhlT2ZmaWNpYWxETVwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJBbGwgZnVuZGluZyBvcHRpb25zXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiZGV2aW5tYXJzaGFsbC5pbmZvL2Z1bmRcIilcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiXFx1RDgzRFxcdUREMTcgRnVuZFwiKS5vbkNsaWNrKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cHM6Ly9kZXZpbm1hcnNoYWxsLmluZm8vZnVuZFwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qIFx1MjUwMFx1MjUwMFx1MjUwMCBQT1NTRSBTdGF0dXMgTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG50eXBlIFN5bmRpY2F0aW9uRW50cnkgPSB7IHVybD86IHN0cmluZzsgbmFtZT86IHN0cmluZyB9O1xyXG5cclxuY2xhc3MgUG9zc2VTdGF0dXNNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuICBwcml2YXRlIHRpdGxlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBzeW5kaWNhdGlvbjogU3luZGljYXRpb25FbnRyeVtdIHwgdW5rbm93bjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHRpdGxlOiBzdHJpbmcsIHN5bmRpY2F0aW9uOiB1bmtub3duKSB7XHJcbiAgICBzdXBlcihhcHApO1xyXG4gICAgdGhpcy50aXRsZSA9IHRpdGxlO1xyXG4gICAgdGhpcy5zeW5kaWNhdGlvbiA9IHN5bmRpY2F0aW9uO1xyXG4gIH1cclxuXHJcbiAgb25PcGVuKCkge1xyXG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XHJcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoXCJwb3NzZS1wdWJsaXNoZXItY29uZmlybS1tb2RhbFwiKTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJQT1NTRSBTdGF0dXNcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBgTm90ZTogJHt0aGlzLnRpdGxlfWAgfSk7XHJcblxyXG4gICAgY29uc3QgZW50cmllcyA9IEFycmF5LmlzQXJyYXkodGhpcy5zeW5kaWNhdGlvbilcclxuICAgICAgPyAodGhpcy5zeW5kaWNhdGlvbiBhcyBTeW5kaWNhdGlvbkVudHJ5W10pXHJcbiAgICAgIDogW107XHJcblxyXG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICAgIHRleHQ6IFwiVGhpcyBub3RlIGhhcyBub3QgYmVlbiBQT1NTRWQgdG8gYW55IGRlc3RpbmF0aW9uIHlldC5cIixcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJzdHJvbmdcIiwgeyB0ZXh0OiBgU3luZGljYXRlZCB0byAke2VudHJpZXMubGVuZ3RofSBkZXN0aW5hdGlvbihzKTpgIH0pO1xyXG4gICAgICBjb25zdCBsaXN0ID0gY29udGVudEVsLmNyZWF0ZUVsKFwidWxcIik7XHJcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgICAgIGNvbnN0IGxpID0gbGlzdC5jcmVhdGVFbChcImxpXCIpO1xyXG4gICAgICAgIGlmIChlbnRyeS51cmwpIHtcclxuICAgICAgICAgIGNvbnN0IGEgPSBsaS5jcmVhdGVFbChcImFcIiwgeyB0ZXh0OiBlbnRyeS5uYW1lIHx8IGVudHJ5LnVybCB9KTtcclxuICAgICAgICAgIGEuaHJlZiA9IGVudHJ5LnVybDtcclxuICAgICAgICAgIGEudGFyZ2V0ID0gXCJfYmxhbmtcIjtcclxuICAgICAgICAgIGEucmVsID0gXCJub29wZW5lclwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsaS5zZXRUZXh0KGVudHJ5Lm5hbWUgfHwgXCJVbmtub3duXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnMgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm1vZGFsLWJ1dHRvbi1jb250YWluZXJcIiB9KTtcclxuICAgIGNvbnN0IGNsb3NlQnRuID0gYnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiQ2xvc2VcIiB9KTtcclxuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpIHtcclxuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBV087QUE2Q1AsSUFBTSxtQkFBMkM7QUFBQSxFQUMvQyxjQUFjLENBQUM7QUFBQSxFQUNmLGtCQUFrQjtBQUFBLEVBQ2xCLGVBQWU7QUFBQSxFQUNmLHNCQUFzQjtBQUFBLEVBQ3RCLHFCQUFxQjtBQUN2QjtBQW9CQSxTQUFTLFlBQVksU0FBeUI7QUFDNUMsUUFBTSxRQUFRLFFBQVEsTUFBTSwyQ0FBMkM7QUFDdkUsU0FBTyxRQUFRLE1BQU0sQ0FBQyxFQUFFLEtBQUssSUFBSTtBQUNuQztBQU1BLFNBQVMsaUJBQWlCLE9BQXlEO0FBQ2pGLE1BQUksQ0FBQyxNQUFPLFFBQU8sQ0FBQztBQUNwQixR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QUNuRCxlQUFPLEtBQUssbUNBQW1DLFFBQVE7QUFBQSxNQUN6RCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0o7QUFDRjtBQU1BLElBQU0sbUJBQU4sY0FBK0Isc0JBQU07QUFBQSxFQUluQyxZQUFZLEtBQVUsT0FBZSxhQUFzQjtBQUN6RCxVQUFNLEdBQUc7QUFDVCxTQUFLLFFBQVE7QUFDYixTQUFLLGNBQWM7QUFBQSxFQUNyQjtBQUFBLEVBRUEsU0FBUztBQUNQLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxTQUFTLCtCQUErQjtBQUNsRCxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELGNBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSxTQUFTLEtBQUssS0FBSyxHQUFHLENBQUM7QUFFdkQsVUFBTSxVQUFVLE1BQU0sUUFBUSxLQUFLLFdBQVcsSUFDekMsS0FBSyxjQUNOLENBQUM7QUFFTCxRQUFJLFFBQVEsV0FBVyxHQUFHO0FBQ3hCLGdCQUFVLFNBQVMsS0FBSztBQUFBLFFBQ3RCLE1BQU07QUFBQSxNQUNSLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxnQkFBVSxTQUFTLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDeEYsWUFBTSxPQUFPLFVBQVUsU0FBUyxJQUFJO0FBQ3BDLGlCQUFXLFNBQVMsU0FBUztBQUMzQixjQUFNLEtBQUssS0FBSyxTQUFTLElBQUk7QUFDN0IsWUFBSSxNQUFNLEtBQUs7QUFDYixnQkFBTSxJQUFJLEdBQUcsU0FBUyxLQUFLLEVBQUUsTUFBTSxNQUFNLFFBQVEsTUFBTSxJQUFJLENBQUM7QUFDNUQsWUFBRSxPQUFPLE1BQU07QUFDZixZQUFFLFNBQVM7QUFDWCxZQUFFLE1BQU07QUFBQSxRQUNWLE9BQU87QUFDTCxhQUFHLFFBQVEsTUFBTSxRQUFRLFNBQVM7QUFBQSxRQUNwQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDckUsVUFBTSxXQUFXLFFBQVEsU0FBUyxVQUFVLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDN0QsYUFBUyxpQkFBaUIsU0FBUyxNQUFNLEtBQUssTUFBTSxDQUFDO0FBQUEsRUFDdkQ7QUFBQSxFQUVBLFVBQVU7QUFDUixTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQ3ZCO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
