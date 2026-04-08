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
    containerEl.createEl("h2", { text: "Your Canonical Site" });
    new import_obsidian.Setting(containerEl).setName("Canonical Base URL").setDesc("Your own site's root URL. Every published post will include a canonicalUrl pointing here \u2014 the original you own.").addText(
      (text) => text.setPlaceholder("https://yoursite.com").setValue(this.plugin.settings.canonicalBaseUrl).onChange(async (value) => {
        this.plugin.settings.canonicalBaseUrl = value;
        if (value && !value.startsWith("https://") && !value.startsWith("http://localhost")) {
          new import_obsidian.Notice("Warning: Canonical Base URL should start with https://");
        }
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h2", { text: "Destinations" });
    this.plugin.settings.destinations.forEach((destination, index) => {
      const destContainer = containerEl.createDiv({
        cls: "posse-publisher-site"
      });
      destContainer.createEl("h3", {
        text: destination.name || `Destination ${index + 1}`
      });
      new import_obsidian.Setting(destContainer).setName("Destination Name").setDesc("A label for this destination (e.g. My Blog)").addText(
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
        new import_obsidian.Setting(destContainer).setName("Access Token").setDesc("From your Mastodon account: Settings \u2192 Development \u2192 New Application").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.accessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].accessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "bluesky") {
        new import_obsidian.Setting(destContainer).setName("Bluesky Handle").setDesc("Your handle (e.g. yourname.bsky.social)").addText(
          (text) => text.setPlaceholder("yourname.bsky.social").setValue(destination.handle || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].handle = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("App Password").setDesc("From https://bsky.app/settings/app-passwords \u2014 NOT your login password").addText((text) => {
          text.setPlaceholder("xxxx-xxxx-xxxx-xxxx").setValue(destination.appPassword || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].appPassword = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "medium") {
        destContainer.createEl("p", {
          text: "Note: The Medium API was archived in March 2023. It may still work but could be discontinued at any time.",
          cls: "setting-item-description mod-warning"
        });
        new import_obsidian.Setting(destContainer).setName("Integration Token").setDesc("From medium.com \u2192 Settings \u2192 Security and apps \u2192 Integration tokens").addText((text) => {
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
        new import_obsidian.Setting(destContainer).setName("Client Secret").addText((text) => {
          text.setPlaceholder("Client secret").setValue(destination.redditClientSecret || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditClientSecret = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Refresh Token").setDesc("OAuth2 refresh token for your Reddit account").addText((text) => {
          text.setPlaceholder("Refresh token").setValue(destination.redditRefreshToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditRefreshToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
        new import_obsidian.Setting(destContainer).setName("Reddit Username").addText(
          (text) => text.setPlaceholder("u/yourname").setValue(destination.redditUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Default Subreddit").setDesc('e.g. r/webdev \u2014 can be overridden per note with "subreddit:" frontmatter').addText(
          (text) => text.setPlaceholder("r/subredditname").setValue(destination.redditDefaultSubreddit || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].redditDefaultSubreddit = value;
            await this.plugin.saveSettings();
          })
        );
      } else if (destType === "threads") {
        new import_obsidian.Setting(destContainer).setName("Threads User ID").setDesc("Your numeric Threads/Instagram user ID").addText(
          (text) => text.setPlaceholder("123456789").setValue(destination.threadsUserId || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].threadsUserId = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Access Token").setDesc("Long-lived Threads access token with threads_content_publish permission").addText((text) => {
          text.setPlaceholder("Enter access token").setValue(destination.threadsAccessToken || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].threadsAccessToken = value;
            await this.plugin.saveSettings();
          });
          text.inputEl.type = "password";
          text.inputEl.autocomplete = "off";
        });
      } else if (destType === "linkedin") {
        new import_obsidian.Setting(destContainer).setName("Access Token").setDesc("OAuth2 bearer token with w_member_social scope").addText((text) => {
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
        new import_obsidian.Setting(destContainer).setName("Hive Username").setDesc("Your Hive/Ecency account name (without @)").addText(
          (text) => text.setPlaceholder("yourusername").setValue(destination.hiveUsername || "").onChange(async (value) => {
            this.plugin.settings.destinations[index].hiveUsername = value;
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(destContainer).setName("Posting Key").setDesc("Your Hive private posting key (not the owner or active key)").addText((text) => {
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
        (btn) => btn.setButtonText("Test Connection").onClick(async () => {
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
        (btn) => btn.setButtonText("Remove Destination").setWarning().onClick(async () => {
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
      (btn) => btn.setButtonText("Add Destination").setCta().onClick(async () => {
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
    containerEl.createEl("h2", { text: "Defaults" });
    new import_obsidian.Setting(containerEl).setName("Default Status").setDesc("Default publish status when not specified in frontmatter").addDropdown(
      (dropdown) => dropdown.addOption("draft", "Draft").addOption("published", "Published").setValue(this.plugin.settings.defaultStatus).onChange(async (value) => {
        this.plugin.settings.defaultStatus = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Confirm Before Publishing").setDesc("Show a confirmation modal with post details before publishing").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.confirmBeforePublish).onChange(async (value) => {
        this.plugin.settings.confirmBeforePublish = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Strip Obsidian Syntax").setDesc(
      "Convert wiki-links, remove embeds, comments, and dataview blocks before publishing"
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.stripObsidianSyntax).onChange(async (value) => {
        this.plugin.settings.stripObsidianSyntax = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h2", { text: "Support POSSE Publisher" });
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
    new import_obsidian.Setting(containerEl).setName("All Funding Options").setDesc("devinmarshall.info/fund").addButton(
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiIHwgXCJtZWRpdW1cIiB8IFwicmVkZGl0XCIgfCBcInRocmVhZHNcIiB8IFwibGlua2VkaW5cIiB8IFwiZWNlbmN5XCI7XHJcblxyXG5pbnRlcmZhY2UgRGVzdGluYXRpb24ge1xyXG4gIG5hbWU6IHN0cmluZztcclxuICB0eXBlOiBEZXN0aW5hdGlvblR5cGU7XHJcbiAgLy8gY3VzdG9tLWFwaVxyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG4gIC8vIG1hc3RvZG9uXHJcbiAgaW5zdGFuY2VVcmw/OiBzdHJpbmc7XHJcbiAgYWNjZXNzVG9rZW4/OiBzdHJpbmc7XHJcbiAgLy8gYmx1ZXNreVxyXG4gIGhhbmRsZT86IHN0cmluZztcclxuICBhcHBQYXNzd29yZD86IHN0cmluZztcclxuICAvLyBtZWRpdW1cclxuICBtZWRpdW1Ub2tlbj86IHN0cmluZztcclxuICBtZWRpdW1BdXRob3JJZD86IHN0cmluZztcclxuICAvLyByZWRkaXRcclxuICByZWRkaXRDbGllbnRJZD86IHN0cmluZztcclxuICByZWRkaXRDbGllbnRTZWNyZXQ/OiBzdHJpbmc7XHJcbiAgcmVkZGl0UmVmcmVzaFRva2VuPzogc3RyaW5nO1xyXG4gIHJlZGRpdFVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHJlZGRpdERlZmF1bHRTdWJyZWRkaXQ/OiBzdHJpbmc7XHJcbiAgLy8gdGhyZWFkc1xyXG4gIHRocmVhZHNVc2VySWQ/OiBzdHJpbmc7XHJcbiAgdGhyZWFkc0FjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGxpbmtlZGluXHJcbiAgbGlua2VkaW5BY2Nlc3NUb2tlbj86IHN0cmluZztcclxuICBsaW5rZWRpblBlcnNvblVybj86IHN0cmluZztcclxuICAvLyBlY2VuY3kgLyBoaXZlXHJcbiAgaGl2ZVVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIGhpdmVQb3N0aW5nS2V5Pzogc3RyaW5nO1xyXG4gIGhpdmVDb21tdW5pdHk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IHtcclxuICBkZXN0aW5hdGlvbnM6IFtdLFxyXG4gIGNhbm9uaWNhbEJhc2VVcmw6IFwiXCIsXHJcbiAgZGVmYXVsdFN0YXR1czogXCJkcmFmdFwiLFxyXG4gIGNvbmZpcm1CZWZvcmVQdWJsaXNoOiB0cnVlLFxyXG4gIHN0cmlwT2JzaWRpYW5TeW50YXg6IHRydWUsXHJcbn07XHJcblxyXG5pbnRlcmZhY2UgRnJvbnRtYXR0ZXIge1xyXG4gIHRpdGxlPzogc3RyaW5nO1xyXG4gIHNsdWc/OiBzdHJpbmc7XHJcbiAgZXhjZXJwdD86IHN0cmluZztcclxuICB0eXBlPzogc3RyaW5nO1xyXG4gIHN0YXR1cz86IHN0cmluZztcclxuICB0YWdzPzogc3RyaW5nW107XHJcbiAgcGlsbGFyPzogc3RyaW5nO1xyXG4gIGNvdmVySW1hZ2U/OiBzdHJpbmc7XHJcbiAgZmVhdHVyZWQ/OiBib29sZWFuO1xyXG4gIG1ldGFUaXRsZT86IHN0cmluZztcclxuICBtZXRhRGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbiAgb2dJbWFnZT86IHN0cmluZztcclxuICB2aWRlb1VybD86IHN0cmluZztcclxuICBjYW5vbmljYWxVcmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBFeHRyYWN0IGJvZHkgY29udGVudCBiZWxvdyB0aGUgWUFNTCBmcm9udG1hdHRlciBmZW5jZS4gKi9cclxuZnVuY3Rpb24gZXh0cmFjdEJvZHkoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXHI/XFxuW1xcc1xcU10qP1xccj9cXG4tLS1cXHI/XFxuPyhbXFxzXFxTXSopJC8pO1xyXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRyaW0oKSA6IGNvbnRlbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBhIEZyb250bWF0dGVyIG9iamVjdCBmcm9tIE9ic2lkaWFuJ3MgY2FjaGVkIG1ldGFkYXRhLlxyXG4gKiBGYWxscyBiYWNrIGdyYWNlZnVsbHkgd2hlbiBmaWVsZHMgYXJlIGFic2VudC5cclxuICovXHJcbmZ1bmN0aW9uIGJ1aWxkRnJvbnRtYXR0ZXIoY2FjaGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKTogRnJvbnRtYXR0ZXIge1xyXG4gIGlmICghY2FjaGUpIHJldHVybiB7fTtcclxuICBjb25zdCBmbTogRnJvbnRtYXR0ZXIgPSB7fTtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50aXRsZSA9PT0gXCJzdHJpbmdcIikgZm0udGl0bGUgPSBjYWNoZS50aXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnNsdWcgPT09IFwic3RyaW5nXCIpIGZtLnNsdWcgPSBjYWNoZS5zbHVnO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuZXhjZXJwdCA9PT0gXCJzdHJpbmdcIikgZm0uZXhjZXJwdCA9IGNhY2hlLmV4Y2VycHQ7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50eXBlID09PSBcInN0cmluZ1wiKSBmbS50eXBlID0gY2FjaGUudHlwZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnN0YXR1cyA9PT0gXCJzdHJpbmdcIikgZm0uc3RhdHVzID0gY2FjaGUuc3RhdHVzO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUucGlsbGFyID09PSBcInN0cmluZ1wiKSBmbS5waWxsYXIgPSBjYWNoZS5waWxsYXI7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jb3ZlckltYWdlID09PSBcInN0cmluZ1wiKSBmbS5jb3ZlckltYWdlID0gY2FjaGUuY292ZXJJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFUaXRsZSA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YVRpdGxlID0gY2FjaGUubWV0YVRpdGxlO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUubWV0YURlc2NyaXB0aW9uID09PSBcInN0cmluZ1wiKSBmbS5tZXRhRGVzY3JpcHRpb24gPSBjYWNoZS5tZXRhRGVzY3JpcHRpb247XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5vZ0ltYWdlID09PSBcInN0cmluZ1wiKSBmbS5vZ0ltYWdlID0gY2FjaGUub2dJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnZpZGVvVXJsID09PSBcInN0cmluZ1wiKSBmbS52aWRlb1VybCA9IGNhY2hlLnZpZGVvVXJsO1xyXG5cclxuICBpZiAodHlwZW9mIGNhY2hlLmZlYXR1cmVkID09PSBcImJvb2xlYW5cIikgZm0uZmVhdHVyZWQgPSBjYWNoZS5mZWF0dXJlZDtcclxuICBlbHNlIGlmIChjYWNoZS5mZWF0dXJlZCA9PT0gXCJ0cnVlXCIpIGZtLmZlYXR1cmVkID0gdHJ1ZTtcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2FjaGUudGFncykpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzLm1hcCgodDogdW5rbm93bikgPT4gU3RyaW5nKHQpLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGNhY2hlLnRhZ3MgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzXHJcbiAgICAgIC5yZXBsYWNlKC9eXFxbfFxcXSQvZywgXCJcIilcclxuICAgICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgICAubWFwKCh0OiBzdHJpbmcpID0+IHQudHJpbSgpKVxyXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jYW5vbmljYWxVcmwgPT09IFwic3RyaW5nXCIpIGZtLmNhbm9uaWNhbFVybCA9IGNhY2hlLmNhbm9uaWNhbFVybDtcclxuXHJcbiAgcmV0dXJuIGZtO1xyXG59XHJcblxyXG4vKiogQ29udmVydCBhIHRpdGxlIHN0cmluZyB0byBhIFVSTC1zYWZlIHNsdWcsIGhhbmRsaW5nIGRpYWNyaXRpY3MuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1NsdWcodGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHRpdGxlXHJcbiAgICAubm9ybWFsaXplKFwiTkZEXCIpXHJcbiAgICAucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCBcIi1cIilcclxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCBcIlwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFByZS1wcm9jZXNzIE9ic2lkaWFuLXNwZWNpZmljIG1hcmtkb3duIGJlZm9yZSBzZW5kaW5nIHRvIHRoZSBibG9nIEFQSS5cclxuICogU3RyaXBzIHdpa2ktbGlua3MsIGVtYmVkcywgY29tbWVudHMsIGFuZCBkYXRhdmlldyBibG9ja3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2Vzc0NvbnRlbnQoYm9keTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAvLyBSZW1vdmUgT2JzaWRpYW4gY29tbWVudHM6ICUlLi4uJSVcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8lJVtcXHNcXFNdKj8lJS9nLCBcIlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmsgZW1iZWRzOiAhW1tmaWxlXV0gXHUyMTkyIChyZW1vdmVkKVxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoLyFcXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRoIGFsaWFzOiBbW3RhcmdldHxhbGlhc11dIFx1MjE5MiBhbGlhc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXXxdKylcXHwoW15cXF1dKylcXF1cXF0vZywgXCIkMlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmtzIHdpdGhvdXQgYWxpYXM6IFtbdGFyZ2V0XV0gXHUyMTkyIHRhcmdldFxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXV0rKVxcXVxcXS9nLCBcIiQxXCIpO1xyXG5cclxuICAvLyBSZW1vdmUgZGF0YXZpZXcgY29kZSBibG9ja3NcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9gYGBkYXRhdmlld1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdqc1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcblxyXG4gIC8vIENsZWFuIHVwIGV4Y2VzcyBibGFuayBsaW5lcyBsZWZ0IGJ5IHJlbW92YWxzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGJvZHkudHJpbSgpO1xyXG59XHJcblxyXG4vKiogRXNjYXBlIEhUTUwgc3BlY2lhbCBjaGFyYWN0ZXJzLiAqL1xyXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gc3RyXHJcbiAgICAucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpXHJcbiAgICAucmVwbGFjZSgvPC9nLCBcIiZsdDtcIilcclxuICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBiYXNpYyBNYXJrZG93biB0byBIVE1MLiBIYW5kbGVzIGhlYWRpbmdzLCBib2xkLCBpdGFsaWMsIGlubGluZSBjb2RlLFxyXG4gKiBsaW5rcywgaW1hZ2VzLCBsaXN0cywgYmxvY2txdW90ZXMsIGhvcml6b250YWwgcnVsZXMsIGZlbmNlZCBjb2RlIGJsb2NrcywgYW5kIHBhcmFncmFwaHMuXHJcbiAqIE5vIGV4dGVybmFsIGRlcGVuZGVuY2llcyBcdTIwMTQgcmVnZXggb25seS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93blRvSHRtbChtYXJrZG93bjogc3RyaW5nKTogc3RyaW5nIHtcclxuICBsZXQgaHRtbCA9IG1hcmtkb3duO1xyXG5cclxuICAvLyBGZW5jZWQgY29kZSBibG9ja3MgKHByb2Nlc3MgZmlyc3QgdG8gYXZvaWQgbWFuZ2xpbmcgdGhlaXIgY29udGVudHMpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvYGBgKFxcdyopXFxuKFtcXHNcXFNdKj8pYGBgL2csIChfLCBsYW5nLCBjb2RlKSA9PlxyXG4gICAgYDxwcmU+PGNvZGUke2xhbmcgPyBgIGNsYXNzPVwibGFuZ3VhZ2UtJHtsYW5nfVwiYCA6IFwiXCJ9PiR7ZXNjYXBlSHRtbChjb2RlLnRyaW0oKSl9PC9jb2RlPjwvcHJlPmBcclxuICApO1xyXG5cclxuICAvLyBIZWFkaW5nc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjIyMgKC4rKSQvZ20sIFwiPGg2PiQxPC9oNj5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXiMjIyMjICguKykkL2dtLCBcIjxoNT4kMTwvaDU+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMjICguKykkL2dtLCBcIjxoND4kMTwvaDQ+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jIyMgKC4rKSQvZ20sIFwiPGgzPiQxPC9oMz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXiMjICguKykkL2dtLCBcIjxoMj4kMTwvaDI+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL14jICguKykkL2dtLCBcIjxoMT4kMTwvaDE+XCIpO1xyXG5cclxuICAvLyBIb3Jpem9udGFsIHJ1bGVzXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXlstKl9dezMsfVxccyokL2dtLCBcIjxocj5cIik7XHJcblxyXG4gIC8vIEJsb2NrcXVvdGVzXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXj4gKC4rKSQvZ20sIFwiPGJsb2NrcXVvdGU+JDE8L2Jsb2NrcXVvdGU+XCIpO1xyXG5cclxuICAvLyBCb2xkICsgaXRhbGljIChvcmRlcjogdHJpcGxlIFx1MjE5MiBkb3VibGUgXHUyMTkyIHNpbmdsZSlcclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9cXCpcXCpcXCooLis/KVxcKlxcKlxcKi9nLCBcIjxzdHJvbmc+PGVtPiQxPC9lbT48L3N0cm9uZz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXFwqXFwqKC4rPylcXCpcXCovZywgXCI8c3Ryb25nPiQxPC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcKiguKz8pXFwqL2csIFwiPGVtPiQxPC9lbT5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvX19fKC4rPylfX18vZywgXCI8c3Ryb25nPjxlbT4kMTwvZW0+PC9zdHJvbmc+XCIpO1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL19fKC4rPylfXy9nLCBcIjxzdHJvbmc+JDE8L3N0cm9uZz5cIik7XHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXyguKz8pXy9nLCBcIjxlbT4kMTwvZW0+XCIpO1xyXG5cclxuICAvLyBJbmxpbmUgY29kZVxyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL2AoW15gXSspYC9nLCBcIjxjb2RlPiQxPC9jb2RlPlwiKTtcclxuXHJcbiAgLy8gSW1hZ2VzIChiZWZvcmUgbGlua3MpXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvIVxcWyhbXlxcXV0qKVxcXVxcKChbXildKylcXCkvZywgJzxpbWcgc3JjPVwiJDJcIiBhbHQ9XCIkMVwiPicpO1xyXG5cclxuICAvLyBMaW5rc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKChbXildKylcXCkvZywgJzxhIGhyZWY9XCIkMlwiPiQxPC9hPicpO1xyXG5cclxuICAvLyBVbm9yZGVyZWQgbGlzdCBpdGVtc1xyXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15bLSorXSAoLispJC9nbSwgXCI8bGk+JDE8L2xpPlwiKTtcclxuXHJcbiAgLy8gT3JkZXJlZCBsaXN0IGl0ZW1zXHJcbiAgaHRtbCA9IGh0bWwucmVwbGFjZSgvXlxcZCtcXC4gKC4rKSQvZ20sIFwiPGxpPiQxPC9saT5cIik7XHJcblxyXG4gIC8vIFdyYXAgPGxpPiBydW5zIGluIDx1bD5cclxuICBodG1sID0gaHRtbC5yZXBsYWNlKC8oPGxpPltcXHNcXFNdKj88XFwvbGk+XFxuPykrL2csIChtYXRjaCkgPT4gYDx1bD4ke21hdGNofTwvdWw+YCk7XHJcblxyXG4gIC8vIFBhcmFncmFwaHMgKGRvdWJsZSBuZXdsaW5lIFx1MjE5MiBwYXJhZ3JhcGggYmxvY2spXHJcbiAgaHRtbCA9IGh0bWxcclxuICAgIC5zcGxpdCgvXFxuXFxuKy8pXHJcbiAgICAubWFwKChibG9jaykgPT4ge1xyXG4gICAgICBjb25zdCB0cmltbWVkID0gYmxvY2sudHJpbSgpO1xyXG4gICAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBcIlwiO1xyXG4gICAgICBpZiAoL148KGhbMS02XXx1bHxvbHxsaXxibG9ja3F1b3RlfHByZXxocikvLnRlc3QodHJpbW1lZCkpIHJldHVybiB0cmltbWVkO1xyXG4gICAgICByZXR1cm4gYDxwPiR7dHJpbW1lZC5yZXBsYWNlKC9cXG4vZywgXCI8YnI+XCIpfTwvcD5gO1xyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgIC5qb2luKFwiXFxuXCIpO1xyXG5cclxuICByZXR1cm4gaHRtbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmlwIGFsbCBNYXJrZG93biBzeW50YXggdG8gcHJvZHVjZSBwbGFpbiB0ZXh0IHN1aXRhYmxlIGZvclxyXG4gKiBjaGFyYWN0ZXItbGltaXRlZCBwbGF0Zm9ybXMgKFRocmVhZHMsIE1hc3RvZG9uIHByZXZpZXcsIGV0Yy4pLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duVG9QbGFpblRleHQobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgbGV0IHRleHQgPSBtYXJrZG93bjtcclxuICAvLyBGZW5jZWQgY29kZSBibG9ja3MgXHUyMTkyIGtlZXAgY29udGVudFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2BgYFxcdypcXG4oW1xcc1xcU10qPylgYGAvZywgXCIkMVwiKTtcclxuICAvLyBSZW1vdmUgaGVhZGluZyBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXiN7MSw2fSAvZ20sIFwiXCIpO1xyXG4gIC8vIEJvbGQvaXRhbGljIG1hcmtlcnNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXCp7MSwzfXxfezEsM30vZywgXCJcIik7XHJcbiAgLy8gSW5saW5lIGNvZGUgXHUyMTkyIHVud3JhcFxyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL2AoW15gXSspYC9nLCBcIiQxXCIpO1xyXG4gIC8vIEltYWdlcyBcdTIxOTIgYWx0IHRleHRcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8hXFxbKFteXFxdXSopXFxdXFwoW14pXStcXCkvZywgXCIkMVwiKTtcclxuICAvLyBMaW5rcyBcdTIxOTIgbGluayB0ZXh0XHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxbKFteXFxdXSspXFxdXFwoW14pXStcXCkvZywgXCIkMVwiKTtcclxuICAvLyBCbG9ja3F1b3Rlc1xyXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14+IC9nbSwgXCJcIik7XHJcbiAgLy8gTGlzdCBtYXJrZXJzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlstKitcXGQuXSAvZ20sIFwiXCIpO1xyXG4gIC8vIEhvcml6b250YWwgcnVsZXNcclxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eWy0qX117Myx9XFxzKiQvZ20sIFwiXCIpO1xyXG4gIC8vIENvbGxhcHNlIG11bHRpcGxlIGJsYW5rIGxpbmVzXHJcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuICByZXR1cm4gdGV4dC50cmltKCk7XHJcbn1cclxuXHJcbmNvbnN0IEZST05UTUFUVEVSX1RFTVBMQVRFID0gYC0tLVxyXG50aXRsZTogXHJcbnNsdWc6IFxyXG5leGNlcnB0OiBcclxudHlwZTogYmxvZ1xyXG5zdGF0dXM6IGRyYWZ0XHJcbnRhZ3M6IFtdXHJcbnBpbGxhcjogXHJcbmNvdmVySW1hZ2U6IFxyXG5mZWF0dXJlZDogZmFsc2VcclxubWV0YVRpdGxlOiBcclxubWV0YURlc2NyaXB0aW9uOiBcclxub2dJbWFnZTogXHJcbnZpZGVvVXJsOiBcclxuY2Fub25pY2FsVXJsOiBcclxuc3luZGljYXRpb246IFtdXHJcbi0tLVxyXG5cclxuYDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvc3NlUHVibGlzaGVyUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuICBzZXR0aW5nczogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IERFRkFVTFRfU0VUVElOR1M7XHJcbiAgcHJpdmF0ZSBzdGF0dXNCYXJFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgYXN5bmMgb25sb2FkKCkge1xyXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuICAgIHRoaXMubWlncmF0ZVNldHRpbmdzKCk7XHJcblxyXG4gICAgdGhpcy5zdGF0dXNCYXJFbCA9IHRoaXMuYWRkU3RhdHVzQmFySXRlbSgpO1xyXG5cclxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcInNlbmRcIiwgXCJQT1NTRSBQdWJsaXNoXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2hcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBQdWJsaXNoXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1kcmFmdFwiLFxyXG4gICAgICBuYW1lOiBcIlBPU1NFIFB1Ymxpc2ggYXMgRHJhZnRcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwiZHJhZnRcIiksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoLWxpdmVcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBQdWJsaXNoIExpdmVcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwicHVibGlzaGVkXCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtaW5zZXJ0LXRlbXBsYXRlXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgSW5zZXJ0IEZyb250bWF0dGVyIFRlbXBsYXRlXCIsXHJcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIGlmIChjb250ZW50LnRyaW1TdGFydCgpLnN0YXJ0c1dpdGgoXCItLS1cIikpIHtcclxuICAgICAgICAgIG5ldyBOb3RpY2UoXCJGcm9udG1hdHRlciBhbHJlYWR5IGV4aXN0cyBpbiB0aGlzIG5vdGVcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3IoMCwgMCk7XHJcbiAgICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShGUk9OVE1BVFRFUl9URU1QTEFURSwgeyBsaW5lOiAwLCBjaDogMCB9KTtcclxuICAgICAgICAvLyBQbGFjZSBjdXJzb3Igb24gdGhlIHRpdGxlIGxpbmVcclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDEsIDcpO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtdG8tYWxsXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgdG8gQWxsIERlc3RpbmF0aW9uc1wiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5wb3NzZVRvQWxsKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1zdGF0dXNcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBTdGF0dXMgXHUyMDE0IFZpZXcgU3luZGljYXRpb25cIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VTdGF0dXMoKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBvbnVubG9hZCgpIHtcclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgLy8gTWlncmF0ZSB2MSBzaW5nbGUtc2l0ZSBmb3JtYXRcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIiBhcyBEZXN0aW5hdGlvblR5cGUsXHJcbiAgICAgICAgICB1cmw6IHJhdy5zaXRlVXJsIGFzIHN0cmluZyxcclxuICAgICAgICAgIGFwaUtleTogKHJhdy5hcGlLZXkgYXMgc3RyaW5nKSB8fCBcIlwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIGRlbGV0ZSByYXcuc2l0ZVVybDtcclxuICAgICAgZGVsZXRlIHJhdy5hcGlLZXk7XHJcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9XHJcbiAgICAvLyBNaWdyYXRlIHNpdGVzIFx1MjE5MiBkZXN0aW5hdGlvbnMga2V5XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcuc2l0ZXMpICYmICFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IHJhdy5zaXRlcyBhcyBEZXN0aW5hdGlvbltdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVzO1xyXG4gICAgICB0aGlzLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMpKSB7XHJcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zID0gW107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwaWNrU2l0ZUFuZFB1Ymxpc2gob3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucyB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJBZGQgYXQgbGVhc3Qgb25lIGRlc3RpbmF0aW9uIGluIFBPU1NFIFB1Ymxpc2hlciBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlc3RpbmF0aW9ucy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0aW5hdGlvbnNbMF0sIG92ZXJyaWRlU3RhdHVzKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbmV3IFNpdGVQaWNrZXJNb2RhbCh0aGlzLmFwcCwgZGVzdGluYXRpb25zLCAoZGVzdCkgPT4ge1xyXG4gICAgICB0aGlzLnByZXBhcmVQdWJsaXNoKGRlc3QsIG92ZXJyaWRlU3RhdHVzKTtcclxuICAgIH0pLm9wZW4oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJ1aWxkIHRoZSBwdWJsaXNoIHBheWxvYWQgZnJvbSB0aGUgYWN0aXZlIGZpbGUgYW5kIHNldHRpbmdzLlxyXG4gICAqIFNoYXJlZCBieSBwcmVwYXJlUHVibGlzaCgpIGFuZCBwb3NzZVRvQWxsKCkgdG8gYXZvaWQgZHVwbGljYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyBidWlsZFBheWxvYWQoXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICAgIG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIixcclxuICApOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XHJcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY2FjaGVkUmVhZChmaWxlKTtcclxuICAgIGNvbnN0IGZpbGVDYWNoZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xyXG4gICAgY29uc3QgZnJvbnRtYXR0ZXIgPSBidWlsZEZyb250bWF0dGVyKGZpbGVDYWNoZT8uZnJvbnRtYXR0ZXIpO1xyXG4gICAgY29uc3QgYm9keSA9IGV4dHJhY3RCb2R5KGNvbnRlbnQpO1xyXG4gICAgY29uc3QgcHJvY2Vzc2VkQm9keSA9IHRoaXMuc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheCA/IHByZXByb2Nlc3NDb250ZW50KGJvZHkpIDogYm9keTtcclxuICAgIGNvbnN0IHRpdGxlID0gZnJvbnRtYXR0ZXIudGl0bGUgfHwgZmlsZS5iYXNlbmFtZSB8fCBcIlVudGl0bGVkXCI7XHJcbiAgICBjb25zdCBzbHVnID0gZnJvbnRtYXR0ZXIuc2x1ZyB8fCB0b1NsdWcodGl0bGUpO1xyXG4gICAgY29uc3Qgc3RhdHVzID0gb3ZlcnJpZGVTdGF0dXMgfHwgZnJvbnRtYXR0ZXIuc3RhdHVzIHx8IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFN0YXR1cztcclxuICAgIGNvbnN0IHBvc3RUeXBlID0gZnJvbnRtYXR0ZXIudHlwZSB8fCBcImJsb2dcIjtcclxuICAgIC8vIFVzZSBmcm9udG1hdHRlciBjYW5vbmljYWxVcmwgb3ZlcnJpZGUgaWYgcHJlc2VudDsgb3RoZXJ3aXNlIGF1dG8tZ2VuZXJhdGVcclxuICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9XHJcbiAgICAgIGZyb250bWF0dGVyLmNhbm9uaWNhbFVybCB8fFxyXG4gICAgICAodGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsXHJcbiAgICAgICAgPyBgJHt0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3Bvc3RUeXBlfS8ke3NsdWd9YFxyXG4gICAgICAgIDogXCJcIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgc2x1ZyxcclxuICAgICAgYm9keTogcHJvY2Vzc2VkQm9keSxcclxuICAgICAgZXhjZXJwdDogZnJvbnRtYXR0ZXIuZXhjZXJwdCB8fCBcIlwiLFxyXG4gICAgICB0eXBlOiBwb3N0VHlwZSxcclxuICAgICAgc3RhdHVzLFxyXG4gICAgICB0YWdzOiBmcm9udG1hdHRlci50YWdzIHx8IFtdLFxyXG4gICAgICBwaWxsYXI6IGZyb250bWF0dGVyLnBpbGxhciB8fCBcIlwiLFxyXG4gICAgICBmZWF0dXJlZDogZnJvbnRtYXR0ZXIuZmVhdHVyZWQgfHwgZmFsc2UsXHJcbiAgICAgIGNvdmVySW1hZ2U6IGZyb250bWF0dGVyLmNvdmVySW1hZ2UgfHwgXCJcIixcclxuICAgICAgbWV0YVRpdGxlOiBmcm9udG1hdHRlci5tZXRhVGl0bGUgfHwgXCJcIixcclxuICAgICAgbWV0YURlc2NyaXB0aW9uOiBmcm9udG1hdHRlci5tZXRhRGVzY3JpcHRpb24gfHwgXCJcIixcclxuICAgICAgb2dJbWFnZTogZnJvbnRtYXR0ZXIub2dJbWFnZSB8fCBcIlwiLFxyXG4gICAgICB2aWRlb1VybDogZnJvbnRtYXR0ZXIudmlkZW9VcmwgfHwgXCJcIixcclxuICAgICAgLi4uKGNhbm9uaWNhbFVybCAmJiB7IGNhbm9uaWNhbFVybCB9KSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgb3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgbWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICBuZXcgTm90aWNlKGBDb25maWd1cmUgY3JlZGVudGlhbHMgZm9yIFwiJHtkZXN0aW5hdGlvbi5uYW1lfVwiIGluIFBPU1NFIFB1Ymxpc2hlciBzZXR0aW5nc2ApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMuYnVpbGRQYXlsb2FkKHZpZXcuZmlsZSwgb3ZlcnJpZGVTdGF0dXMpO1xyXG5cclxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoKSB7XHJcbiAgICAgIG5ldyBDb25maXJtUHVibGlzaE1vZGFsKHRoaXMuYXBwLCBwYXlsb2FkLCBkZXN0aW5hdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdGluYXRpb24sIHBheWxvYWQsIHZpZXcuZmlsZSEpO1xyXG4gICAgICB9KS5vcGVuKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJvdXRlIGEgcHVibGlzaCB0byB0aGUgY29ycmVjdCBwbGF0Zm9ybSBoYW5kbGVyLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGVzdGluYXRpb24oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgc3dpdGNoIChkZXN0aW5hdGlvbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJkZXZ0b1wiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0RldlRvKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcIm1hc3RvZG9uXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvTWFzdG9kb24oZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwiYmx1ZXNreVwiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0JsdWVza3koZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwibWVkaXVtXCI6XHJcbiAgICAgIGNhc2UgXCJyZWRkaXRcIjpcclxuICAgICAgY2FzZSBcInRocmVhZHNcIjpcclxuICAgICAgY2FzZSBcImxpbmtlZGluXCI6XHJcbiAgICAgIGNhc2UgXCJlY2VuY3lcIjpcclxuICAgICAgICBuZXcgTm90aWNlKGAke2Rlc3RpbmF0aW9uLm5hbWV9OiAke2Rlc3RpbmF0aW9uLnR5cGV9IHN1cHBvcnQgaXMgY29taW5nIGluIGEgZnV0dXJlIHVwZGF0ZWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaXNoVG9DdXN0b21BcGkoZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gYSBjdXN0b20gL2FwaS9wdWJsaXNoIGVuZHBvaW50LiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQ3VzdG9tQXBpKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICBjb25zdCBzdGF0dXMgPSBwYXlsb2FkLnN0YXR1cyBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyICR7ZGVzdGluYXRpb24ubmFtZX0uLi5gKTtcclxuICAgICAgY29uc3QgdXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vYXBpL3B1Ymxpc2hgO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJ4LXB1Ymxpc2gta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgbGV0IHZlcmIgPSBcIlBPU1NFZFwiO1xyXG4gICAgICAgIHRyeSB7IGlmIChyZXNwb25zZS5qc29uPy51cHNlcnRlZCkgdmVyYiA9IFwiVXBkYXRlZFwiOyB9IGNhdGNoIHsgLyogbm9uLUpTT04gKi8gfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYCR7dmVyYn0gXCIke3RpdGxlfVwiIG9uICR7ZGVzdGluYXRpb24ubmFtZX0gYXMgJHtzdGF0dXN9YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhkZXN0aW5hdGlvbi5uYW1lKTtcclxuICAgICAgICBsZXQgc3luZGljYXRpb25Vcmw6IHN0cmluZztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgc3luZGljYXRpb25VcmwgPSByZXNwb25zZS5qc29uPy51cmwgfHxcclxuICAgICAgICAgICAgYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwYXlsb2FkLnNsdWcgYXMgc3RyaW5nfWA7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICBzeW5kaWNhdGlvblVybCA9IGAke2Rlc3RpbmF0aW9uLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9LyR7cGF5bG9hZC5zbHVnIGFzIHN0cmluZ31gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgc3luZGljYXRpb25VcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gcmVzcG9uc2UuanNvbj8uZXJyb3IgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRSB0byAke2Rlc3RpbmF0aW9uLm5hbWV9IGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFIGVycm9yICgke2Rlc3RpbmF0aW9uLm5hbWV9KTogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBEZXYudG8gdmlhIHRoZWlyIGFydGljbGVzIEFQSS4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb0RldlRvKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIERldi50byAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuICAgICAgY29uc3QgdGFncyA9ICgocGF5bG9hZC50YWdzIGFzIHN0cmluZ1tdKSB8fCBbXSlcclxuICAgICAgICAuc2xpY2UoMCwgNClcclxuICAgICAgICAubWFwKCh0KSA9PiB0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldL2csIFwiXCIpKTtcclxuICAgICAgY29uc3QgYXJ0aWNsZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XHJcbiAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgYm9keV9tYXJrZG93bjogcGF5bG9hZC5ib2R5IGFzIHN0cmluZyxcclxuICAgICAgICBwdWJsaXNoZWQ6IHBheWxvYWQuc3RhdHVzID09PSBcInB1Ymxpc2hlZFwiLFxyXG4gICAgICAgIHRhZ3MsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IChwYXlsb2FkLmV4Y2VycHQgYXMgc3RyaW5nKSB8fCBcIlwiLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAocGF5bG9hZC5jYW5vbmljYWxVcmwpIGFydGljbGUuY2Fub25pY2FsX3VybCA9IHBheWxvYWQuY2Fub25pY2FsVXJsO1xyXG4gICAgICBpZiAocGF5bG9hZC5jb3ZlckltYWdlKSBhcnRpY2xlLm1haW5faW1hZ2UgPSBwYXlsb2FkLmNvdmVySW1hZ2U7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vZGV2LnRvL2FwaS9hcnRpY2xlc1wiLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcImFwaS1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBhcnRpY2xlIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QgYXJ0aWNsZVVybDogc3RyaW5nID0gcmVzcG9uc2UuanNvbj8udXJsIHx8IFwiaHR0cHM6Ly9kZXYudG9cIjtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIERldi50b2ApO1xyXG4gICAgICAgIHRoaXMuc2hvd1N0YXR1c0JhclN1Y2Nlc3MoXCJEZXYudG9cIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIGFydGljbGVVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gcmVzcG9uc2UuanNvbj8uZXJyb3IgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBEZXYudG8gUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgRGV2LnRvIGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIE1hc3RvZG9uIGJ5IHBvc3RpbmcgYSBzdGF0dXMgd2l0aCB0aGUgY2Fub25pY2FsIGxpbmsuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9NYXN0b2RvbihcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBNYXN0b2RvbiAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuICAgICAgY29uc3QgZXhjZXJwdCA9IChwYXlsb2FkLmV4Y2VycHQgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSAocGF5bG9hZC5jYW5vbmljYWxVcmwgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBzdGF0dXNUZXh0ID0gW3RpdGxlLCBleGNlcnB0LCBjYW5vbmljYWxVcmxdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXFxuXCIpO1xyXG4gICAgICBjb25zdCBpbnN0YW5jZVVybCA9IChkZXN0aW5hdGlvbi5pbnN0YW5jZVVybCB8fCBcIlwiKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsOiBgJHtpbnN0YW5jZVVybH0vYXBpL3YxL3N0YXR1c2VzYCxcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHtkZXN0aW5hdGlvbi5hY2Nlc3NUb2tlbn1gLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdGF0dXM6IHN0YXR1c1RleHQsIHZpc2liaWxpdHk6IFwicHVibGljXCIgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCBzdGF0dXNVcmw6IHN0cmluZyA9IHJlc3BvbnNlLmpzb24/LnVybCB8fCBpbnN0YW5jZVVybDtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIE1hc3RvZG9uYCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIk1hc3RvZG9uXCIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBzdGF0dXNVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gcmVzcG9uc2UuanNvbj8uZXJyb3IgfHwgU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBjYXRjaCB7IGVycm9yRGV0YWlsID0gU3RyaW5nKHJlc3BvbnNlLnN0YXR1cyk7IH1cclxuICAgICAgICBuZXcgTm90aWNlKGBNYXN0b2RvbiBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBNYXN0b2RvbiBlcnJvcjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBCbHVlc2t5IHZpYSBBVCBQcm90b2NvbC4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb0JsdWVza3koXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgQmx1ZXNreSAoJHtkZXN0aW5hdGlvbi5uYW1lfSkuLi5gKTtcclxuXHJcbiAgICAgIC8vIEF1dGhlbnRpY2F0ZVxyXG4gICAgICBjb25zdCBhdXRoUmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ic2t5LnNvY2lhbC94cnBjL2NvbS5hdHByb3RvLnNlcnZlci5jcmVhdGVTZXNzaW9uXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgaWRlbnRpZmllcjogZGVzdGluYXRpb24uaGFuZGxlLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6IGRlc3RpbmF0aW9uLmFwcFBhc3N3b3JkLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGF1dGhSZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgYXV0aFJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcclxuICAgICAgICBuZXcgTm90aWNlKGBCbHVlc2t5IGF1dGggZmFpbGVkOiAke2F1dGhSZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHsgZGlkLCBhY2Nlc3NKd3QgfSA9IGF1dGhSZXNwb25zZS5qc29uIGFzIHsgZGlkOiBzdHJpbmc7IGFjY2Vzc0p3dDogc3RyaW5nIH07XHJcblxyXG4gICAgICAvLyBCdWlsZCBwb3N0IHRleHQgKDMwMCBjaGFyIGxpbWl0KVxyXG4gICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSAocGF5bG9hZC5jYW5vbmljYWxVcmwgYXMgc3RyaW5nKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCBleGNlcnB0ID0gKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGJhc2VUZXh0ID0gW3RpdGxlLCBleGNlcnB0XS5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcdTIwMTQgXCIpO1xyXG4gICAgICBjb25zdCBtYXhUZXh0ID0gMzAwIC0gKGNhbm9uaWNhbFVybCA/IGNhbm9uaWNhbFVybC5sZW5ndGggKyAxIDogMCk7XHJcbiAgICAgIGNvbnN0IHRleHQgPSAoYmFzZVRleHQubGVuZ3RoID4gbWF4VGV4dFxyXG4gICAgICAgID8gYmFzZVRleHQuc3Vic3RyaW5nKDAsIG1heFRleHQgLSAxKSArIFwiXHUyMDI2XCJcclxuICAgICAgICA6IGJhc2VUZXh0XHJcbiAgICAgICkgKyAoY2Fub25pY2FsVXJsID8gYCAke2Nhbm9uaWNhbFVybH1gIDogXCJcIik7XHJcblxyXG4gICAgICBjb25zdCBwb3N0UmVjb3JkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcclxuICAgICAgICAkdHlwZTogXCJhcHAuYnNreS5mZWVkLnBvc3RcIixcclxuICAgICAgICB0ZXh0LFxyXG4gICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIGxhbmdzOiBbXCJlblwiXSxcclxuICAgICAgfTtcclxuICAgICAgaWYgKGNhbm9uaWNhbFVybCkge1xyXG4gICAgICAgIGNvbnN0IHVybFN0YXJ0ID0gdGV4dC5sYXN0SW5kZXhPZihjYW5vbmljYWxVcmwpO1xyXG4gICAgICAgIHBvc3RSZWNvcmQuZmFjZXRzID0gW3tcclxuICAgICAgICAgIGluZGV4OiB7IGJ5dGVTdGFydDogbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHRleHQuc3Vic3RyaW5nKDAsIHVybFN0YXJ0KSkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgYnl0ZUVuZDogICBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGV4dC5zdWJzdHJpbmcoMCwgdXJsU3RhcnQgKyBjYW5vbmljYWxVcmwubGVuZ3RoKSkubGVuZ3RoIH0sXHJcbiAgICAgICAgICBmZWF0dXJlczogW3sgJHR5cGU6IFwiYXBwLmJza3kucmljaHRleHQuZmFjZXQjbGlua1wiLCB1cmk6IGNhbm9uaWNhbFVybCB9XSxcclxuICAgICAgICB9XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ic2t5LnNvY2lhbC94cnBjL2NvbS5hdHByb3RvLnJlcG8uY3JlYXRlUmVjb3JkXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBgQmVhcmVyICR7YWNjZXNzSnd0fWAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICByZXBvOiBkaWQsXHJcbiAgICAgICAgICBjb2xsZWN0aW9uOiBcImFwcC5ic2t5LmZlZWQucG9zdFwiLFxyXG4gICAgICAgICAgcmVjb3JkOiBwb3N0UmVjb3JkLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XHJcbiAgICAgICAgY29uc3QgdXJpOiBzdHJpbmcgPSBjcmVhdGVSZXNwb25zZS5qc29uPy51cmkgfHwgXCJcIjtcclxuICAgICAgICBjb25zdCBwb3N0VXJsID0gdXJpXHJcbiAgICAgICAgICA/IGBodHRwczovL2Jza3kuYXBwL3Byb2ZpbGUvJHtkZXN0aW5hdGlvbi5oYW5kbGV9L3Bvc3QvJHt1cmkuc3BsaXQoXCIvXCIpLnBvcCgpfWBcclxuICAgICAgICAgIDogXCJodHRwczovL2Jza3kuYXBwXCI7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUE9TU0VkIFwiJHt0aXRsZX1cIiB0byBCbHVlc2t5YCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIkJsdWVza3lcIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHBvc3RVcmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBlcnJvckRldGFpbDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7IGVycm9yRGV0YWlsID0gU3RyaW5nKGNyZWF0ZVJlc3BvbnNlLmpzb24/Lm1lc3NhZ2UgfHwgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcoY3JlYXRlUmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgUE9TU0UgZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBlcnJvcjogJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUE9TU0UgdG8gYWxsIGNvbmZpZ3VyZWQgZGVzdGluYXRpb25zIGF0IG9uY2UuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwb3NzZVRvQWxsKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBQT1NTRSBQdWJsaXNoZXIgc2V0dGluZ3NcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBtYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5idWlsZFBheWxvYWQodmlldy5maWxlLCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7cGF5bG9hZC50aXRsZX1cIiB0byAke2Rlc3RpbmF0aW9ucy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpLi4uYCk7XHJcbiAgICBmb3IgKGNvbnN0IGRlc3Qgb2YgZGVzdGluYXRpb25zKSB7XHJcbiAgICAgIGlmICh0aGlzLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdCkpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3QsIHBheWxvYWQsIHZpZXcuZmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgU2tpcHBpbmcgXCIke2Rlc3QubmFtZX1cIiBcdTIwMTQgY3JlZGVudGlhbHMgbm90IGNvbmZpZ3VyZWRgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrIHdoZXRoZXIgYSBkZXN0aW5hdGlvbiBoYXMgdGhlIHJlcXVpcmVkIGNyZWRlbnRpYWxzIGNvbmZpZ3VyZWQuICovXHJcbiAgaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0OiBEZXN0aW5hdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoIChkZXN0LnR5cGUpIHtcclxuICAgICAgY2FzZSBcImRldnRvXCI6ICAgIHJldHVybiAhIWRlc3QuYXBpS2V5O1xyXG4gICAgICBjYXNlIFwibWFzdG9kb25cIjogcmV0dXJuICEhKGRlc3QuaW5zdGFuY2VVcmwgJiYgZGVzdC5hY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJibHVlc2t5XCI6ICByZXR1cm4gISEoZGVzdC5oYW5kbGUgJiYgZGVzdC5hcHBQYXNzd29yZCk7XHJcbiAgICAgIGNhc2UgXCJtZWRpdW1cIjogICByZXR1cm4gISFkZXN0Lm1lZGl1bVRva2VuO1xyXG4gICAgICBjYXNlIFwicmVkZGl0XCI6ICAgcmV0dXJuICEhKGRlc3QucmVkZGl0Q2xpZW50SWQgJiYgZGVzdC5yZWRkaXRDbGllbnRTZWNyZXQgJiYgZGVzdC5yZWRkaXRSZWZyZXNoVG9rZW4pO1xyXG4gICAgICBjYXNlIFwidGhyZWFkc1wiOiAgcmV0dXJuICEhKGRlc3QudGhyZWFkc1VzZXJJZCAmJiBkZXN0LnRocmVhZHNBY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJsaW5rZWRpblwiOiByZXR1cm4gISEoZGVzdC5saW5rZWRpbkFjY2Vzc1Rva2VuICYmIGRlc3QubGlua2VkaW5QZXJzb25Vcm4pO1xyXG4gICAgICBjYXNlIFwiZWNlbmN5XCI6ICAgcmV0dXJuICEhKGRlc3QuaGl2ZVVzZXJuYW1lICYmIGRlc3QuaGl2ZVBvc3RpbmdLZXkpO1xyXG4gICAgICBkZWZhdWx0OiAgICAgICAgIHJldHVybiAhIShkZXN0LnVybCAmJiBkZXN0LmFwaUtleSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogV3JpdGUgYSBzeW5kaWNhdGlvbiBlbnRyeSBiYWNrIGludG8gdGhlIG5vdGUncyBmcm9udG1hdHRlci4gVXBkYXRlcyB0aGUgVVJMIGlmIHRoZSBkZXN0aW5hdGlvbiBhbHJlYWR5IGV4aXN0cy4gKi9cclxuICBwcml2YXRlIGFzeW5jIHdyaXRlU3luZGljYXRpb24oZmlsZTogVEZpbGUsIG5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcclxuICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZm0pID0+IHtcclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZtLnN5bmRpY2F0aW9uKSkgZm0uc3luZGljYXRpb24gPSBbXTtcclxuICAgICAgY29uc3QgZW50cmllcyA9IGZtLnN5bmRpY2F0aW9uIGFzIEFycmF5PHsgbmFtZT86IHN0cmluZzsgdXJsPzogc3RyaW5nIH0+O1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGVudHJpZXMuZmluZCgocykgPT4gcy5uYW1lID09PSBuYW1lKTtcclxuICAgICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgICAgZXhpc3RpbmcudXJsID0gdXJsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVudHJpZXMucHVzaCh7IHVybCwgbmFtZSB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dTdGF0dXNCYXJTdWNjZXNzKHNpdGVOYW1lOiBzdHJpbmcpIHtcclxuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KGBQT1NTRWQgXHUyNzEzICR7c2l0ZU5hbWV9YCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhckVsKSB0aGlzLnN0YXR1c0JhckVsLnNldFRleHQoXCJcIik7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcblxyXG4gIC8qKiBTaG93IGN1cnJlbnQgc3luZGljYXRpb24gc3RhdHVzIGZvciB0aGUgYWN0aXZlIG5vdGUuICovXHJcbiAgcHJpdmF0ZSBwb3NzZVN0YXR1cygpIHtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBtYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3Qgc3luZGljYXRpb24gPSBmaWxlQ2FjaGU/LmZyb250bWF0dGVyPy5zeW5kaWNhdGlvbjtcclxuICAgIGNvbnN0IHRpdGxlID0gZmlsZUNhY2hlPy5mcm9udG1hdHRlcj8udGl0bGUgfHwgdmlldy5maWxlLmJhc2VuYW1lO1xyXG4gICAgbmV3IFBvc3NlU3RhdHVzTW9kYWwodGhpcy5hcHAsIHRpdGxlLCBzeW5kaWNhdGlvbikub3BlbigpO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIENvbmZpcm1hdGlvbiBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIENvbmZpcm1QdWJsaXNoTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbjtcclxuICBwcml2YXRlIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBhcHA6IEFwcCxcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgb25Db25maXJtOiAoKSA9PiB2b2lkLFxyXG4gICkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XHJcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9uQ29uZmlybTtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwicG9zc2UtcHVibGlzaGVyLWNvbmZpcm0tbW9kYWxcIik7XHJcblxyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkNvbmZpcm0gUE9TU0VcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBgWW91IGFyZSBhYm91dCB0byBQT1NTRSB0byAke3RoaXMuZGVzdGluYXRpb24ubmFtZX06YCxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN1bW1hcnkgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInB1Ymxpc2gtc3VtbWFyeVwiIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUaXRsZTogJHt0aGlzLnBheWxvYWQudGl0bGV9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgU2x1ZzogJHt0aGlzLnBheWxvYWQuc2x1Z31gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBTdGF0dXM6ICR7dGhpcy5wYXlsb2FkLnN0YXR1c31gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUeXBlOiAke3RoaXMucGF5bG9hZC50eXBlfWAgfSk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhbmNlbEJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNhbmNlbFwiIH0pO1xyXG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xyXG5cclxuICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgdGV4dDogXCJQT1NTRVwiLFxyXG4gICAgICBjbHM6IFwibW9kLWN0YVwiLFxyXG4gICAgfSk7XHJcbiAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpIHtcclxuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2l0ZSBQaWNrZXIgTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBTaXRlUGlja2VyTW9kYWwgZXh0ZW5kcyBTdWdnZXN0TW9kYWw8RGVzdGluYXRpb24+IHtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uczogRGVzdGluYXRpb25bXTtcclxuICBwcml2YXRlIG9uQ2hvb3NlOiAoZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgZGVzdGluYXRpb25zOiBEZXN0aW5hdGlvbltdLCBvbkNob29zZTogKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikgPT4gdm9pZCkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMuZGVzdGluYXRpb25zID0gZGVzdGluYXRpb25zO1xyXG4gICAgdGhpcy5vbkNob29zZSA9IG9uQ2hvb3NlO1xyXG4gICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIkNob29zZSBhIGRlc3RpbmF0aW9uIHRvIFBPU1NFIHRvLi4uXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IERlc3RpbmF0aW9uW10ge1xyXG4gICAgY29uc3QgbG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25zLmZpbHRlcihcclxuICAgICAgKGQpID0+XHJcbiAgICAgICAgZC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXIpIHx8XHJcbiAgICAgICAgZC51cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlciksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyU3VnZ2VzdGlvbihkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sIGVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgZWwuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBkZXN0aW5hdGlvbi5uYW1lLCBjbHM6IFwic3VnZ2VzdGlvbi10aXRsZVwiIH0pO1xyXG4gICAgZWwuY3JlYXRlRWwoXCJzbWFsbFwiLCB7IHRleHQ6IGRlc3RpbmF0aW9uLnVybCwgY2xzOiBcInN1Z2dlc3Rpb24tbm90ZVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DaG9vc2VTdWdnZXN0aW9uKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikge1xyXG4gICAgdGhpcy5vbkNob29zZShkZXN0aW5hdGlvbik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2V0dGluZ3MgVGFiIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxuY2xhc3MgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBQb3NzZVB1Ymxpc2hlclBsdWdpbjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogUG9zc2VQdWJsaXNoZXJQbHVnaW4pIHtcclxuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gIH1cclxuXHJcbiAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIllvdXIgQ2Fub25pY2FsIFNpdGVcIiB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDYW5vbmljYWwgQmFzZSBVUkxcIilcclxuICAgICAgLnNldERlc2MoXCJZb3VyIG93biBzaXRlJ3Mgcm9vdCBVUkwuIEV2ZXJ5IHB1Ymxpc2hlZCBwb3N0IHdpbGwgaW5jbHVkZSBhIGNhbm9uaWNhbFVybCBwb2ludGluZyBoZXJlIFx1MjAxNCB0aGUgb3JpZ2luYWwgeW91IG93bi5cIilcclxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgdGV4dFxyXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly95b3Vyc2l0ZS5jb21cIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cDovL2xvY2FsaG9zdFwiKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBDYW5vbmljYWwgQmFzZSBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggaHR0cHM6Ly9cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJEZXN0aW5hdGlvbnNcIiB9KTtcclxuXHJcbiAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMuZm9yRWFjaCgoZGVzdGluYXRpb24sIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGRlc3RDb250YWluZXIgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoe1xyXG4gICAgICAgIGNsczogXCJwb3NzZS1wdWJsaXNoZXItc2l0ZVwiLFxyXG4gICAgICB9KTtcclxuICAgICAgZGVzdENvbnRhaW5lci5jcmVhdGVFbChcImgzXCIsIHtcclxuICAgICAgICB0ZXh0OiBkZXN0aW5hdGlvbi5uYW1lIHx8IGBEZXN0aW5hdGlvbiAke2luZGV4ICsgMX1gLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJEZXN0aW5hdGlvbiBOYW1lXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJBIGxhYmVsIGZvciB0aGlzIGRlc3RpbmF0aW9uIChlLmcuIE15IEJsb2cpXCIpXHJcbiAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIk15IFNpdGVcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLm5hbWUpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJUeXBlXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJQbGF0Zm9ybSB0byBwdWJsaXNoIHRvXCIpXHJcbiAgICAgICAgLmFkZERyb3Bkb3duKChkZCkgPT5cclxuICAgICAgICAgIGRkXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJjdXN0b20tYXBpXCIsIFwiQ3VzdG9tIEFQSVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiZGV2dG9cIiwgXCJEZXYudG9cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcIm1hc3RvZG9uXCIsIFwiTWFzdG9kb25cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImJsdWVza3lcIiwgXCJCbHVlc2t5XCIpXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJtZWRpdW1cIiwgXCJNZWRpdW1cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcInJlZGRpdFwiLCBcIlJlZGRpdFwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwidGhyZWFkc1wiLCBcIlRocmVhZHNcIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImxpbmtlZGluXCIsIFwiTGlua2VkSW5cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImVjZW5jeVwiLCBcIkVjZW5jeSAoSGl2ZSlcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnR5cGUgfHwgXCJjdXN0b20tYXBpXCIpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnR5cGUgPSB2YWx1ZSBhcyBEZXN0aW5hdGlvblR5cGU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICBjb25zdCBkZXN0VHlwZSA9IGRlc3RpbmF0aW9uLnR5cGUgfHwgXCJjdXN0b20tYXBpXCI7XHJcblxyXG4gICAgICBpZiAoZGVzdFR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiU2l0ZSBVUkxcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBzaXRlJ3MgYmFzZSBVUkwgKG11c3Qgc3RhcnQgd2l0aCBodHRwczovLylcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi51cmwgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCJodHRwOi8vbG9jYWxob3N0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBEZXN0aW5hdGlvbiBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggaHR0cHM6Ly9cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQVBJIEtleVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJQVUJMSVNIX0FQSV9LRVkgZnJvbSB5b3VyIHNpdGUncyBlbnZpcm9ubWVudFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIEFQSSBrZXlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBpS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJkZXZ0b1wiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiRGV2LnRvIEFQSSBLZXlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSBodHRwczovL2Rldi50by9zZXR0aW5ncy9leHRlbnNpb25zXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgRGV2LnRvIEFQSSBrZXlcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBpS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJtYXN0b2RvblwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSW5zdGFuY2UgVVJMXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgTWFzdG9kb24gaW5zdGFuY2UgKGUuZy4gaHR0cHM6Ly9tYXN0b2Rvbi5zb2NpYWwpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vbWFzdG9kb24uc29jaWFsXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmluc3RhbmNlVXJsIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5pbnN0YW5jZVVybCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFjY2VzcyBUb2tlblwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIHlvdXIgTWFzdG9kb24gYWNjb3VudDogU2V0dGluZ3MgXHUyMTkyIERldmVsb3BtZW50IFx1MjE5MiBOZXcgQXBwbGljYXRpb25cIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYWNjZXNzVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFjY2Vzc1Rva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiYmx1ZXNreVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQmx1ZXNreSBIYW5kbGVcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBoYW5kbGUgKGUuZy4geW91cm5hbWUuYnNreS5zb2NpYWwpXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInlvdXJuYW1lLmJza3kuc29jaWFsXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhhbmRsZSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaGFuZGxlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQXBwIFBhc3N3b3JkXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gaHR0cHM6Ly9ic2t5LmFwcC9zZXR0aW5ncy9hcHAtcGFzc3dvcmRzIFx1MjAxNCBOT1QgeW91ciBsb2dpbiBwYXNzd29yZFwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInh4eHgteHh4eC14eHh4LXh4eHhcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uYXBwUGFzc3dvcmQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmFwcFBhc3N3b3JkID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibWVkaXVtXCIpIHtcclxuICAgICAgICBkZXN0Q29udGFpbmVyLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgICAgICB0ZXh0OiBcIk5vdGU6IFRoZSBNZWRpdW0gQVBJIHdhcyBhcmNoaXZlZCBpbiBNYXJjaCAyMDIzLiBJdCBtYXkgc3RpbGwgd29yayBidXQgY291bGQgYmUgZGlzY29udGludWVkIGF0IGFueSB0aW1lLlwiLFxyXG4gICAgICAgICAgY2xzOiBcInNldHRpbmctaXRlbS1kZXNjcmlwdGlvbiBtb2Qtd2FybmluZ1wiLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkludGVncmF0aW9uIFRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gbWVkaXVtLmNvbSBcdTIxOTIgU2V0dGluZ3MgXHUyMTkyIFNlY3VyaXR5IGFuZCBhcHBzIFx1MjE5MiBJbnRlZ3JhdGlvbiB0b2tlbnNcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBNZWRpdW0gaW50ZWdyYXRpb24gdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubWVkaXVtVG9rZW4gfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLm1lZGl1bVRva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwicmVkZGl0XCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJDbGllbnQgSURcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSByZWRkaXQuY29tL3ByZWZzL2FwcHMgXHUyMDE0IGNyZWF0ZSBhIFxcXCJzY3JpcHRcXFwiIHR5cGUgYXBwXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkNsaWVudCBJRFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRDbGllbnRJZCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0Q2xpZW50SWQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJDbGllbnQgU2VjcmV0XCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiQ2xpZW50IHNlY3JldFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5yZWRkaXRDbGllbnRTZWNyZXQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdENsaWVudFNlY3JldCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlJlZnJlc2ggVG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiT0F1dGgyIHJlZnJlc2ggdG9rZW4gZm9yIHlvdXIgUmVkZGl0IGFjY291bnRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJSZWZyZXNoIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdFJlZnJlc2hUb2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ucmVkZGl0UmVmcmVzaFRva2VuID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiUmVkZGl0IFVzZXJuYW1lXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInUveW91cm5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ucmVkZGl0VXNlcm5hbWUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdFVzZXJuYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiRGVmYXVsdCBTdWJyZWRkaXRcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiZS5nLiByL3dlYmRldiBcdTIwMTQgY2FuIGJlIG92ZXJyaWRkZW4gcGVyIG5vdGUgd2l0aCBcXFwic3VicmVkZGl0OlxcXCIgZnJvbnRtYXR0ZXJcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwici9zdWJyZWRkaXRuYW1lXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnJlZGRpdERlZmF1bHRTdWJyZWRkaXQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnJlZGRpdERlZmF1bHRTdWJyZWRkaXQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJ0aHJlYWRzXCIpIHtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJUaHJlYWRzIFVzZXIgSURcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBudW1lcmljIFRocmVhZHMvSW5zdGFncmFtIHVzZXIgSURcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiMTIzNDU2Nzg5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLnRocmVhZHNVc2VySWQgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLnRocmVhZHNVc2VySWQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgVG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiTG9uZy1saXZlZCBUaHJlYWRzIGFjY2VzcyB0b2tlbiB3aXRoIHRocmVhZHNfY29udGVudF9wdWJsaXNoIHBlcm1pc3Npb25cIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udGhyZWFkc0FjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS50aHJlYWRzQWNjZXNzVG9rZW4gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwudHlwZSA9IFwicGFzc3dvcmRcIjtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLmF1dG9jb21wbGV0ZSA9IFwib2ZmXCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChkZXN0VHlwZSA9PT0gXCJsaW5rZWRpblwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiQWNjZXNzIFRva2VuXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIk9BdXRoMiBiZWFyZXIgdG9rZW4gd2l0aCB3X21lbWJlcl9zb2NpYWwgc2NvcGVcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBhY2Nlc3MgdG9rZW5cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24ubGlua2VkaW5BY2Nlc3NUb2tlbiB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0ubGlua2VkaW5BY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlBlcnNvbiBVUk5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiWW91ciBMaW5rZWRJbiBtZW1iZXIgVVJOLCBlLmcuIHVybjpsaTpwZXJzb246YWJjMTIzXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInVybjpsaTpwZXJzb246Li4uXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmxpbmtlZGluUGVyc29uVXJuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5saW5rZWRpblBlcnNvblVybiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImVjZW5jeVwiKSB7XHJcbiAgICAgICAgbmV3IFNldHRpbmcoZGVzdENvbnRhaW5lcilcclxuICAgICAgICAgIC5zZXROYW1lKFwiSGl2ZSBVc2VybmFtZVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIEhpdmUvRWNlbmN5IGFjY291bnQgbmFtZSAod2l0aG91dCBAKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJ5b3VydXNlcm5hbWVcIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24uaGl2ZVVzZXJuYW1lIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oaXZlVXNlcm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJQb3N0aW5nIEtleVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIEhpdmUgcHJpdmF0ZSBwb3N0aW5nIGtleSAobm90IHRoZSBvd25lciBvciBhY3RpdmUga2V5KVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIjVLLi4uXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmhpdmVQb3N0aW5nS2V5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oaXZlUG9zdGluZ0tleSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkNvbW11bml0eVwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJIaXZlIGNvbW11bml0eSB0YWcgdG8gcG9zdCBpbiAoZS5nLiBoaXZlLTE3NDMwMSBmb3IgT0NEKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJoaXZlLTE3NDMwMVwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oaXZlQ29tbXVuaXR5IHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5oaXZlQ29tbXVuaXR5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJUZXN0IENvbm5lY3Rpb25cIikub25DbGljayhhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5wbHVnaW4uaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0aW5hdGlvbikpIHtcclxuICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiQ29uZmlndXJlIGNyZWRlbnRpYWxzIGZpcnN0XCIpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVzdFR5cGUgPT09IFwiY3VzdG9tLWFwaVwiKSB7XHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGAke2Rlc3RpbmF0aW9uLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9L2FwaS9wdWJsaXNoYDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIk9QVElPTlNcIixcclxuICAgICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIngtcHVibGlzaC1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5IH0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDQwMCkge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MTMgQ29ubmVjdGlvbiB0byAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfSBzdWNjZXNzZnVsYCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MTcgJHtkZXN0aW5hdGlvbi5uYW1lIHx8IGRlc3RpbmF0aW9uLnVybH0gcmVzcG9uZGVkIHdpdGggJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICBuZXcgTm90aWNlKGBcdTI3MTcgQ291bGQgbm90IHJlYWNoICR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9YCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoYENyZWRlbnRpYWxzIGxvb2sgY29uZmlndXJlZCBmb3IgJHtkZXN0aW5hdGlvbi5uYW1lfS4gUHVibGlzaCB0byB0ZXN0LmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICApXHJcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgICAgYnRuXHJcbiAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiUmVtb3ZlIERlc3RpbmF0aW9uXCIpXHJcbiAgICAgICAgICAgIC5zZXRXYXJuaW5nKClcclxuICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbmZpcm1FbCA9IGRlc3RDb250YWluZXIuY3JlYXRlRGl2KHtcclxuICAgICAgICAgICAgICAgIGNsczogXCJzZXR0aW5nLWl0ZW1cIixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25maXJtRWwuY3JlYXRlRWwoXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IGBSZW1vdmUgXCIke2Rlc3RpbmF0aW9uLm5hbWUgfHwgXCJ0aGlzIGRlc3RpbmF0aW9uXCJ9XCI/IGAsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgeWVzQnRuID0gY29uZmlybUVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiWWVzLCByZW1vdmVcIixcclxuICAgICAgICAgICAgICAgIGNsczogXCJtb2Qtd2FybmluZ1wiLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5vQnRuID0gY29uZmlybUVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDYW5jZWxcIiB9KTtcclxuICAgICAgICAgICAgICB5ZXNCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBub0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gY29uZmlybUVsLnJlbW92ZSgpKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuXHJcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkFkZCBEZXN0aW5hdGlvblwiKVxyXG4gICAgICAgICAgLnNldEN0YSgpXHJcbiAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIlwiLFxyXG4gICAgICAgICAgICAgIHR5cGU6IFwiY3VzdG9tLWFwaVwiLFxyXG4gICAgICAgICAgICAgIHVybDogXCJcIixcclxuICAgICAgICAgICAgICBhcGlLZXk6IFwiXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJEZWZhdWx0c1wiIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkRlZmF1bHQgU3RhdHVzXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiRGVmYXVsdCBwdWJsaXNoIHN0YXR1cyB3aGVuIG5vdCBzcGVjaWZpZWQgaW4gZnJvbnRtYXR0ZXJcIilcclxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cclxuICAgICAgICBkcm9wZG93blxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcImRyYWZ0XCIsIFwiRHJhZnRcIilcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJwdWJsaXNoZWRcIiwgXCJQdWJsaXNoZWRcIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzID0gdmFsdWUgYXNcclxuICAgICAgICAgICAgICB8IFwiZHJhZnRcIlxyXG4gICAgICAgICAgICAgIHwgXCJwdWJsaXNoZWRcIjtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDb25maXJtIEJlZm9yZSBQdWJsaXNoaW5nXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiU2hvdyBhIGNvbmZpcm1hdGlvbiBtb2RhbCB3aXRoIHBvc3QgZGV0YWlscyBiZWZvcmUgcHVibGlzaGluZ1wiKVxyXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybUJlZm9yZVB1Ymxpc2gpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiU3RyaXAgT2JzaWRpYW4gU3ludGF4XCIpXHJcbiAgICAgIC5zZXREZXNjKFxyXG4gICAgICAgIFwiQ29udmVydCB3aWtpLWxpbmtzLCByZW1vdmUgZW1iZWRzLCBjb21tZW50cywgYW5kIGRhdGF2aWV3IGJsb2NrcyBiZWZvcmUgcHVibGlzaGluZ1wiLFxyXG4gICAgICApXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4KVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zdHJpcE9ic2lkaWFuU3ludGF4ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgLyogXHUyNTAwXHUyNTAwIFN1cHBvcnQgc2VjdGlvbiBcdTI1MDBcdTI1MDAgKi9cclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlN1cHBvcnQgUE9TU0UgUHVibGlzaGVyXCIgfSk7XHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBcIlBPU1NFIFB1Ymxpc2hlciBpcyBmcmVlIGFuZCBvcGVuIHNvdXJjZS4gSWYgaXQgc2F2ZXMgeW91IHRpbWUsIGNvbnNpZGVyIHN1cHBvcnRpbmcgaXRzIGRldmVsb3BtZW50LlwiLFxyXG4gICAgICBjbHM6IFwic2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJCdXkgTWUgYSBDb2ZmZWVcIilcclxuICAgICAgLnNldERlc2MoXCJPbmUtdGltZSBvciByZWN1cnJpbmcgc3VwcG9ydFwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJcXHUyNjE1IFN1cHBvcnRcIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cub3BlbihcImh0dHBzOi8vYnV5bWVhY29mZmVlLmNvbS90aGVvZmZpY2FsZG1cIiwgXCJfYmxhbmtcIik7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiR2l0SHViIFNwb25zb3JzXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiTW9udGhseSBzcG9uc29yc2hpcCB0aHJvdWdoIEdpdEh1YlwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJcXHUyNzY0IFNwb25zb3JcIikub25DbGljaygoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cub3BlbihcImh0dHBzOi8vZ2l0aHViLmNvbS9zcG9uc29ycy9UaGVPZmZpY2lhbERNXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkFsbCBGdW5kaW5nIE9wdGlvbnNcIilcclxuICAgICAgLnNldERlc2MoXCJkZXZpbm1hcnNoYWxsLmluZm8vZnVuZFwiKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoXCJcXHVEODNEXFx1REQxNyBGdW5kXCIpLm9uQ2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwczovL2RldmlubWFyc2hhbGwuaW5mby9mdW5kXCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIFBPU1NFIFN0YXR1cyBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbnR5cGUgU3luZGljYXRpb25FbnRyeSA9IHsgdXJsPzogc3RyaW5nOyBuYW1lPzogc3RyaW5nIH07XHJcblxyXG5jbGFzcyBQb3NzZVN0YXR1c01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIHN5bmRpY2F0aW9uOiBTeW5kaWNhdGlvbkVudHJ5W10gfCB1bmtub3duO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgdGl0bGU6IHN0cmluZywgc3luZGljYXRpb246IHVua25vd24pIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XHJcbiAgICB0aGlzLnN5bmRpY2F0aW9uID0gc3luZGljYXRpb247XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKSB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcInBvc3NlLXB1Ymxpc2hlci1jb25maXJtLW1vZGFsXCIpO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlBPU1NFIFN0YXR1c1wiIH0pO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IGBOb3RlOiAke3RoaXMudGl0bGV9YCB9KTtcclxuXHJcbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuaXNBcnJheSh0aGlzLnN5bmRpY2F0aW9uKVxyXG4gICAgICA/ICh0aGlzLnN5bmRpY2F0aW9uIGFzIFN5bmRpY2F0aW9uRW50cnlbXSlcclxuICAgICAgOiBbXTtcclxuXHJcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgICAgdGV4dDogXCJUaGlzIG5vdGUgaGFzIG5vdCBiZWVuIFBPU1NFZCB0byBhbnkgZGVzdGluYXRpb24geWV0LlwiLFxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInN0cm9uZ1wiLCB7IHRleHQ6IGBTeW5kaWNhdGVkIHRvICR7ZW50cmllcy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpOmAgfSk7XHJcbiAgICAgIGNvbnN0IGxpc3QgPSBjb250ZW50RWwuY3JlYXRlRWwoXCJ1bFwiKTtcclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgY29uc3QgbGkgPSBsaXN0LmNyZWF0ZUVsKFwibGlcIik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnVybCkge1xyXG4gICAgICAgICAgY29uc3QgYSA9IGxpLmNyZWF0ZUVsKFwiYVwiLCB7IHRleHQ6IGVudHJ5Lm5hbWUgfHwgZW50cnkudXJsIH0pO1xyXG4gICAgICAgICAgYS5ocmVmID0gZW50cnkudXJsO1xyXG4gICAgICAgICAgYS50YXJnZXQgPSBcIl9ibGFua1wiO1xyXG4gICAgICAgICAgYS5yZWwgPSBcIm5vb3BlbmVyXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxpLnNldFRleHQoZW50cnkubmFtZSB8fCBcIlVua25vd25cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG4gICAgY29uc3QgY2xvc2VCdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDbG9zZVwiIH0pO1xyXG4gICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XHJcbiAgfVxyXG5cclxuICBvbkNsb3NlKCkge1xyXG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFXTztBQTZDUCxJQUFNLG1CQUEyQztBQUFBLEVBQy9DLGNBQWMsQ0FBQztBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2Ysc0JBQXNCO0FBQUEsRUFDdEIscUJBQXFCO0FBQ3ZCO0FBb0JBLFNBQVMsWUFBWSxTQUF5QjtBQUM1QyxRQUFNLFFBQVEsUUFBUSxNQUFNLDJDQUEyQztBQUN2RSxTQUFPLFFBQVEsTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJO0FBQ25DO0FBTUEsU0FBUyxpQkFBaUIsT0FBeUQ7QUFDakYsTUFBSSxDQUFDLE1BQU8sUUFBTyxDQUFDO0FBQ3BCLFFBQU0sS0FBa0IsQ0FBQztBQUV6QixNQUFJLE9BQU8sTUFBTSxVQUFVLFNBQVUsSUFBRyxRQUFRLE1BQU07QUFDdEQsTUFBSSxPQUFPLE1BQU0sU0FBUyxTQUFVLElBQUcsT0FBTyxNQUFNO0FBQ3BELE1BQUksT0FBTyxNQUFNLFlBQVksU0FBVSxJQUFHLFVBQVUsTUFBTTtBQUMxRCxNQUFJLE9BQU8sTUFBTSxTQUFTLFNBQVUsSUFBRyxPQUFPLE1BQU07QUFDcEQsTUFBSSxPQUFPLE1BQU0sV0FBVyxTQUFVLElBQUcsU0FBUyxNQUFNO0FBQ3hELE1BQUksT0FBTyxNQUFNLFdBQVcsU0FBVSxJQUFHLFNBQVMsTUFBTTtBQUN4RCxNQUFJLE9BQU8sTUFBTSxlQUFlLFNBQVUsSUFBRyxhQUFhLE1BQU07QUFDaEUsTUFBSSxPQUFPLE1BQU0sY0FBYyxTQUFVLElBQUcsWUFBWSxNQUFNO0FBQzlELE1BQUksT0FBTyxNQUFNLG9CQUFvQixTQUFVLElBQUcsa0JBQWtCLE1BQU07QUFDMUUsTUFBSSxPQUFPLE1BQU0sWUFBWSxTQUFVLElBQUcsVUFBVSxNQUFNO0FBQzFELE1BQUksT0FBTyxNQUFNLGFBQWEsU0FBVSxJQUFHLFdBQVcsTUFBTTtBQUU1RCxNQUFJLE9BQU8sTUFBTSxhQUFhLFVBQVcsSUFBRyxXQUFXLE1BQU07QUFBQSxXQUNwRCxNQUFNLGFBQWEsT0FBUSxJQUFHLFdBQVc7QUFFbEQsTUFBSSxNQUFNLFFBQVEsTUFBTSxJQUFJLEdBQUc7QUFDN0IsT0FBRyxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBZSxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUMzRSxXQUFXLE9BQU8sTUFBTSxTQUFTLFVBQVU7QUFDekMsT0FBRyxPQUFPLE1BQU0sS0FDYixRQUFRLFlBQVksRUFBRSxFQUN0QixNQUFNLEdBQUcsRUFDVCxJQUFJLENBQUMsTUFBYyxFQUFFLEtBQUssQ0FBQyxFQUMzQixPQUFPLE9BQU87QUFBQSxFQUNuQjtBQUVBLE1BQUksT0FBTyxNQUFNLGlCQUFpQixTQUFVLElBQUcsZUFBZSxNQUFNO0FBRXBFLFNBQU87QUFDVDtBQUdPLFNBQVMsT0FBTyxPQUF1QjtBQUM1QyxTQUFPLE1BQ0osVUFBVSxLQUFLLEVBQ2YsUUFBUSxvQkFBb0IsRUFBRSxFQUM5QixZQUFZLEVBQ1osUUFBUSxlQUFlLEdBQUcsRUFDMUIsUUFBUSxVQUFVLEVBQUU7QUFDekI7QUFNTyxTQUFTLGtCQUFrQixNQUFzQjtBQUV0RCxTQUFPLEtBQUssUUFBUSxpQkFBaUIsRUFBRTtBQUd2QyxTQUFPLEtBQUssUUFBUSxzQkFBc0IsRUFBRTtBQUc1QyxTQUFPLEtBQUssUUFBUSxnQ0FBZ0MsSUFBSTtBQUd4RCxTQUFPLEtBQUssUUFBUSxxQkFBcUIsSUFBSTtBQUc3QyxTQUFPLEtBQUssUUFBUSwyQkFBMkIsRUFBRTtBQUNqRCxTQUFPLEtBQUssUUFBUSw2QkFBNkIsRUFBRTtBQUduRCxTQUFPLEtBQUssUUFBUSxXQUFXLE1BQU07QUFFckMsU0FBTyxLQUFLLEtBQUs7QUFDbkI7QUFHQSxTQUFTLFdBQVcsS0FBcUI7QUFDdkMsU0FBTyxJQUNKLFFBQVEsTUFBTSxPQUFPLEVBQ3JCLFFBQVEsTUFBTSxNQUFNLEVBQ3BCLFFBQVEsTUFBTSxNQUFNLEVBQ3BCLFFBQVEsTUFBTSxRQUFRO0FBQzNCO0FBT08sU0FBUyxlQUFlLFVBQTBCO0FBQ3ZELE1BQUksT0FBTztBQUdYLFNBQU8sS0FBSztBQUFBLElBQVE7QUFBQSxJQUE0QixDQUFDLEdBQUcsTUFBTSxTQUN4RCxhQUFhLE9BQU8sb0JBQW9CLElBQUksTUFBTSxFQUFFLElBQUksV0FBVyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQUEsRUFDakY7QUFHQSxTQUFPLEtBQUssUUFBUSxtQkFBbUIsYUFBYTtBQUNwRCxTQUFPLEtBQUssUUFBUSxrQkFBa0IsYUFBYTtBQUNuRCxTQUFPLEtBQUssUUFBUSxpQkFBaUIsYUFBYTtBQUNsRCxTQUFPLEtBQUssUUFBUSxnQkFBZ0IsYUFBYTtBQUNqRCxTQUFPLEtBQUssUUFBUSxlQUFlLGFBQWE7QUFDaEQsU0FBTyxLQUFLLFFBQVEsY0FBYyxhQUFhO0FBRy9DLFNBQU8sS0FBSyxRQUFRLG9CQUFvQixNQUFNO0FBRzlDLFNBQU8sS0FBSyxRQUFRLGNBQWMsNkJBQTZCO0FBRy9ELFNBQU8sS0FBSyxRQUFRLHNCQUFzQiw4QkFBOEI7QUFDeEUsU0FBTyxLQUFLLFFBQVEsa0JBQWtCLHFCQUFxQjtBQUMzRCxTQUFPLEtBQUssUUFBUSxjQUFjLGFBQWE7QUFDL0MsU0FBTyxLQUFLLFFBQVEsZ0JBQWdCLDhCQUE4QjtBQUNsRSxTQUFPLEtBQUssUUFBUSxjQUFjLHFCQUFxQjtBQUN2RCxTQUFPLEtBQUssUUFBUSxZQUFZLGFBQWE7QUFHN0MsU0FBTyxLQUFLLFFBQVEsY0FBYyxpQkFBaUI7QUFHbkQsU0FBTyxLQUFLLFFBQVEsNkJBQTZCLHlCQUF5QjtBQUcxRSxTQUFPLEtBQUssUUFBUSw0QkFBNEIscUJBQXFCO0FBR3JFLFNBQU8sS0FBSyxRQUFRLGtCQUFrQixhQUFhO0FBR25ELFNBQU8sS0FBSyxRQUFRLGtCQUFrQixhQUFhO0FBR25ELFNBQU8sS0FBSyxRQUFRLDZCQUE2QixDQUFDLFVBQVUsT0FBTyxLQUFLLE9BQU87QUFHL0UsU0FBTyxLQUNKLE1BQU0sT0FBTyxFQUNiLElBQUksQ0FBQyxVQUFVO0FBQ2QsVUFBTSxVQUFVLE1BQU0sS0FBSztBQUMzQixRQUFJLENBQUMsUUFBUyxRQUFPO0FBQ3JCLFFBQUksd0NBQXdDLEtBQUssT0FBTyxFQUFHLFFBQU87QUFDbEUsV0FBTyxNQUFNLFFBQVEsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUFBLEVBQzdDLENBQUMsRUFDQSxPQUFPLE9BQU8sRUFDZCxLQUFLLElBQUk7QUFFWixTQUFPO0FBQ1Q7QUFNTyxTQUFTLG9CQUFvQixVQUEwQjtBQUM1RCxNQUFJLE9BQU87QUFFWCxTQUFPLEtBQUssUUFBUSwwQkFBMEIsSUFBSTtBQUVsRCxTQUFPLEtBQUssUUFBUSxjQUFjLEVBQUU7QUFFcEMsU0FBTyxLQUFLLFFBQVEsbUJBQW1CLEVBQUU7QUFFekMsU0FBTyxLQUFLLFFBQVEsY0FBYyxJQUFJO0FBRXRDLFNBQU8sS0FBSyxRQUFRLDJCQUEyQixJQUFJO0FBRW5ELFNBQU8sS0FBSyxRQUFRLDBCQUEwQixJQUFJO0FBRWxELFNBQU8sS0FBSyxRQUFRLFNBQVMsRUFBRTtBQUUvQixTQUFPLEtBQUssUUFBUSxnQkFBZ0IsRUFBRTtBQUV0QyxTQUFPLEtBQUssUUFBUSxvQkFBb0IsRUFBRTtBQUUxQyxTQUFPLEtBQUssUUFBUSxXQUFXLE1BQU07QUFDckMsU0FBTyxLQUFLLEtBQUs7QUFDbkI7QUFFQSxJQUFNLHVCQUF1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9CN0IsSUFBcUIsdUJBQXJCLGNBQWtELHVCQUFPO0FBQUEsRUFBekQ7QUFBQTtBQUNFLG9CQUFtQztBQUNuQyxTQUFRLGNBQWtDO0FBQUE7QUFBQSxFQUUxQyxNQUFNLFNBQVM7QUFDYixVQUFNLEtBQUssYUFBYTtBQUN4QixTQUFLLGdCQUFnQjtBQUVyQixTQUFLLGNBQWMsS0FBSyxpQkFBaUI7QUFFekMsU0FBSyxjQUFjLFFBQVEsaUJBQWlCLE1BQU07QUFDaEQsV0FBSyxtQkFBbUI7QUFBQSxJQUMxQixDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxtQkFBbUI7QUFBQSxJQUMxQyxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxtQkFBbUIsT0FBTztBQUFBLElBQ2pELENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLG1CQUFtQixXQUFXO0FBQUEsSUFDckQsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLENBQUMsV0FBVztBQUMxQixjQUFNLFVBQVUsT0FBTyxTQUFTO0FBQ2hDLFlBQUksUUFBUSxVQUFVLEVBQUUsV0FBVyxLQUFLLEdBQUc7QUFDekMsY0FBSSx1QkFBTyx5Q0FBeUM7QUFDcEQ7QUFBQSxRQUNGO0FBQ0EsZUFBTyxVQUFVLEdBQUcsQ0FBQztBQUNyQixlQUFPLGFBQWEsc0JBQXNCLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDO0FBRTVELGVBQU8sVUFBVSxHQUFHLENBQUM7QUFBQSxNQUN2QjtBQUFBLElBQ0YsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssV0FBVztBQUFBLElBQ2xDLENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxLQUFLLFlBQVk7QUFBQSxJQUNuQyxDQUFDO0FBRUQsU0FBSyxjQUFjLElBQUkseUJBQXlCLEtBQUssS0FBSyxJQUFJLENBQUM7QUFBQSxFQUNqRTtBQUFBLEVBRUEsV0FBVztBQUNULFNBQUssY0FBYztBQUFBLEVBQ3JCO0FBQUE7QUFBQSxFQUdRLGtCQUFrQjtBQUN4QixVQUFNLE1BQU0sS0FBSztBQUVqQixRQUFJLE9BQU8sSUFBSSxZQUFZLFlBQVksSUFBSSxTQUFTO0FBQ2xELFdBQUssU0FBUyxlQUFlO0FBQUEsUUFDM0I7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLEtBQUssSUFBSTtBQUFBLFVBQ1QsUUFBUyxJQUFJLFVBQXFCO0FBQUEsUUFDcEM7QUFBQSxNQUNGO0FBQ0EsYUFBTyxJQUFJO0FBQ1gsYUFBTyxJQUFJO0FBQ1gsV0FBSyxhQUFhO0FBQUEsSUFDcEI7QUFFQSxRQUFJLE1BQU0sUUFBUSxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sUUFBUSxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQzFFLFdBQUssU0FBUyxlQUFlLElBQUk7QUFDakMsYUFBTyxJQUFJO0FBQ1gsV0FBSyxhQUFhO0FBQUEsSUFDcEI7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLGVBQWU7QUFDbkIsU0FBSyxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsa0JBQWtCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFDekUsUUFBSSxDQUFDLE1BQU0sUUFBUSxLQUFLLFNBQVMsWUFBWSxHQUFHO0FBQzlDLFdBQUssU0FBUyxlQUFlLENBQUM7QUFBQSxJQUNoQztBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNuQixVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUFBLEVBRVEsbUJBQW1CLGdCQUF3QztBQUNqRSxVQUFNLEVBQUUsYUFBYSxJQUFJLEtBQUs7QUFDOUIsUUFBSSxhQUFhLFdBQVcsR0FBRztBQUM3QixVQUFJLHVCQUFPLDBEQUEwRDtBQUNyRTtBQUFBLElBQ0Y7QUFDQSxRQUFJLGFBQWEsV0FBVyxHQUFHO0FBQzdCLFdBQUssZUFBZSxhQUFhLENBQUMsR0FBRyxjQUFjO0FBQ25EO0FBQUEsSUFDRjtBQUNBLFFBQUksZ0JBQWdCLEtBQUssS0FBSyxjQUFjLENBQUMsU0FBUztBQUNwRCxXQUFLLGVBQWUsTUFBTSxjQUFjO0FBQUEsSUFDMUMsQ0FBQyxFQUFFLEtBQUs7QUFBQSxFQUNWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLE1BQWMsYUFDWixNQUNBLGdCQUNrQztBQUNsQyxVQUFNLFVBQVUsTUFBTSxLQUFLLElBQUksTUFBTSxXQUFXLElBQUk7QUFDcEQsVUFBTSxZQUFZLEtBQUssSUFBSSxjQUFjLGFBQWEsSUFBSTtBQUMxRCxVQUFNLGNBQWMsaUJBQWlCLFdBQVcsV0FBVztBQUMzRCxVQUFNLE9BQU8sWUFBWSxPQUFPO0FBQ2hDLFVBQU0sZ0JBQWdCLEtBQUssU0FBUyxzQkFBc0Isa0JBQWtCLElBQUksSUFBSTtBQUNwRixVQUFNLFFBQVEsWUFBWSxTQUFTLEtBQUssWUFBWTtBQUNwRCxVQUFNLE9BQU8sWUFBWSxRQUFRLE9BQU8sS0FBSztBQUM3QyxVQUFNLFNBQVMsa0JBQWtCLFlBQVksVUFBVSxLQUFLLFNBQVM7QUFDckUsVUFBTSxXQUFXLFlBQVksUUFBUTtBQUVyQyxVQUFNLGVBQ0osWUFBWSxpQkFDWCxLQUFLLFNBQVMsbUJBQ1gsR0FBRyxLQUFLLFNBQVMsaUJBQWlCLFFBQVEsT0FBTyxFQUFFLENBQUMsSUFBSSxRQUFRLElBQUksSUFBSSxLQUN4RTtBQUNOLFdBQU87QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLE1BQ0EsTUFBTTtBQUFBLE1BQ04sU0FBUyxZQUFZLFdBQVc7QUFBQSxNQUNoQyxNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsTUFBTSxZQUFZLFFBQVEsQ0FBQztBQUFBLE1BQzNCLFFBQVEsWUFBWSxVQUFVO0FBQUEsTUFDOUIsVUFBVSxZQUFZLFlBQVk7QUFBQSxNQUNsQyxZQUFZLFlBQVksY0FBYztBQUFBLE1BQ3RDLFdBQVcsWUFBWSxhQUFhO0FBQUEsTUFDcEMsaUJBQWlCLFlBQVksbUJBQW1CO0FBQUEsTUFDaEQsU0FBUyxZQUFZLFdBQVc7QUFBQSxNQUNoQyxVQUFVLFlBQVksWUFBWTtBQUFBLE1BQ2xDLEdBQUksZ0JBQWdCLEVBQUUsYUFBYTtBQUFBLElBQ3JDO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxlQUFlLGFBQTBCLGdCQUF3QztBQUM3RixVQUFNLE9BQU8sS0FBSyxJQUFJLFVBQVUsb0JBQW9CLDRCQUFZO0FBQ2hFLFFBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNO0FBQ3ZCLFVBQUksdUJBQU8sNEJBQTRCO0FBQ3ZDO0FBQUEsSUFDRjtBQUVBLFFBQUksQ0FBQyxLQUFLLG9CQUFvQixXQUFXLEdBQUc7QUFDMUMsVUFBSSx1QkFBTyw4QkFBOEIsWUFBWSxJQUFJLCtCQUErQjtBQUN4RjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFVBQVUsTUFBTSxLQUFLLGFBQWEsS0FBSyxNQUFNLGNBQWM7QUFFakUsUUFBSSxLQUFLLFNBQVMsc0JBQXNCO0FBQ3RDLFVBQUksb0JBQW9CLEtBQUssS0FBSyxTQUFTLGFBQWEsTUFBTTtBQUM1RCxhQUFLLHFCQUFxQixhQUFhLFNBQVMsS0FBSyxJQUFLO0FBQUEsTUFDNUQsQ0FBQyxFQUFFLEtBQUs7QUFBQSxJQUNWLE9BQU87QUFDTCxXQUFLLHFCQUFxQixhQUFhLFNBQVMsS0FBSyxJQUFJO0FBQUEsSUFDM0Q7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMscUJBQ1osYUFDQSxTQUNBLE1BQ0E7QUFDQSxZQUFRLFlBQVksTUFBTTtBQUFBLE1BQ3hCLEtBQUs7QUFDSCxlQUFPLEtBQUssZUFBZSxhQUFhLFNBQVMsSUFBSTtBQUFBLE1BQ3ZELEtBQUs7QUFDSCxlQUFPLEtBQUssa0JBQWtCLGFBQWEsU0FBUyxJQUFJO0FBQUEsTUFDMUQsS0FBSztBQUNILGVBQU8sS0FBSyxpQkFBaUIsYUFBYSxTQUFTLElBQUk7QUFBQSxNQUN6RCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0gsWUFBSSx1QkFBTyxHQUFHLFlBQVksSUFBSSxLQUFLLFlBQVksSUFBSSx1Q0FBdUM7QUFDMUY7QUFBQSxNQUNGO0FBQ0UsZUFBTyxLQUFLLG1CQUFtQixhQUFhLFNBQVMsSUFBSTtBQUFBLElBQzdEO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLG1CQUNaLGFBQ0EsU0FDQSxNQUNBO0FBQ0EsVUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBTSxTQUFTLFFBQVE7QUFDdkIsUUFBSTtBQUNGLFVBQUksdUJBQU8sYUFBYSxLQUFLLFlBQU8sWUFBWSxJQUFJLEtBQUs7QUFDekQsWUFBTSxNQUFNLEdBQUcsWUFBWSxJQUFJLFFBQVEsT0FBTyxFQUFFLENBQUM7QUFDakQsWUFBTSxXQUFXLFVBQU0sNEJBQVc7QUFBQSxRQUNoQztBQUFBLFFBQ0EsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsZ0JBQWdCO0FBQUEsVUFDaEIsaUJBQWlCLFlBQVk7QUFBQSxRQUMvQjtBQUFBLFFBQ0EsTUFBTSxLQUFLLFVBQVUsT0FBTztBQUFBLE1BQzlCLENBQUM7QUFDRCxVQUFJLFNBQVMsVUFBVSxPQUFPLFNBQVMsU0FBUyxLQUFLO0FBQ25ELFlBQUksT0FBTztBQUNYLFlBQUk7QUFBRSxjQUFJLFNBQVMsTUFBTSxTQUFVLFFBQU87QUFBQSxRQUFXLFFBQVE7QUFBQSxRQUFpQjtBQUM5RSxZQUFJLHVCQUFPLEdBQUcsSUFBSSxLQUFLLEtBQUssUUFBUSxZQUFZLElBQUksT0FBTyxNQUFNLEVBQUU7QUFDbkUsYUFBSyxxQkFBcUIsWUFBWSxJQUFJO0FBQzFDLFlBQUk7QUFDSixZQUFJO0FBQ0YsMkJBQWlCLFNBQVMsTUFBTSxPQUM5QixHQUFHLFlBQVksSUFBSSxRQUFRLE9BQU8sRUFBRSxDQUFDLElBQUksUUFBUSxJQUFjO0FBQUEsUUFDbkUsUUFBUTtBQUNOLDJCQUFpQixHQUFHLFlBQVksSUFBSSxRQUFRLE9BQU8sRUFBRSxDQUFDLElBQUksUUFBUSxJQUFjO0FBQUEsUUFDbEY7QUFDQSxjQUFNLEtBQUssaUJBQWlCLE1BQU0sWUFBWSxNQUFNLGNBQWM7QUFBQSxNQUNwRSxPQUFPO0FBQ0wsWUFBSTtBQUNKLFlBQUk7QUFBRSx3QkFBYyxTQUFTLE1BQU0sU0FBUyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUcsUUFDL0Q7QUFBRSx3QkFBYyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUc7QUFDL0MsWUFBSSx1QkFBTyxZQUFZLFlBQVksSUFBSSxZQUFZLFdBQVcsRUFBRTtBQUFBLE1BQ2xFO0FBQUEsSUFDRixTQUFTLEtBQUs7QUFDWixVQUFJLHVCQUFPLGdCQUFnQixZQUFZLElBQUksTUFBTSxlQUFlLFFBQVEsSUFBSSxVQUFVLGVBQWUsRUFBRTtBQUFBLElBQ3pHO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLGVBQ1osYUFDQSxTQUNBLE1BQ0E7QUFDQSxVQUFNLFFBQVEsUUFBUTtBQUN0QixRQUFJO0FBQ0YsVUFBSSx1QkFBTyxhQUFhLEtBQUssb0JBQWUsWUFBWSxJQUFJLE1BQU07QUFDbEUsWUFBTSxRQUFTLFFBQVEsUUFBcUIsQ0FBQyxHQUMxQyxNQUFNLEdBQUcsQ0FBQyxFQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsY0FBYyxFQUFFLENBQUM7QUFDdkQsWUFBTSxVQUFtQztBQUFBLFFBQ3ZDO0FBQUEsUUFDQSxlQUFlLFFBQVE7QUFBQSxRQUN2QixXQUFXLFFBQVEsV0FBVztBQUFBLFFBQzlCO0FBQUEsUUFDQSxhQUFjLFFBQVEsV0FBc0I7QUFBQSxNQUM5QztBQUNBLFVBQUksUUFBUSxhQUFjLFNBQVEsZ0JBQWdCLFFBQVE7QUFDMUQsVUFBSSxRQUFRLFdBQVksU0FBUSxhQUFhLFFBQVE7QUFDckQsWUFBTSxXQUFXLFVBQU0sNEJBQVc7QUFBQSxRQUNoQyxLQUFLO0FBQUEsUUFDTCxRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsVUFDUCxnQkFBZ0I7QUFBQSxVQUNoQixXQUFXLFlBQVk7QUFBQSxRQUN6QjtBQUFBLFFBQ0EsTUFBTSxLQUFLLFVBQVUsRUFBRSxRQUFRLENBQUM7QUFBQSxNQUNsQyxDQUFDO0FBQ0QsVUFBSSxTQUFTLFVBQVUsT0FBTyxTQUFTLFNBQVMsS0FBSztBQUNuRCxjQUFNLGFBQXFCLFNBQVMsTUFBTSxPQUFPO0FBQ2pELFlBQUksdUJBQU8sV0FBVyxLQUFLLGFBQWE7QUFDeEMsYUFBSyxxQkFBcUIsUUFBUTtBQUNsQyxjQUFNLEtBQUssaUJBQWlCLE1BQU0sWUFBWSxNQUFNLFVBQVU7QUFBQSxNQUNoRSxPQUFPO0FBQ0wsWUFBSTtBQUNKLFlBQUk7QUFBRSx3QkFBYyxTQUFTLE1BQU0sU0FBUyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUcsUUFDL0Q7QUFBRSx3QkFBYyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUc7QUFDL0MsWUFBSSx1QkFBTyx3QkFBd0IsV0FBVyxFQUFFO0FBQUEsTUFDbEQ7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLFVBQUksdUJBQU8saUJBQWlCLGVBQWUsUUFBUSxJQUFJLFVBQVUsZUFBZSxFQUFFO0FBQUEsSUFDcEY7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsa0JBQ1osYUFDQSxTQUNBLE1BQ0E7QUFDQSxVQUFNLFFBQVEsUUFBUTtBQUN0QixRQUFJO0FBQ0YsVUFBSSx1QkFBTyxhQUFhLEtBQUssc0JBQWlCLFlBQVksSUFBSSxNQUFNO0FBQ3BFLFlBQU0sVUFBVyxRQUFRLFdBQXNCO0FBQy9DLFlBQU0sZUFBZ0IsUUFBUSxnQkFBMkI7QUFDekQsWUFBTSxhQUFhLENBQUMsT0FBTyxTQUFTLFlBQVksRUFBRSxPQUFPLE9BQU8sRUFBRSxLQUFLLE1BQU07QUFDN0UsWUFBTSxlQUFlLFlBQVksZUFBZSxJQUFJLFFBQVEsT0FBTyxFQUFFO0FBQ3JFLFlBQU0sV0FBVyxVQUFNLDRCQUFXO0FBQUEsUUFDaEMsS0FBSyxHQUFHLFdBQVc7QUFBQSxRQUNuQixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsVUFDUCxnQkFBZ0I7QUFBQSxVQUNoQixpQkFBaUIsVUFBVSxZQUFZLFdBQVc7QUFBQSxRQUNwRDtBQUFBLFFBQ0EsTUFBTSxLQUFLLFVBQVUsRUFBRSxRQUFRLFlBQVksWUFBWSxTQUFTLENBQUM7QUFBQSxNQUNuRSxDQUFDO0FBQ0QsVUFBSSxTQUFTLFVBQVUsT0FBTyxTQUFTLFNBQVMsS0FBSztBQUNuRCxjQUFNLFlBQW9CLFNBQVMsTUFBTSxPQUFPO0FBQ2hELFlBQUksdUJBQU8sV0FBVyxLQUFLLGVBQWU7QUFDMUMsYUFBSyxxQkFBcUIsVUFBVTtBQUNwQyxjQUFNLEtBQUssaUJBQWlCLE1BQU0sWUFBWSxNQUFNLFNBQVM7QUFBQSxNQUMvRCxPQUFPO0FBQ0wsWUFBSTtBQUNKLFlBQUk7QUFBRSx3QkFBYyxTQUFTLE1BQU0sU0FBUyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUcsUUFDL0Q7QUFBRSx3QkFBYyxPQUFPLFNBQVMsTUFBTTtBQUFBLFFBQUc7QUFDL0MsWUFBSSx1QkFBTywwQkFBMEIsV0FBVyxFQUFFO0FBQUEsTUFDcEQ7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLFVBQUksdUJBQU8sbUJBQW1CLGVBQWUsUUFBUSxJQUFJLFVBQVUsZUFBZSxFQUFFO0FBQUEsSUFDdEY7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQWMsaUJBQ1osYUFDQSxTQUNBLE1BQ0E7QUFDQSxVQUFNLFFBQVEsUUFBUTtBQUN0QixRQUFJO0FBQ0YsVUFBSSx1QkFBTyxhQUFhLEtBQUsscUJBQWdCLFlBQVksSUFBSSxNQUFNO0FBR25FLFlBQU0sZUFBZSxVQUFNLDRCQUFXO0FBQUEsUUFDcEMsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxRQUM5QyxNQUFNLEtBQUssVUFBVTtBQUFBLFVBQ25CLFlBQVksWUFBWTtBQUFBLFVBQ3hCLFVBQVUsWUFBWTtBQUFBLFFBQ3hCLENBQUM7QUFBQSxNQUNILENBQUM7QUFDRCxVQUFJLGFBQWEsU0FBUyxPQUFPLGFBQWEsVUFBVSxLQUFLO0FBQzNELFlBQUksdUJBQU8sd0JBQXdCLGFBQWEsTUFBTSxFQUFFO0FBQ3hEO0FBQUEsTUFDRjtBQUNBLFlBQU0sRUFBRSxLQUFLLFVBQVUsSUFBSSxhQUFhO0FBR3hDLFlBQU0sZUFBZ0IsUUFBUSxnQkFBMkI7QUFDekQsWUFBTSxVQUFXLFFBQVEsV0FBc0I7QUFDL0MsWUFBTSxXQUFXLENBQUMsT0FBTyxPQUFPLEVBQUUsT0FBTyxPQUFPLEVBQUUsS0FBSyxVQUFLO0FBQzVELFlBQU0sVUFBVSxPQUFPLGVBQWUsYUFBYSxTQUFTLElBQUk7QUFDaEUsWUFBTSxRQUFRLFNBQVMsU0FBUyxVQUM1QixTQUFTLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxXQUNyQyxhQUNDLGVBQWUsSUFBSSxZQUFZLEtBQUs7QUFFekMsWUFBTSxhQUFzQztBQUFBLFFBQzFDLE9BQU87QUFBQSxRQUNQO0FBQUEsUUFDQSxZQUFXLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQUEsUUFDbEMsT0FBTyxDQUFDLElBQUk7QUFBQSxNQUNkO0FBQ0EsVUFBSSxjQUFjO0FBQ2hCLGNBQU0sV0FBVyxLQUFLLFlBQVksWUFBWTtBQUM5QyxtQkFBVyxTQUFTLENBQUM7QUFBQSxVQUNuQixPQUFPO0FBQUEsWUFBRSxXQUFXLElBQUksWUFBWSxFQUFFLE9BQU8sS0FBSyxVQUFVLEdBQUcsUUFBUSxDQUFDLEVBQUU7QUFBQSxZQUNqRSxTQUFXLElBQUksWUFBWSxFQUFFLE9BQU8sS0FBSyxVQUFVLEdBQUcsV0FBVyxhQUFhLE1BQU0sQ0FBQyxFQUFFO0FBQUEsVUFBTztBQUFBLFVBQ3ZHLFVBQVUsQ0FBQyxFQUFFLE9BQU8sZ0NBQWdDLEtBQUssYUFBYSxDQUFDO0FBQUEsUUFDekUsQ0FBQztBQUFBLE1BQ0g7QUFFQSxZQUFNLGlCQUFpQixVQUFNLDRCQUFXO0FBQUEsUUFDdEMsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsZ0JBQWdCO0FBQUEsVUFDaEIsaUJBQWlCLFVBQVUsU0FBUztBQUFBLFFBQ3RDO0FBQUEsUUFDQSxNQUFNLEtBQUssVUFBVTtBQUFBLFVBQ25CLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFBQSxNQUNILENBQUM7QUFDRCxVQUFJLGVBQWUsVUFBVSxPQUFPLGVBQWUsU0FBUyxLQUFLO0FBQy9ELGNBQU0sTUFBYyxlQUFlLE1BQU0sT0FBTztBQUNoRCxjQUFNLFVBQVUsTUFDWiw0QkFBNEIsWUFBWSxNQUFNLFNBQVMsSUFBSSxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FDM0U7QUFDSixZQUFJLHVCQUFPLFdBQVcsS0FBSyxjQUFjO0FBQ3pDLGFBQUsscUJBQXFCLFNBQVM7QUFDbkMsY0FBTSxLQUFLLGlCQUFpQixNQUFNLFlBQVksTUFBTSxPQUFPO0FBQUEsTUFDN0QsT0FBTztBQUNMLFlBQUk7QUFDSixZQUFJO0FBQUUsd0JBQWMsT0FBTyxlQUFlLE1BQU0sV0FBVyxlQUFlLE1BQU07QUFBQSxRQUFHLFFBQzdFO0FBQUUsd0JBQWMsT0FBTyxlQUFlLE1BQU07QUFBQSxRQUFHO0FBQ3JELFlBQUksdUJBQU8seUJBQXlCLFdBQVcsRUFBRTtBQUFBLE1BQ25EO0FBQUEsSUFDRixTQUFTLEtBQUs7QUFDWixVQUFJLHVCQUFPLGtCQUFrQixlQUFlLFFBQVEsSUFBSSxVQUFVLGVBQWUsRUFBRTtBQUFBLElBQ3JGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxNQUFjLFdBQVcsZ0JBQXdDO0FBQy9ELFVBQU0sRUFBRSxhQUFhLElBQUksS0FBSztBQUM5QixRQUFJLGFBQWEsV0FBVyxHQUFHO0FBQzdCLFVBQUksdUJBQU8sMERBQTBEO0FBQ3JFO0FBQUEsSUFDRjtBQUNBLFVBQU0sT0FBTyxLQUFLLElBQUksVUFBVSxvQkFBb0IsNEJBQVk7QUFDaEUsUUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLE1BQU07QUFDdkIsVUFBSSx1QkFBTyw0QkFBNEI7QUFDdkM7QUFBQSxJQUNGO0FBQ0EsVUFBTSxVQUFVLE1BQU0sS0FBSyxhQUFhLEtBQUssTUFBTSxjQUFjO0FBQ2pFLFFBQUksdUJBQU8sYUFBYSxRQUFRLEtBQUssUUFBUSxhQUFhLE1BQU0sb0JBQW9CO0FBQ3BGLGVBQVcsUUFBUSxjQUFjO0FBQy9CLFVBQUksS0FBSyxvQkFBb0IsSUFBSSxHQUFHO0FBQ2xDLGNBQU0sS0FBSyxxQkFBcUIsTUFBTSxTQUFTLEtBQUssSUFBSTtBQUFBLE1BQzFELE9BQU87QUFDTCxZQUFJLHVCQUFPLGFBQWEsS0FBSyxJQUFJLHFDQUFnQztBQUFBLE1BQ25FO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0Esb0JBQW9CLE1BQTRCO0FBQzlDLFlBQVEsS0FBSyxNQUFNO0FBQUEsTUFDakIsS0FBSztBQUFZLGVBQU8sQ0FBQyxDQUFDLEtBQUs7QUFBQSxNQUMvQixLQUFLO0FBQVksZUFBTyxDQUFDLEVBQUUsS0FBSyxlQUFlLEtBQUs7QUFBQSxNQUNwRCxLQUFLO0FBQVksZUFBTyxDQUFDLEVBQUUsS0FBSyxVQUFVLEtBQUs7QUFBQSxNQUMvQyxLQUFLO0FBQVksZUFBTyxDQUFDLENBQUMsS0FBSztBQUFBLE1BQy9CLEtBQUs7QUFBWSxlQUFPLENBQUMsRUFBRSxLQUFLLGtCQUFrQixLQUFLLHNCQUFzQixLQUFLO0FBQUEsTUFDbEYsS0FBSztBQUFZLGVBQU8sQ0FBQyxFQUFFLEtBQUssaUJBQWlCLEtBQUs7QUFBQSxNQUN0RCxLQUFLO0FBQVksZUFBTyxDQUFDLEVBQUUsS0FBSyx1QkFBdUIsS0FBSztBQUFBLE1BQzVELEtBQUs7QUFBWSxlQUFPLENBQUMsRUFBRSxLQUFLLGdCQUFnQixLQUFLO0FBQUEsTUFDckQ7QUFBaUIsZUFBTyxDQUFDLEVBQUUsS0FBSyxPQUFPLEtBQUs7QUFBQSxJQUM5QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBYyxpQkFBaUIsTUFBYSxNQUFjLEtBQWE7QUFDckUsVUFBTSxLQUFLLElBQUksWUFBWSxtQkFBbUIsTUFBTSxDQUFDLE9BQU87QUFDMUQsVUFBSSxDQUFDLE1BQU0sUUFBUSxHQUFHLFdBQVcsRUFBRyxJQUFHLGNBQWMsQ0FBQztBQUN0RCxZQUFNLFVBQVUsR0FBRztBQUNuQixZQUFNLFdBQVcsUUFBUSxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsSUFBSTtBQUNwRCxVQUFJLFVBQVU7QUFDWixpQkFBUyxNQUFNO0FBQUEsTUFDakIsT0FBTztBQUNMLGdCQUFRLEtBQUssRUFBRSxLQUFLLEtBQUssQ0FBQztBQUFBLE1BQzVCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEscUJBQXFCLFVBQWtCO0FBQzdDLFFBQUksQ0FBQyxLQUFLLFlBQWE7QUFDdkIsU0FBSyxZQUFZLFFBQVEsaUJBQVksUUFBUSxFQUFFO0FBQy9DLFdBQU8sV0FBVyxNQUFNO0FBQ3RCLFVBQUksS0FBSyxZQUFhLE1BQUssWUFBWSxRQUFRLEVBQUU7QUFBQSxJQUNuRCxHQUFHLEdBQUk7QUFBQSxFQUNUO0FBQUE7QUFBQSxFQUdRLGNBQWM7QUFDcEIsVUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw0QkFBWTtBQUNoRSxRQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTTtBQUN2QixVQUFJLHVCQUFPLDRCQUE0QjtBQUN2QztBQUFBLElBQ0Y7QUFDQSxVQUFNLFlBQVksS0FBSyxJQUFJLGNBQWMsYUFBYSxLQUFLLElBQUk7QUFDL0QsVUFBTSxjQUFjLFdBQVcsYUFBYTtBQUM1QyxVQUFNLFFBQVEsV0FBVyxhQUFhLFNBQVMsS0FBSyxLQUFLO0FBQ3pELFFBQUksaUJBQWlCLEtBQUssS0FBSyxPQUFPLFdBQVcsRUFBRSxLQUFLO0FBQUEsRUFDMUQ7QUFDRjtBQUlBLElBQU0sc0JBQU4sY0FBa0Msc0JBQU07QUFBQSxFQUt0QyxZQUNFLEtBQ0EsU0FDQSxhQUNBLFdBQ0E7QUFDQSxVQUFNLEdBQUc7QUFDVCxTQUFLLFVBQVU7QUFDZixTQUFLLGNBQWM7QUFDbkIsU0FBSyxZQUFZO0FBQUEsRUFDbkI7QUFBQSxFQUVBLFNBQVM7QUFDUCxVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsU0FBUywrQkFBK0I7QUFFbEQsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xELGNBQVUsU0FBUyxLQUFLO0FBQUEsTUFDdEIsTUFBTSw2QkFBNkIsS0FBSyxZQUFZLElBQUk7QUFBQSxJQUMxRCxDQUFDO0FBRUQsVUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDOUQsWUFBUSxTQUFTLE9BQU8sRUFBRSxNQUFNLFVBQVUsS0FBSyxRQUFRLEtBQUssR0FBRyxDQUFDO0FBQ2hFLFlBQVEsU0FBUyxPQUFPLEVBQUUsTUFBTSxTQUFTLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQztBQUM5RCxZQUFRLFNBQVMsT0FBTyxFQUFFLE1BQU0sV0FBVyxLQUFLLFFBQVEsTUFBTSxHQUFHLENBQUM7QUFDbEUsWUFBUSxTQUFTLE9BQU8sRUFBRSxNQUFNLFNBQVMsS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDO0FBRTlELFVBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBRXJFLFVBQU0sWUFBWSxRQUFRLFNBQVMsVUFBVSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQy9ELGNBQVUsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUV0RCxVQUFNLGFBQWEsUUFBUSxTQUFTLFVBQVU7QUFBQSxNQUM1QyxNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQ0QsZUFBVyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3pDLFdBQUssTUFBTTtBQUNYLFdBQUssVUFBVTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxVQUFVO0FBQ1IsU0FBSyxVQUFVLE1BQU07QUFBQSxFQUN2QjtBQUNGO0FBSUEsSUFBTSxrQkFBTixjQUE4Qiw2QkFBMEI7QUFBQSxFQUl0RCxZQUFZLEtBQVUsY0FBNkIsVUFBOEM7QUFDL0YsVUFBTSxHQUFHO0FBQ1QsU0FBSyxlQUFlO0FBQ3BCLFNBQUssV0FBVztBQUNoQixTQUFLLGVBQWUscUNBQXFDO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLGVBQWUsT0FBOEI7QUFDM0MsVUFBTSxRQUFRLE1BQU0sWUFBWTtBQUNoQyxXQUFPLEtBQUssYUFBYTtBQUFBLE1BQ3ZCLENBQUMsTUFDQyxFQUFFLEtBQUssWUFBWSxFQUFFLFNBQVMsS0FBSyxLQUNuQyxFQUFFLElBQUksWUFBWSxFQUFFLFNBQVMsS0FBSztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBRUEsaUJBQWlCLGFBQTBCLElBQWlCO0FBQzFELE9BQUcsU0FBUyxPQUFPLEVBQUUsTUFBTSxZQUFZLE1BQU0sS0FBSyxtQkFBbUIsQ0FBQztBQUN0RSxPQUFHLFNBQVMsU0FBUyxFQUFFLE1BQU0sWUFBWSxLQUFLLEtBQUssa0JBQWtCLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBRUEsbUJBQW1CLGFBQTBCO0FBQzNDLFNBQUssU0FBUyxXQUFXO0FBQUEsRUFDM0I7QUFDRjtBQUlBLElBQU0sMkJBQU4sY0FBdUMsaUNBQWlCO0FBQUEsRUFHdEQsWUFBWSxLQUFVLFFBQThCO0FBQ2xELFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFDeEIsZ0JBQVksTUFBTTtBQUVsQixnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTFELFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLG9CQUFvQixFQUM1QixRQUFRLHVIQUFrSCxFQUMxSDtBQUFBLE1BQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxzQkFBc0IsRUFDckMsU0FBUyxLQUFLLE9BQU8sU0FBUyxnQkFBZ0IsRUFDOUMsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsbUJBQW1CO0FBQ3hDLFlBQUksU0FBUyxDQUFDLE1BQU0sV0FBVyxVQUFVLEtBQUssQ0FBQyxNQUFNLFdBQVcsa0JBQWtCLEdBQUc7QUFDbkYsY0FBSSx1QkFBTyx3REFBd0Q7QUFBQSxRQUNyRTtBQUNBLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUVGLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5ELFNBQUssT0FBTyxTQUFTLGFBQWEsUUFBUSxDQUFDLGFBQWEsVUFBVTtBQUNoRSxZQUFNLGdCQUFnQixZQUFZLFVBQVU7QUFBQSxRQUMxQyxLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQ0Qsb0JBQWMsU0FBUyxNQUFNO0FBQUEsUUFDM0IsTUFBTSxZQUFZLFFBQVEsZUFBZSxRQUFRLENBQUM7QUFBQSxNQUNwRCxDQUFDO0FBRUQsVUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsa0JBQWtCLEVBQzFCLFFBQVEsNkNBQTZDLEVBQ3JEO0FBQUEsUUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLFNBQVMsRUFDeEIsU0FBUyxZQUFZLElBQUksRUFDekIsU0FBUyxPQUFPLFVBQVU7QUFDekIsZUFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsT0FBTztBQUNoRCxnQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFFBQ2pDLENBQUM7QUFBQSxNQUNMO0FBRUYsVUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsTUFBTSxFQUNkLFFBQVEsd0JBQXdCLEVBQ2hDO0FBQUEsUUFBWSxDQUFDLE9BQ1osR0FDRyxVQUFVLGNBQWMsWUFBWSxFQUNwQyxVQUFVLFNBQVMsUUFBUSxFQUMzQixVQUFVLFlBQVksVUFBVSxFQUNoQyxVQUFVLFdBQVcsU0FBUyxFQUM5QixVQUFVLFVBQVUsUUFBUSxFQUM1QixVQUFVLFVBQVUsUUFBUSxFQUM1QixVQUFVLFdBQVcsU0FBUyxFQUM5QixVQUFVLFlBQVksVUFBVSxFQUNoQyxVQUFVLFVBQVUsZUFBZSxFQUNuQyxTQUFTLFlBQVksUUFBUSxZQUFZLEVBQ3pDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGVBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLE9BQU87QUFDaEQsZ0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFDL0IsZUFBSyxRQUFRO0FBQUEsUUFDZixDQUFDO0FBQUEsTUFDTDtBQUVGLFlBQU0sV0FBVyxZQUFZLFFBQVE7QUFFckMsVUFBSSxhQUFhLGNBQWM7QUFDN0IsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsVUFBVSxFQUNsQixRQUFRLGlEQUFpRCxFQUN6RDtBQUFBLFVBQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxxQkFBcUIsRUFDcEMsU0FBUyxZQUFZLE9BQU8sRUFBRSxFQUM5QixTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsTUFBTTtBQUMvQyxnQkFBSSxTQUFTLENBQUMsTUFBTSxXQUFXLFVBQVUsS0FBSyxDQUFDLE1BQU0sV0FBVyxrQkFBa0IsR0FBRztBQUNuRixrQkFBSSx1QkFBTyxxREFBcUQ7QUFBQSxZQUNsRTtBQUNBLGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFDRixZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxTQUFTLEVBQ2pCLFFBQVEsOENBQThDLEVBQ3RELFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLGVBQ0csZUFBZSxlQUFlLEVBQzlCLFNBQVMsWUFBWSxVQUFVLEVBQUUsRUFDakMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLFNBQVM7QUFDbEQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQUEsTUFDTCxXQUFXLGFBQWEsU0FBUztBQUMvQixZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxnQkFBZ0IsRUFDeEIsUUFBUSx5Q0FBeUMsRUFDakQsUUFBUSxDQUFDLFNBQVM7QUFDakIsZUFDRyxlQUFlLHNCQUFzQixFQUNyQyxTQUFTLFlBQVksVUFBVSxFQUFFLEVBQ2pDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxTQUFTO0FBQ2xELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUFBLE1BQ0wsV0FBVyxhQUFhLFlBQVk7QUFDbEMsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsY0FBYyxFQUN0QixRQUFRLHVEQUF1RCxFQUMvRDtBQUFBLFVBQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSx5QkFBeUIsRUFDeEMsU0FBUyxZQUFZLGVBQWUsRUFBRSxFQUN0QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsY0FBYztBQUN2RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQ0YsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsY0FBYyxFQUN0QixRQUFRLGdGQUFzRSxFQUM5RSxRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsb0JBQW9CLEVBQ25DLFNBQVMsWUFBWSxlQUFlLEVBQUUsRUFDdEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGNBQWM7QUFDdkQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQUEsTUFDTCxXQUFXLGFBQWEsV0FBVztBQUNqQyxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxnQkFBZ0IsRUFDeEIsUUFBUSx5Q0FBeUMsRUFDakQ7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsc0JBQXNCLEVBQ3JDLFNBQVMsWUFBWSxVQUFVLEVBQUUsRUFDakMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLFNBQVM7QUFDbEQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQUEsUUFDTDtBQUNGLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGNBQWMsRUFDdEIsUUFBUSw2RUFBd0UsRUFDaEYsUUFBUSxDQUFDLFNBQVM7QUFDakIsZUFDRyxlQUFlLHFCQUFxQixFQUNwQyxTQUFTLFlBQVksZUFBZSxFQUFFLEVBQ3RDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxjQUFjO0FBQ3ZELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUFBLE1BQ0wsV0FBVyxhQUFhLFVBQVU7QUFDaEMsc0JBQWMsU0FBUyxLQUFLO0FBQUEsVUFDMUIsTUFBTTtBQUFBLFVBQ04sS0FBSztBQUFBLFFBQ1AsQ0FBQztBQUNELFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLG1CQUFtQixFQUMzQixRQUFRLG9GQUFxRSxFQUM3RSxRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsZ0NBQWdDLEVBQy9DLFNBQVMsWUFBWSxlQUFlLEVBQUUsRUFDdEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGNBQWM7QUFDdkQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQUEsTUFDTCxXQUFXLGFBQWEsVUFBVTtBQUNoQyxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxXQUFXLEVBQ25CLFFBQVEsOERBQTJELEVBQ25FO0FBQUEsVUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLFdBQVcsRUFDMUIsU0FBUyxZQUFZLGtCQUFrQixFQUFFLEVBQ3pDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxpQkFBaUI7QUFDMUQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQUEsUUFDTDtBQUNGLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGVBQWUsRUFDdkIsUUFBUSxDQUFDLFNBQVM7QUFDakIsZUFDRyxlQUFlLGVBQWUsRUFDOUIsU0FBUyxZQUFZLHNCQUFzQixFQUFFLEVBQzdDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxxQkFBcUI7QUFDOUQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQ0gsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsZUFBZSxFQUN2QixRQUFRLDhDQUE4QyxFQUN0RCxRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsZUFBZSxFQUM5QixTQUFTLFlBQVksc0JBQXNCLEVBQUUsRUFDN0MsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLHFCQUFxQjtBQUM5RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFDSCxlQUFLLFFBQVEsT0FBTztBQUNwQixlQUFLLFFBQVEsZUFBZTtBQUFBLFFBQzlCLENBQUM7QUFDSCxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxpQkFBaUIsRUFDekI7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsWUFBWSxFQUMzQixTQUFTLFlBQVksa0JBQWtCLEVBQUUsRUFDekMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGlCQUFpQjtBQUMxRCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQ0YsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsbUJBQW1CLEVBQzNCLFFBQVEsK0VBQTRFLEVBQ3BGO0FBQUEsVUFBUSxDQUFDLFNBQ1IsS0FDRyxlQUFlLGlCQUFpQixFQUNoQyxTQUFTLFlBQVksMEJBQTBCLEVBQUUsRUFDakQsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLHlCQUF5QjtBQUNsRSxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQUEsTUFDSixXQUFXLGFBQWEsV0FBVztBQUNqQyxZQUFJLHdCQUFRLGFBQWEsRUFDdEIsUUFBUSxpQkFBaUIsRUFDekIsUUFBUSx3Q0FBd0MsRUFDaEQ7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsV0FBVyxFQUMxQixTQUFTLFlBQVksaUJBQWlCLEVBQUUsRUFDeEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGdCQUFnQjtBQUN6RCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNMO0FBQ0YsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsY0FBYyxFQUN0QixRQUFRLHlFQUF5RSxFQUNqRixRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsb0JBQW9CLEVBQ25DLFNBQVMsWUFBWSxzQkFBc0IsRUFBRSxFQUM3QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUscUJBQXFCO0FBQzlELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUFBLE1BQ0wsV0FBVyxhQUFhLFlBQVk7QUFDbEMsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsY0FBYyxFQUN0QixRQUFRLGdEQUFnRCxFQUN4RCxRQUFRLENBQUMsU0FBUztBQUNqQixlQUNHLGVBQWUsb0JBQW9CLEVBQ25DLFNBQVMsWUFBWSx1QkFBdUIsRUFBRSxFQUM5QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsc0JBQXNCO0FBQy9ELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUNILGVBQUssUUFBUSxPQUFPO0FBQ3BCLGVBQUssUUFBUSxlQUFlO0FBQUEsUUFDOUIsQ0FBQztBQUNILFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLFlBQVksRUFDcEIsUUFBUSxxREFBcUQsRUFDN0Q7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsbUJBQW1CLEVBQ2xDLFNBQVMsWUFBWSxxQkFBcUIsRUFBRSxFQUM1QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsb0JBQW9CO0FBQzdELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFBQSxNQUNKLFdBQVcsYUFBYSxVQUFVO0FBQ2hDLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGVBQWUsRUFDdkIsUUFBUSwyQ0FBMkMsRUFDbkQ7QUFBQSxVQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsY0FBYyxFQUM3QixTQUFTLFlBQVksZ0JBQWdCLEVBQUUsRUFDdkMsU0FBUyxPQUFPLFVBQVU7QUFDekIsaUJBQUssT0FBTyxTQUFTLGFBQWEsS0FBSyxFQUFFLGVBQWU7QUFDeEQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQUEsUUFDTDtBQUNGLFlBQUksd0JBQVEsYUFBYSxFQUN0QixRQUFRLGFBQWEsRUFDckIsUUFBUSw2REFBNkQsRUFDckUsUUFBUSxDQUFDLFNBQVM7QUFDakIsZUFDRyxlQUFlLE9BQU8sRUFDdEIsU0FBUyxZQUFZLGtCQUFrQixFQUFFLEVBQ3pDLFNBQVMsT0FBTyxVQUFVO0FBQ3pCLGlCQUFLLE9BQU8sU0FBUyxhQUFhLEtBQUssRUFBRSxpQkFBaUI7QUFDMUQsa0JBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxVQUNqQyxDQUFDO0FBQ0gsZUFBSyxRQUFRLE9BQU87QUFDcEIsZUFBSyxRQUFRLGVBQWU7QUFBQSxRQUM5QixDQUFDO0FBQ0gsWUFBSSx3QkFBUSxhQUFhLEVBQ3RCLFFBQVEsV0FBVyxFQUNuQixRQUFRLDBEQUEwRCxFQUNsRTtBQUFBLFVBQVEsQ0FBQyxTQUNSLEtBQ0csZUFBZSxhQUFhLEVBQzVCLFNBQVMsWUFBWSxpQkFBaUIsRUFBRSxFQUN4QyxTQUFTLE9BQU8sVUFBVTtBQUN6QixpQkFBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLEVBQUUsZ0JBQWdCO0FBQ3pELGtCQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0w7QUFBQSxNQUNKO0FBRUEsVUFBSSx3QkFBUSxhQUFhLEVBQ3RCO0FBQUEsUUFBVSxDQUFDLFFBQ1YsSUFBSSxjQUFjLGlCQUFpQixFQUFFLFFBQVEsWUFBWTtBQUN2RCxjQUFJLENBQUMsS0FBSyxPQUFPLG9CQUFvQixXQUFXLEdBQUc7QUFDakQsZ0JBQUksdUJBQU8sNkJBQTZCO0FBQ3hDO0FBQUEsVUFDRjtBQUNBLGNBQUksYUFBYSxjQUFjO0FBQzdCLGdCQUFJO0FBQ0Ysb0JBQU0sTUFBTSxHQUFHLFlBQVksSUFBSSxRQUFRLE9BQU8sRUFBRSxDQUFDO0FBQ2pELG9CQUFNLFdBQVcsVUFBTSw0QkFBVztBQUFBLGdCQUNoQztBQUFBLGdCQUNBLFFBQVE7QUFBQSxnQkFDUixTQUFTLEVBQUUsaUJBQWlCLFlBQVksT0FBTztBQUFBLGNBQ2pELENBQUM7QUFDRCxrQkFBSSxTQUFTLFVBQVUsT0FBTyxTQUFTLFNBQVMsS0FBSztBQUNuRCxvQkFBSSx1QkFBTyx3QkFBbUIsWUFBWSxRQUFRLFlBQVksR0FBRyxhQUFhO0FBQUEsY0FDaEYsT0FBTztBQUNMLG9CQUFJLHVCQUFPLFVBQUssWUFBWSxRQUFRLFlBQVksR0FBRyxtQkFBbUIsU0FBUyxNQUFNLEVBQUU7QUFBQSxjQUN6RjtBQUFBLFlBQ0YsUUFBUTtBQUNOLGtCQUFJLHVCQUFPLDBCQUFxQixZQUFZLFFBQVEsWUFBWSxHQUFHLEVBQUU7QUFBQSxZQUN2RTtBQUFBLFVBQ0YsT0FBTztBQUNMLGdCQUFJLHVCQUFPLG1DQUFtQyxZQUFZLElBQUksb0JBQW9CO0FBQUEsVUFDcEY7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNILEVBQ0M7QUFBQSxRQUFVLENBQUMsUUFDVixJQUNHLGNBQWMsb0JBQW9CLEVBQ2xDLFdBQVcsRUFDWCxRQUFRLFlBQVk7QUFDbkIsZ0JBQU0sWUFBWSxjQUFjLFVBQVU7QUFBQSxZQUN4QyxLQUFLO0FBQUEsVUFDUCxDQUFDO0FBQ0Qsb0JBQVUsU0FBUyxRQUFRO0FBQUEsWUFDekIsTUFBTSxXQUFXLFlBQVksUUFBUSxrQkFBa0I7QUFBQSxVQUN6RCxDQUFDO0FBQ0QsZ0JBQU0sU0FBUyxVQUFVLFNBQVMsVUFBVTtBQUFBLFlBQzFDLE1BQU07QUFBQSxZQUNOLEtBQUs7QUFBQSxVQUNQLENBQUM7QUFDRCxnQkFBTSxRQUFRLFVBQVUsU0FBUyxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDN0QsaUJBQU8saUJBQWlCLFNBQVMsWUFBWTtBQUMzQyxpQkFBSyxPQUFPLFNBQVMsYUFBYSxPQUFPLE9BQU8sQ0FBQztBQUNqRCxrQkFBTSxLQUFLLE9BQU8sYUFBYTtBQUMvQixpQkFBSyxRQUFRO0FBQUEsVUFDZixDQUFDO0FBQ0QsZ0JBQU0saUJBQWlCLFNBQVMsTUFBTSxVQUFVLE9BQU8sQ0FBQztBQUFBLFFBQzFELENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSixDQUFDO0FBRUQsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCO0FBQUEsTUFBVSxDQUFDLFFBQ1YsSUFDRyxjQUFjLGlCQUFpQixFQUMvQixPQUFPLEVBQ1AsUUFBUSxZQUFZO0FBQ25CLGFBQUssT0FBTyxTQUFTLGFBQWEsS0FBSztBQUFBLFVBQ3JDLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLEtBQUs7QUFBQSxVQUNMLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFDRCxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLGFBQUssUUFBUTtBQUFBLE1BQ2YsQ0FBQztBQUFBLElBQ0w7QUFFRixnQkFBWSxTQUFTLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUUvQyxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxnQkFBZ0IsRUFDeEIsUUFBUSwwREFBMEQsRUFDbEU7QUFBQSxNQUFZLENBQUMsYUFDWixTQUNHLFVBQVUsU0FBUyxPQUFPLEVBQzFCLFVBQVUsYUFBYSxXQUFXLEVBQ2xDLFNBQVMsS0FBSyxPQUFPLFNBQVMsYUFBYSxFQUMzQyxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyxnQkFBZ0I7QUFHckMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsMkJBQTJCLEVBQ25DLFFBQVEsK0RBQStELEVBQ3ZFO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLG9CQUFvQixFQUNsRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixhQUFLLE9BQU8sU0FBUyx1QkFBdUI7QUFDNUMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsdUJBQXVCLEVBQy9CO0FBQUEsTUFDQztBQUFBLElBQ0YsRUFDQztBQUFBLE1BQVUsQ0FBQyxXQUNWLE9BQ0csU0FBUyxLQUFLLE9BQU8sU0FBUyxtQkFBbUIsRUFDakQsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsc0JBQXNCO0FBQzNDLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDTDtBQUdGLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsZ0JBQVksU0FBUyxLQUFLO0FBQUEsTUFDeEIsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1AsQ0FBQztBQUVELFFBQUksd0JBQVEsV0FBVyxFQUNwQixRQUFRLGlCQUFpQixFQUN6QixRQUFRLCtCQUErQixFQUN2QztBQUFBLE1BQVUsQ0FBQyxRQUNWLElBQUksY0FBYyxnQkFBZ0IsRUFBRSxRQUFRLE1BQU07QUFDaEQsZUFBTyxLQUFLLHlDQUF5QyxRQUFRO0FBQUEsTUFDL0QsQ0FBQztBQUFBLElBQ0g7QUFFRixRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxpQkFBaUIsRUFDekIsUUFBUSxvQ0FBb0MsRUFDNUM7QUFBQSxNQUFVLENBQUMsUUFDVixJQUFJLGNBQWMsZ0JBQWdCLEVBQUUsUUFBUSxNQUFNO0FBQ2hELGVBQU8sS0FBSyw2Q0FBNkMsUUFBUTtBQUFBLE1BQ25FLENBQUM7QUFBQSxJQUNIO0FBRUYsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEscUJBQXFCLEVBQzdCLFFBQVEseUJBQXlCLEVBQ2pDO0FBQUEsTUFBVSxDQUFDLFFBQ1YsSUFBSSxjQUFjLGdCQUFtQixFQUFFLFFBQVEsTUFBTTtBQUNuRCxlQUFPLEtBQUssbUNBQW1DLFFBQVE7QUFBQSxNQUN6RCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0o7QUFDRjtBQU1BLElBQU0sbUJBQU4sY0FBK0Isc0JBQU07QUFBQSxFQUluQyxZQUFZLEtBQVUsT0FBZSxhQUFzQjtBQUN6RCxVQUFNLEdBQUc7QUFDVCxTQUFLLFFBQVE7QUFDYixTQUFLLGNBQWM7QUFBQSxFQUNyQjtBQUFBLEVBRUEsU0FBUztBQUNQLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxTQUFTLCtCQUErQjtBQUNsRCxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELGNBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSxTQUFTLEtBQUssS0FBSyxHQUFHLENBQUM7QUFFdkQsVUFBTSxVQUFVLE1BQU0sUUFBUSxLQUFLLFdBQVcsSUFDekMsS0FBSyxjQUNOLENBQUM7QUFFTCxRQUFJLFFBQVEsV0FBVyxHQUFHO0FBQ3hCLGdCQUFVLFNBQVMsS0FBSztBQUFBLFFBQ3RCLE1BQU07QUFBQSxNQUNSLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxnQkFBVSxTQUFTLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDeEYsWUFBTSxPQUFPLFVBQVUsU0FBUyxJQUFJO0FBQ3BDLGlCQUFXLFNBQVMsU0FBUztBQUMzQixjQUFNLEtBQUssS0FBSyxTQUFTLElBQUk7QUFDN0IsWUFBSSxNQUFNLEtBQUs7QUFDYixnQkFBTSxJQUFJLEdBQUcsU0FBUyxLQUFLLEVBQUUsTUFBTSxNQUFNLFFBQVEsTUFBTSxJQUFJLENBQUM7QUFDNUQsWUFBRSxPQUFPLE1BQU07QUFDZixZQUFFLFNBQVM7QUFDWCxZQUFFLE1BQU07QUFBQSxRQUNWLE9BQU87QUFDTCxhQUFHLFFBQVEsTUFBTSxRQUFRLFNBQVM7QUFBQSxRQUNwQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDckUsVUFBTSxXQUFXLFFBQVEsU0FBUyxVQUFVLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDN0QsYUFBUyxpQkFBaUIsU0FBUyxNQUFNLEtBQUssTUFBTSxDQUFDO0FBQUEsRUFDdkQ7QUFBQSxFQUVBLFVBQVU7QUFDUixTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQ3ZCO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
