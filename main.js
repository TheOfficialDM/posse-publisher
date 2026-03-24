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
    const content = await this.app.vault.cachedRead(view.file);
    const fileCache = this.app.metadataCache.getFileCache(view.file);
    const frontmatter = buildFrontmatter(fileCache?.frontmatter);
    const body = extractBody(content);
    const processedBody = this.settings.stripObsidianSyntax ? preprocessContent(body) : body;
    const title = frontmatter.title || view.file.basename || "Untitled";
    const slug = frontmatter.slug || toSlug(title);
    const status = overrideStatus || frontmatter.status || this.settings.defaultStatus;
    const postType = frontmatter.type || "blog";
    const canonicalUrl = this.settings.canonicalBaseUrl ? `${this.settings.canonicalBaseUrl.replace(/\/$/, "")}/${postType}/${slug}` : "";
    const payload = {
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
    const content = await this.app.vault.cachedRead(view.file);
    const fileCache = this.app.metadataCache.getFileCache(view.file);
    const frontmatter = buildFrontmatter(fileCache?.frontmatter);
    const body = extractBody(content);
    const processedBody = this.settings.stripObsidianSyntax ? preprocessContent(body) : body;
    const title = frontmatter.title || view.file.basename || "Untitled";
    const slug = frontmatter.slug || toSlug(title);
    const status = overrideStatus || frontmatter.status || this.settings.defaultStatus;
    const postType = frontmatter.type || "blog";
    const canonicalUrl = this.settings.canonicalBaseUrl ? `${this.settings.canonicalBaseUrl.replace(/\/$/, "")}/${postType}/${slug}` : "";
    const payload = {
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
    new import_obsidian.Notice(`POSSEing "${title}" to ${destinations.length} destination(s)...`);
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
      default:
        return !!(dest.url && dest.apiKey);
    }
  }
  /** Write a syndication entry back into the note's frontmatter. */
  async writeSyndication(file, name, url) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!Array.isArray(fm.syndication)) fm.syndication = [];
      const already = fm.syndication.some((s) => s.name === name);
      if (!already) fm.syndication.push({ url, name });
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
        (dd) => dd.addOption("custom-api", "Custom API").addOption("devto", "Dev.to").addOption("mastodon", "Mastodon").addOption("bluesky", "Bluesky").setValue(destination.type || "custom-api").onChange(async (value) => {
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
  preprocessContent,
  toSlug
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtcclxuICBQbHVnaW4sXHJcbiAgUGx1Z2luU2V0dGluZ1RhYixcclxuICBBcHAsXHJcbiAgU2V0dGluZyxcclxuICBOb3RpY2UsXHJcbiAgcmVxdWVzdFVybCxcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTW9kYWwsXHJcbiAgU3VnZ2VzdE1vZGFsLFxyXG4gIFRGaWxlLFxyXG59IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxudHlwZSBEZXN0aW5hdGlvblR5cGUgPSBcImN1c3RvbS1hcGlcIiB8IFwiZGV2dG9cIiB8IFwibWFzdG9kb25cIiB8IFwiYmx1ZXNreVwiO1xyXG5cclxuaW50ZXJmYWNlIERlc3RpbmF0aW9uIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgdHlwZTogRGVzdGluYXRpb25UeXBlO1xyXG4gIC8vIGN1c3RvbS1hcGlcclxuICB1cmw6IHN0cmluZztcclxuICBhcGlLZXk6IHN0cmluZztcclxuICAvLyBtYXN0b2RvblxyXG4gIGluc3RhbmNlVXJsPzogc3RyaW5nO1xyXG4gIGFjY2Vzc1Rva2VuPzogc3RyaW5nO1xyXG4gIC8vIGJsdWVza3lcclxuICBoYW5kbGU/OiBzdHJpbmc7XHJcbiAgYXBwUGFzc3dvcmQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQb3NzZVB1Ymxpc2hlclNldHRpbmdzIHtcclxuICBkZXN0aW5hdGlvbnM6IERlc3RpbmF0aW9uW107XHJcbiAgY2Fub25pY2FsQmFzZVVybDogc3RyaW5nO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbiAgY29uZmlybUJlZm9yZVB1Ymxpc2g6IGJvb2xlYW47XHJcbiAgc3RyaXBPYnNpZGlhblN5bnRheDogYm9vbGVhbjtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUG9zc2VQdWJsaXNoZXJTZXR0aW5ncyA9IHtcclxuICBkZXN0aW5hdGlvbnM6IFtdLFxyXG4gIGNhbm9uaWNhbEJhc2VVcmw6IFwiXCIsXHJcbiAgZGVmYXVsdFN0YXR1czogXCJkcmFmdFwiLFxyXG4gIGNvbmZpcm1CZWZvcmVQdWJsaXNoOiB0cnVlLFxyXG4gIHN0cmlwT2JzaWRpYW5TeW50YXg6IHRydWUsXHJcbn07XHJcblxyXG5pbnRlcmZhY2UgRnJvbnRtYXR0ZXIge1xyXG4gIHRpdGxlPzogc3RyaW5nO1xyXG4gIHNsdWc/OiBzdHJpbmc7XHJcbiAgZXhjZXJwdD86IHN0cmluZztcclxuICB0eXBlPzogc3RyaW5nO1xyXG4gIHN0YXR1cz86IHN0cmluZztcclxuICB0YWdzPzogc3RyaW5nW107XHJcbiAgcGlsbGFyPzogc3RyaW5nO1xyXG4gIGNvdmVySW1hZ2U/OiBzdHJpbmc7XHJcbiAgZmVhdHVyZWQ/OiBib29sZWFuO1xyXG4gIG1ldGFUaXRsZT86IHN0cmluZztcclxuICBtZXRhRGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbiAgb2dJbWFnZT86IHN0cmluZztcclxuICB2aWRlb1VybD86IHN0cmluZztcclxuICBjYW5vbmljYWxVcmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBFeHRyYWN0IGJvZHkgY29udGVudCBiZWxvdyB0aGUgWUFNTCBmcm9udG1hdHRlciBmZW5jZS4gKi9cclxuZnVuY3Rpb24gZXh0cmFjdEJvZHkoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXHI/XFxuW1xcc1xcU10qP1xccj9cXG4tLS1cXHI/XFxuPyhbXFxzXFxTXSopJC8pO1xyXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRyaW0oKSA6IGNvbnRlbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBhIEZyb250bWF0dGVyIG9iamVjdCBmcm9tIE9ic2lkaWFuJ3MgY2FjaGVkIG1ldGFkYXRhLlxyXG4gKiBGYWxscyBiYWNrIGdyYWNlZnVsbHkgd2hlbiBmaWVsZHMgYXJlIGFic2VudC5cclxuICovXHJcbmZ1bmN0aW9uIGJ1aWxkRnJvbnRtYXR0ZXIoY2FjaGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKTogRnJvbnRtYXR0ZXIge1xyXG4gIGlmICghY2FjaGUpIHJldHVybiB7fTtcclxuICBjb25zdCBmbTogRnJvbnRtYXR0ZXIgPSB7fTtcclxuXHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50aXRsZSA9PT0gXCJzdHJpbmdcIikgZm0udGl0bGUgPSBjYWNoZS50aXRsZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnNsdWcgPT09IFwic3RyaW5nXCIpIGZtLnNsdWcgPSBjYWNoZS5zbHVnO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUuZXhjZXJwdCA9PT0gXCJzdHJpbmdcIikgZm0uZXhjZXJwdCA9IGNhY2hlLmV4Y2VycHQ7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS50eXBlID09PSBcInN0cmluZ1wiKSBmbS50eXBlID0gY2FjaGUudHlwZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnN0YXR1cyA9PT0gXCJzdHJpbmdcIikgZm0uc3RhdHVzID0gY2FjaGUuc3RhdHVzO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUucGlsbGFyID09PSBcInN0cmluZ1wiKSBmbS5waWxsYXIgPSBjYWNoZS5waWxsYXI7XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5jb3ZlckltYWdlID09PSBcInN0cmluZ1wiKSBmbS5jb3ZlckltYWdlID0gY2FjaGUuY292ZXJJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLm1ldGFUaXRsZSA9PT0gXCJzdHJpbmdcIikgZm0ubWV0YVRpdGxlID0gY2FjaGUubWV0YVRpdGxlO1xyXG4gIGlmICh0eXBlb2YgY2FjaGUubWV0YURlc2NyaXB0aW9uID09PSBcInN0cmluZ1wiKSBmbS5tZXRhRGVzY3JpcHRpb24gPSBjYWNoZS5tZXRhRGVzY3JpcHRpb247XHJcbiAgaWYgKHR5cGVvZiBjYWNoZS5vZ0ltYWdlID09PSBcInN0cmluZ1wiKSBmbS5vZ0ltYWdlID0gY2FjaGUub2dJbWFnZTtcclxuICBpZiAodHlwZW9mIGNhY2hlLnZpZGVvVXJsID09PSBcInN0cmluZ1wiKSBmbS52aWRlb1VybCA9IGNhY2hlLnZpZGVvVXJsO1xyXG5cclxuICBpZiAodHlwZW9mIGNhY2hlLmZlYXR1cmVkID09PSBcImJvb2xlYW5cIikgZm0uZmVhdHVyZWQgPSBjYWNoZS5mZWF0dXJlZDtcclxuICBlbHNlIGlmIChjYWNoZS5mZWF0dXJlZCA9PT0gXCJ0cnVlXCIpIGZtLmZlYXR1cmVkID0gdHJ1ZTtcclxuXHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2FjaGUudGFncykpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzLm1hcCgodDogdW5rbm93bikgPT4gU3RyaW5nKHQpLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGNhY2hlLnRhZ3MgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGZtLnRhZ3MgPSBjYWNoZS50YWdzXHJcbiAgICAgIC5yZXBsYWNlKC9eXFxbfFxcXSQvZywgXCJcIilcclxuICAgICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgICAubWFwKCh0OiBzdHJpbmcpID0+IHQudHJpbSgpKVxyXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZtO1xyXG59XHJcblxyXG4vKiogQ29udmVydCBhIHRpdGxlIHN0cmluZyB0byBhIFVSTC1zYWZlIHNsdWcsIGhhbmRsaW5nIGRpYWNyaXRpY3MuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1NsdWcodGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHRpdGxlXHJcbiAgICAubm9ybWFsaXplKFwiTkZEXCIpXHJcbiAgICAucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCBcIi1cIilcclxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCBcIlwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFByZS1wcm9jZXNzIE9ic2lkaWFuLXNwZWNpZmljIG1hcmtkb3duIGJlZm9yZSBzZW5kaW5nIHRvIHRoZSBibG9nIEFQSS5cclxuICogU3RyaXBzIHdpa2ktbGlua3MsIGVtYmVkcywgY29tbWVudHMsIGFuZCBkYXRhdmlldyBibG9ja3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2Vzc0NvbnRlbnQoYm9keTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAvLyBSZW1vdmUgT2JzaWRpYW4gY29tbWVudHM6ICUlLi4uJSVcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC8lJVtcXHNcXFNdKj8lJS9nLCBcIlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmsgZW1iZWRzOiAhW1tmaWxlXV0gXHUyMTkyIChyZW1vdmVkKVxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoLyFcXFtcXFsoW15cXF1dKylcXF1cXF0vZywgXCJcIik7XHJcblxyXG4gIC8vIENvbnZlcnQgd2lraS1saW5rcyB3aXRoIGFsaWFzOiBbW3RhcmdldHxhbGlhc11dIFx1MjE5MiBhbGlhc1xyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXXxdKylcXHwoW15cXF1dKylcXF1cXF0vZywgXCIkMlwiKTtcclxuXHJcbiAgLy8gQ29udmVydCB3aWtpLWxpbmtzIHdpdGhvdXQgYWxpYXM6IFtbdGFyZ2V0XV0gXHUyMTkyIHRhcmdldFxyXG4gIGJvZHkgPSBib2R5LnJlcGxhY2UoL1xcW1xcWyhbXlxcXV0rKVxcXVxcXS9nLCBcIiQxXCIpO1xyXG5cclxuICAvLyBSZW1vdmUgZGF0YXZpZXcgY29kZSBibG9ja3NcclxuICBib2R5ID0gYm9keS5yZXBsYWNlKC9gYGBkYXRhdmlld1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvYGBgZGF0YXZpZXdqc1tcXHNcXFNdKj9gYGAvZywgXCJcIik7XHJcblxyXG4gIC8vIENsZWFuIHVwIGV4Y2VzcyBibGFuayBsaW5lcyBsZWZ0IGJ5IHJlbW92YWxzXHJcbiAgYm9keSA9IGJvZHkucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcclxuXHJcbiAgcmV0dXJuIGJvZHkudHJpbSgpO1xyXG59XHJcblxyXG5jb25zdCBGUk9OVE1BVFRFUl9URU1QTEFURSA9IGAtLS1cclxudGl0bGU6IFxyXG5zbHVnOiBcclxuZXhjZXJwdDogXHJcbnR5cGU6IGJsb2dcclxuc3RhdHVzOiBkcmFmdFxyXG50YWdzOiBbXVxyXG5waWxsYXI6IFxyXG5jb3ZlckltYWdlOiBcclxuZmVhdHVyZWQ6IGZhbHNlXHJcbm1ldGFUaXRsZTogXHJcbm1ldGFEZXNjcmlwdGlvbjogXHJcbm9nSW1hZ2U6IFxyXG52aWRlb1VybDogXHJcbmNhbm9uaWNhbFVybDogXHJcbnN5bmRpY2F0aW9uOiBbXVxyXG4tLS1cclxuXHJcbmA7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3NzZVB1Ymxpc2hlclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcbiAgc2V0dGluZ3M6IFBvc3NlUHVibGlzaGVyU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4gIHByaXZhdGUgc3RhdHVzQmFyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGFzeW5jIG9ubG9hZCgpIHtcclxuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcbiAgICB0aGlzLm1pZ3JhdGVTZXR0aW5ncygpO1xyXG5cclxuICAgIHRoaXMuc3RhdHVzQmFyRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcclxuXHJcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJzZW5kXCIsIFwiUE9TU0UgUHVibGlzaFwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwb3NzZS1wdWJsaXNoXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgUHVibGlzaFwiLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5waWNrU2l0ZUFuZFB1Ymxpc2goKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXB1Ymxpc2gtZHJhZnRcIixcclxuICAgICAgbmFtZTogXCJQT1NTRSBQdWJsaXNoIGFzIERyYWZ0XCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcImRyYWZ0XCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2UtcHVibGlzaC1saXZlXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgUHVibGlzaCBMaXZlXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaChcInB1Ymxpc2hlZFwiKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLWluc2VydC10ZW1wbGF0ZVwiLFxyXG4gICAgICBuYW1lOiBcIlBPU1NFIEluc2VydCBGcm9udG1hdHRlciBUZW1wbGF0ZVwiLFxyXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcclxuICAgICAgICBpZiAoY29udGVudC50cmltU3RhcnQoKS5zdGFydHNXaXRoKFwiLS0tXCIpKSB7XHJcbiAgICAgICAgICBuZXcgTm90aWNlKFwiRnJvbnRtYXR0ZXIgYWxyZWFkeSBleGlzdHMgaW4gdGhpcyBub3RlXCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKDAsIDApO1xyXG4gICAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoRlJPTlRNQVRURVJfVEVNUExBVEUsIHsgbGluZTogMCwgY2g6IDAgfSk7XHJcbiAgICAgICAgLy8gUGxhY2UgY3Vyc29yIG9uIHRoZSB0aXRsZSBsaW5lXHJcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcigxLCA3KTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgIGlkOiBcInBvc3NlLXRvLWFsbFwiLFxyXG4gICAgICBuYW1lOiBcIlBPU1NFIHRvIEFsbCBEZXN0aW5hdGlvbnNcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucG9zc2VUb0FsbCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicG9zc2Utc3RhdHVzXCIsXHJcbiAgICAgIG5hbWU6IFwiUE9TU0UgU3RhdHVzIFx1MjAxNCBWaWV3IFN5bmRpY2F0aW9uXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBvc3NlU3RhdHVzKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFBvc3NlUHVibGlzaGVyU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG4gIH1cclxuXHJcbiAgb251bmxvYWQoKSB7XHJcbiAgICB0aGlzLnN0YXR1c0JhckVsID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKiBNaWdyYXRlIGZyb20gc2luZ2xlLXNpdGUgc2V0dGluZ3MgKHYxKSB0byBtdWx0aS1zaXRlICh2MikgKi9cclxuICBwcml2YXRlIG1pZ3JhdGVTZXR0aW5ncygpIHtcclxuICAgIGNvbnN0IHJhdyA9IHRoaXMuc2V0dGluZ3MgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICAgIC8vIE1pZ3JhdGUgdjEgc2luZ2xlLXNpdGUgZm9ybWF0XHJcbiAgICBpZiAodHlwZW9mIHJhdy5zaXRlVXJsID09PSBcInN0cmluZ1wiICYmIHJhdy5zaXRlVXJsKSB7XHJcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6IFwiRGVmYXVsdFwiLFxyXG4gICAgICAgICAgdHlwZTogXCJjdXN0b20tYXBpXCIgYXMgRGVzdGluYXRpb25UeXBlLFxyXG4gICAgICAgICAgdXJsOiByYXcuc2l0ZVVybCBhcyBzdHJpbmcsXHJcbiAgICAgICAgICBhcGlLZXk6IChyYXcuYXBpS2V5IGFzIHN0cmluZykgfHwgXCJcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVVcmw7XHJcbiAgICAgIGRlbGV0ZSByYXcuYXBpS2V5O1xyXG4gICAgICB0aGlzLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgfVxyXG4gICAgLy8gTWlncmF0ZSBzaXRlcyBcdTIxOTIgZGVzdGluYXRpb25zIGtleVxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmF3LnNpdGVzKSAmJiAhQXJyYXkuaXNBcnJheSh0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucykpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5kZXN0aW5hdGlvbnMgPSByYXcuc2l0ZXMgYXMgRGVzdGluYXRpb25bXTtcclxuICAgICAgZGVsZXRlIHJhdy5zaXRlcztcclxuICAgICAgdGhpcy5zYXZlU2V0dGluZ3MoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2V0dGluZ3MuZGVzdGluYXRpb25zKSkge1xyXG4gICAgICB0aGlzLnNldHRpbmdzLmRlc3RpbmF0aW9ucyA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGlja1NpdGVBbmRQdWJsaXNoKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBkZXN0aW5hdGlvbnMgfSA9IHRoaXMuc2V0dGluZ3M7XHJcbiAgICBpZiAoZGVzdGluYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQWRkIGF0IGxlYXN0IG9uZSBkZXN0aW5hdGlvbiBpbiBQT1NTRSBQdWJsaXNoZXIgc2V0dGluZ3NcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHRoaXMucHJlcGFyZVB1Ymxpc2goZGVzdGluYXRpb25zWzBdLCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIG5ldyBTaXRlUGlja2VyTW9kYWwodGhpcy5hcHAsIGRlc3RpbmF0aW9ucywgKGRlc3QpID0+IHtcclxuICAgICAgdGhpcy5wcmVwYXJlUHVibGlzaChkZXN0LCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICB9KS5vcGVuKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHByZXBhcmVQdWJsaXNoKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbiwgb3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGlmICghdmlldyB8fCAhdmlldy5maWxlKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJPcGVuIGEgbWFya2Rvd24gZmlsZSBmaXJzdFwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5oYXNWYWxpZENyZWRlbnRpYWxzKGRlc3RpbmF0aW9uKSkge1xyXG4gICAgICBuZXcgTm90aWNlKGBDb25maWd1cmUgY3JlZGVudGlhbHMgZm9yIFwiJHtkZXN0aW5hdGlvbi5uYW1lfVwiIGluIFBPU1NFIFB1Ymxpc2hlciBzZXR0aW5nc2ApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVhZCBmcm9tIHZhdWx0IGNhY2hlIFx1MjAxNCB3b3JrcyBpbiBib3RoIGVkaXQgYW5kIHJlYWRpbmcgbW9kZXNcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jYWNoZWRSZWFkKHZpZXcuZmlsZSk7XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3QgZnJvbnRtYXR0ZXIgPSBidWlsZEZyb250bWF0dGVyKGZpbGVDYWNoZT8uZnJvbnRtYXR0ZXIpO1xyXG5cclxuICAgIGNvbnN0IGJvZHkgPSBleHRyYWN0Qm9keShjb250ZW50KTtcclxuICAgIGNvbnN0IHByb2Nlc3NlZEJvZHkgPSB0aGlzLnNldHRpbmdzLnN0cmlwT2JzaWRpYW5TeW50YXhcclxuICAgICAgPyBwcmVwcm9jZXNzQ29udGVudChib2R5KVxyXG4gICAgICA6IGJvZHk7XHJcblxyXG4gICAgY29uc3QgdGl0bGUgPSBmcm9udG1hdHRlci50aXRsZSB8fCB2aWV3LmZpbGUuYmFzZW5hbWUgfHwgXCJVbnRpdGxlZFwiO1xyXG4gICAgY29uc3Qgc2x1ZyA9IGZyb250bWF0dGVyLnNsdWcgfHwgdG9TbHVnKHRpdGxlKTtcclxuICAgIGNvbnN0IHN0YXR1cyA9IG92ZXJyaWRlU3RhdHVzIHx8IGZyb250bWF0dGVyLnN0YXR1cyB8fCB0aGlzLnNldHRpbmdzLmRlZmF1bHRTdGF0dXM7XHJcbiAgICBjb25zdCBwb3N0VHlwZSA9IGZyb250bWF0dGVyLnR5cGUgfHwgXCJibG9nXCI7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgY2Fub25pY2FsIFVSTCBpZiBiYXNlIFVSTCBpcyBjb25maWd1cmVkXHJcbiAgICBjb25zdCBjYW5vbmljYWxVcmwgPSB0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmxcclxuICAgICAgPyBgJHt0aGlzLnNldHRpbmdzLmNhbm9uaWNhbEJhc2VVcmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3Bvc3RUeXBlfS8ke3NsdWd9YFxyXG4gICAgICA6IFwiXCI7XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgdGl0bGUsXHJcbiAgICAgIHNsdWcsXHJcbiAgICAgIGJvZHk6IHByb2Nlc3NlZEJvZHksXHJcbiAgICAgIGV4Y2VycHQ6IGZyb250bWF0dGVyLmV4Y2VycHQgfHwgXCJcIixcclxuICAgICAgdHlwZTogcG9zdFR5cGUsXHJcbiAgICAgIHN0YXR1cyxcclxuICAgICAgdGFnczogZnJvbnRtYXR0ZXIudGFncyB8fCBbXSxcclxuICAgICAgcGlsbGFyOiBmcm9udG1hdHRlci5waWxsYXIgfHwgXCJcIixcclxuICAgICAgZmVhdHVyZWQ6IGZyb250bWF0dGVyLmZlYXR1cmVkIHx8IGZhbHNlLFxyXG4gICAgICBjb3ZlckltYWdlOiBmcm9udG1hdHRlci5jb3ZlckltYWdlIHx8IFwiXCIsXHJcbiAgICAgIG1ldGFUaXRsZTogZnJvbnRtYXR0ZXIubWV0YVRpdGxlIHx8IFwiXCIsXHJcbiAgICAgIG1ldGFEZXNjcmlwdGlvbjogZnJvbnRtYXR0ZXIubWV0YURlc2NyaXB0aW9uIHx8IFwiXCIsXHJcbiAgICAgIG9nSW1hZ2U6IGZyb250bWF0dGVyLm9nSW1hZ2UgfHwgXCJcIixcclxuICAgICAgdmlkZW9Vcmw6IGZyb250bWF0dGVyLnZpZGVvVXJsIHx8IFwiXCIsXHJcbiAgICAgIC4uLihjYW5vbmljYWxVcmwgJiYgeyBjYW5vbmljYWxVcmwgfSksXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoKSB7XHJcbiAgICAgIG5ldyBDb25maXJtUHVibGlzaE1vZGFsKHRoaXMuYXBwLCBwYXlsb2FkLCBkZXN0aW5hdGlvbiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucHVibGlzaFRvRGVzdGluYXRpb24oZGVzdGluYXRpb24sIHBheWxvYWQsIHZpZXcuZmlsZSEpO1xyXG4gICAgICB9KS5vcGVuKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCB2aWV3LmZpbGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJvdXRlIGEgcHVibGlzaCB0byB0aGUgY29ycmVjdCBwbGF0Zm9ybSBoYW5kbGVyLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGVzdGluYXRpb24oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgc3dpdGNoIChkZXN0aW5hdGlvbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJkZXZ0b1wiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0RldlRvKGRlc3RpbmF0aW9uLCBwYXlsb2FkLCBmaWxlKTtcclxuICAgICAgY2FzZSBcIm1hc3RvZG9uXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGlzaFRvTWFzdG9kb24oZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBjYXNlIFwiYmx1ZXNreVwiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0JsdWVza3koZGVzdGluYXRpb24sIHBheWxvYWQsIGZpbGUpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hUb0N1c3RvbUFwaShkZXN0aW5hdGlvbiwgcGF5bG9hZCwgZmlsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUHVibGlzaCB0byBhIGN1c3RvbSAvYXBpL3B1Ymxpc2ggZW5kcG9pbnQuICovXHJcbiAgcHJpdmF0ZSBhc3luYyBwdWJsaXNoVG9DdXN0b21BcGkoXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIGNvbnN0IHN0YXR1cyA9IHBheWxvYWQuc3RhdHVzIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgJHtkZXN0aW5hdGlvbi5uYW1lfS4uLmApO1xyXG4gICAgICBjb25zdCB1cmwgPSBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS9hcGkvcHVibGlzaGA7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XHJcbiAgICAgICAgdXJsLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIngtcHVibGlzaC1rZXlcIjogZGVzdGluYXRpb24uYXBpS2V5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBsZXQgdmVyYiA9IFwiUE9TU0VkXCI7XHJcbiAgICAgICAgdHJ5IHsgaWYgKHJlc3BvbnNlLmpzb24/LnVwc2VydGVkKSB2ZXJiID0gXCJVcGRhdGVkXCI7IH0gY2F0Y2ggeyAvKiBub24tSlNPTiAqLyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgJHt2ZXJifSBcIiR7dGl0bGV9XCIgb24gJHtkZXN0aW5hdGlvbi5uYW1lfSBhcyAke3N0YXR1c31gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKGRlc3RpbmF0aW9uLm5hbWUpO1xyXG4gICAgICAgIGxldCBzeW5kaWNhdGlvblVybDogc3RyaW5nO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBzeW5kaWNhdGlvblVybCA9IHJlc3BvbnNlLmpzb24/LnVybCB8fFxyXG4gICAgICAgICAgICBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS8ke3BheWxvYWQuc2x1ZyBhcyBzdHJpbmd9YDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIHN5bmRpY2F0aW9uVXJsID0gYCR7ZGVzdGluYXRpb24udXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwYXlsb2FkLnNsdWcgYXMgc3RyaW5nfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHRoaXMud3JpdGVTeW5kaWNhdGlvbihmaWxlLCBkZXN0aW5hdGlvbi5uYW1lLCBzeW5kaWNhdGlvblVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSByZXNwb25zZS5qc29uPy5lcnJvciB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFIHRvICR7ZGVzdGluYXRpb24ubmFtZX0gZmFpbGVkOiAke2Vycm9yRGV0YWlsfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0UgZXJyb3IgKCR7ZGVzdGluYXRpb24ubmFtZX0pOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIERldi50byB2aWEgdGhlaXIgYXJ0aWNsZXMgQVBJLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvRGV2VG8oXHJcbiAgICBkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICkge1xyXG4gICAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIGFzIHN0cmluZztcclxuICAgIHRyeSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgRGV2LnRvICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCB0YWdzID0gKChwYXlsb2FkLnRhZ3MgYXMgc3RyaW5nW10pIHx8IFtdKVxyXG4gICAgICAgIC5zbGljZSgwLCA0KVxyXG4gICAgICAgIC5tYXAoKHQpID0+IHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywgXCJcIikpO1xyXG4gICAgICBjb25zdCBhcnRpY2xlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcclxuICAgICAgICB0aXRsZSxcclxuICAgICAgICBib2R5X21hcmtkb3duOiBwYXlsb2FkLmJvZHkgYXMgc3RyaW5nLFxyXG4gICAgICAgIHB1Ymxpc2hlZDogcGF5bG9hZC5zdGF0dXMgPT09IFwicHVibGlzaGVkXCIsXHJcbiAgICAgICAgdGFncyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCIsXHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChwYXlsb2FkLmNhbm9uaWNhbFVybCkgYXJ0aWNsZS5jYW5vbmljYWxfdXJsID0gcGF5bG9hZC5jYW5vbmljYWxVcmw7XHJcbiAgICAgIGlmIChwYXlsb2FkLmNvdmVySW1hZ2UpIGFydGljbGUubWFpbl9pbWFnZSA9IHBheWxvYWQuY292ZXJJbWFnZTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9kZXYudG8vYXBpL2FydGljbGVzXCIsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwiYXBpLWtleVwiOiBkZXN0aW5hdGlvbi5hcGlLZXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFydGljbGUgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCBhcnRpY2xlVXJsOiBzdHJpbmcgPSByZXNwb25zZS5qc29uPy51cmwgfHwgXCJodHRwczovL2Rldi50b1wiO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gRGV2LnRvYCk7XHJcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzQmFyU3VjY2VzcyhcIkRldi50b1wiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgYXJ0aWNsZVVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSByZXNwb25zZS5qc29uPy5lcnJvciB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYERldi50byBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBEZXYudG8gZXJyb3I6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2ggdG8gTWFzdG9kb24gYnkgcG9zdGluZyBhIHN0YXR1cyB3aXRoIHRoZSBjYW5vbmljYWwgbGluay4gKi9cclxuICBwcml2YXRlIGFzeW5jIHB1Ymxpc2hUb01hc3RvZG9uKFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICBmaWxlOiBURmlsZSxcclxuICApIHtcclxuICAgIGNvbnN0IHRpdGxlID0gcGF5bG9hZC50aXRsZSBhcyBzdHJpbmc7XHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQT1NTRWluZyBcIiR7dGl0bGV9XCIgXHUyMTkyIE1hc3RvZG9uICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG4gICAgICBjb25zdCBleGNlcnB0ID0gKHBheWxvYWQuZXhjZXJwdCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IHN0YXR1c1RleHQgPSBbdGl0bGUsIGV4Y2VycHQsIGNhbm9uaWNhbFVybF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIik7XHJcbiAgICAgIGNvbnN0IGluc3RhbmNlVXJsID0gKGRlc3RpbmF0aW9uLmluc3RhbmNlVXJsIHx8IFwiXCIpLnJlcGxhY2UoL1xcLyQvLCBcIlwiKTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmw6IGAke2luc3RhbmNlVXJsfS9hcGkvdjEvc3RhdHVzZXNgLFxyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogYEJlYXJlciAke2Rlc3RpbmF0aW9uLmFjY2Vzc1Rva2VufWAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN0YXR1czogc3RhdHVzVGV4dCwgdmlzaWJpbGl0eTogXCJwdWJsaWNcIiB9KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c1VybDogc3RyaW5nID0gcmVzcG9uc2UuanNvbj8udXJsIHx8IGluc3RhbmNlVXJsO1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYFBPU1NFZCBcIiR7dGl0bGV9XCIgdG8gTWFzdG9kb25gKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiTWFzdG9kb25cIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy53cml0ZVN5bmRpY2F0aW9uKGZpbGUsIGRlc3RpbmF0aW9uLm5hbWUsIHN0YXR1c1VybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSByZXNwb25zZS5qc29uPy5lcnJvciB8fCBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIGNhdGNoIHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcocmVzcG9uc2Uuc3RhdHVzKTsgfVxyXG4gICAgICAgIG5ldyBOb3RpY2UoYE1hc3RvZG9uIFBPU1NFIGZhaWxlZDogJHtlcnJvckRldGFpbH1gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYE1hc3RvZG9uIGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoIHRvIEJsdWVza3kgdmlhIEFUIFByb3RvY29sLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgcHVibGlzaFRvQmx1ZXNreShcclxuICAgIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbixcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgKSB7XHJcbiAgICBjb25zdCB0aXRsZSA9IHBheWxvYWQudGl0bGUgYXMgc3RyaW5nO1xyXG4gICAgdHJ5IHtcclxuICAgICAgbmV3IE5vdGljZShgUE9TU0VpbmcgXCIke3RpdGxlfVwiIFx1MjE5MiBCbHVlc2t5ICgke2Rlc3RpbmF0aW9uLm5hbWV9KS4uLmApO1xyXG5cclxuICAgICAgLy8gQXV0aGVudGljYXRlXHJcbiAgICAgIGNvbnN0IGF1dGhSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8uc2VydmVyLmNyZWF0ZVNlc3Npb25cIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICBpZGVudGlmaWVyOiBkZXN0aW5hdGlvbi5oYW5kbGUsXHJcbiAgICAgICAgICBwYXNzd29yZDogZGVzdGluYXRpb24uYXBwUGFzc3dvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoYXV0aFJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCBhdXRoUmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xyXG4gICAgICAgIG5ldyBOb3RpY2UoYEJsdWVza3kgYXV0aCBmYWlsZWQ6ICR7YXV0aFJlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgeyBkaWQsIGFjY2Vzc0p3dCB9ID0gYXV0aFJlc3BvbnNlLmpzb24gYXMgeyBkaWQ6IHN0cmluZzsgYWNjZXNzSnd0OiBzdHJpbmcgfTtcclxuXHJcbiAgICAgIC8vIEJ1aWxkIHBvc3QgdGV4dCAoMzAwIGNoYXIgbGltaXQpXHJcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IChwYXlsb2FkLmNhbm9uaWNhbFVybCBhcyBzdHJpbmcpIHx8IFwiXCI7XHJcbiAgICAgIGNvbnN0IGV4Y2VycHQgPSAocGF5bG9hZC5leGNlcnB0IGFzIHN0cmluZykgfHwgXCJcIjtcclxuICAgICAgY29uc3QgYmFzZVRleHQgPSBbdGl0bGUsIGV4Y2VycHRdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFx1MjAxNCBcIik7XHJcbiAgICAgIGNvbnN0IG1heFRleHQgPSAzMDAgLSAoY2Fub25pY2FsVXJsID8gY2Fub25pY2FsVXJsLmxlbmd0aCArIDEgOiAwKTtcclxuICAgICAgY29uc3QgdGV4dCA9IChiYXNlVGV4dC5sZW5ndGggPiBtYXhUZXh0XHJcbiAgICAgICAgPyBiYXNlVGV4dC5zdWJzdHJpbmcoMCwgbWF4VGV4dCAtIDEpICsgXCJcdTIwMjZcIlxyXG4gICAgICAgIDogYmFzZVRleHRcclxuICAgICAgKSArIChjYW5vbmljYWxVcmwgPyBgICR7Y2Fub25pY2FsVXJsfWAgOiBcIlwiKTtcclxuXHJcbiAgICAgIGNvbnN0IHBvc3RSZWNvcmQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xyXG4gICAgICAgICR0eXBlOiBcImFwcC5ic2t5LmZlZWQucG9zdFwiLFxyXG4gICAgICAgIHRleHQsXHJcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgbGFuZ3M6IFtcImVuXCJdLFxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoY2Fub25pY2FsVXJsKSB7XHJcbiAgICAgICAgY29uc3QgdXJsU3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKGNhbm9uaWNhbFVybCk7XHJcbiAgICAgICAgcG9zdFJlY29yZC5mYWNldHMgPSBbe1xyXG4gICAgICAgICAgaW5kZXg6IHsgYnl0ZVN0YXJ0OiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGV4dC5zdWJzdHJpbmcoMCwgdXJsU3RhcnQpKS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICBieXRlRW5kOiAgIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh0ZXh0LnN1YnN0cmluZygwLCB1cmxTdGFydCArIGNhbm9uaWNhbFVybC5sZW5ndGgpKS5sZW5ndGggfSxcclxuICAgICAgICAgIGZlYXR1cmVzOiBbeyAkdHlwZTogXCJhcHAuYnNreS5yaWNodGV4dC5mYWNldCNsaW5rXCIsIHVyaTogY2Fub25pY2FsVXJsIH1dLFxyXG4gICAgICAgIH1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL2Jza3kuc29jaWFsL3hycGMvY29tLmF0cHJvdG8ucmVwby5jcmVhdGVSZWNvcmRcIixcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGBCZWFyZXIgJHthY2Nlc3NKd3R9YCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgIHJlcG86IGRpZCxcclxuICAgICAgICAgIGNvbGxlY3Rpb246IFwiYXBwLmJza3kuZmVlZC5wb3N0XCIsXHJcbiAgICAgICAgICByZWNvcmQ6IHBvc3RSZWNvcmQsXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoY3JlYXRlUmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiBjcmVhdGVSZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcclxuICAgICAgICBjb25zdCB1cmk6IHN0cmluZyA9IGNyZWF0ZVJlc3BvbnNlLmpzb24/LnVyaSB8fCBcIlwiO1xyXG4gICAgICAgIGNvbnN0IHBvc3RVcmwgPSB1cmlcclxuICAgICAgICAgID8gYGh0dHBzOi8vYnNreS5hcHAvcHJvZmlsZS8ke2Rlc3RpbmF0aW9uLmhhbmRsZX0vcG9zdC8ke3VyaS5zcGxpdChcIi9cIikucG9wKCl9YFxyXG4gICAgICAgICAgOiBcImh0dHBzOi8vYnNreS5hcHBcIjtcclxuICAgICAgICBuZXcgTm90aWNlKGBQT1NTRWQgXCIke3RpdGxlfVwiIHRvIEJsdWVza3lgKTtcclxuICAgICAgICB0aGlzLnNob3dTdGF0dXNCYXJTdWNjZXNzKFwiQmx1ZXNreVwiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLndyaXRlU3luZGljYXRpb24oZmlsZSwgZGVzdGluYXRpb24ubmFtZSwgcG9zdFVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGVycm9yRGV0YWlsOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHsgZXJyb3JEZXRhaWwgPSBTdHJpbmcoY3JlYXRlUmVzcG9uc2UuanNvbj8ubWVzc2FnZSB8fCBjcmVhdGVSZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgY2F0Y2ggeyBlcnJvckRldGFpbCA9IFN0cmluZyhjcmVhdGVSZXNwb25zZS5zdGF0dXMpOyB9XHJcbiAgICAgICAgbmV3IE5vdGljZShgQmx1ZXNreSBQT1NTRSBmYWlsZWQ6ICR7ZXJyb3JEZXRhaWx9YCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBuZXcgTm90aWNlKGBCbHVlc2t5IGVycm9yOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQT1NTRSB0byBhbGwgY29uZmlndXJlZCBkZXN0aW5hdGlvbnMgYXQgb25jZS4gKi9cclxuICBwcml2YXRlIGFzeW5jIHBvc3NlVG9BbGwob3ZlcnJpZGVTdGF0dXM/OiBcImRyYWZ0XCIgfCBcInB1Ymxpc2hlZFwiKSB7XHJcbiAgICBjb25zdCB7IGRlc3RpbmF0aW9ucyB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChkZXN0aW5hdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJBZGQgYXQgbGVhc3Qgb25lIGRlc3RpbmF0aW9uIGluIFBPU1NFIFB1Ymxpc2hlciBzZXR0aW5nc1wiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcbiAgICBpZiAoIXZpZXcgfHwgIXZpZXcuZmlsZSkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiT3BlbiBhIG1hcmtkb3duIGZpbGUgZmlyc3RcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jYWNoZWRSZWFkKHZpZXcuZmlsZSk7XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3QgZnJvbnRtYXR0ZXIgPSBidWlsZEZyb250bWF0dGVyKGZpbGVDYWNoZT8uZnJvbnRtYXR0ZXIpO1xyXG4gICAgY29uc3QgYm9keSA9IGV4dHJhY3RCb2R5KGNvbnRlbnQpO1xyXG4gICAgY29uc3QgcHJvY2Vzc2VkQm9keSA9IHRoaXMuc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheCA/IHByZXByb2Nlc3NDb250ZW50KGJvZHkpIDogYm9keTtcclxuICAgIGNvbnN0IHRpdGxlID0gZnJvbnRtYXR0ZXIudGl0bGUgfHwgdmlldy5maWxlLmJhc2VuYW1lIHx8IFwiVW50aXRsZWRcIjtcclxuICAgIGNvbnN0IHNsdWcgPSBmcm9udG1hdHRlci5zbHVnIHx8IHRvU2x1Zyh0aXRsZSk7XHJcbiAgICBjb25zdCBzdGF0dXMgPSBvdmVycmlkZVN0YXR1cyB8fCBmcm9udG1hdHRlci5zdGF0dXMgfHwgdGhpcy5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzO1xyXG4gICAgY29uc3QgcG9zdFR5cGUgPSBmcm9udG1hdHRlci50eXBlIHx8IFwiYmxvZ1wiO1xyXG4gICAgY29uc3QgY2Fub25pY2FsVXJsID0gdGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsXHJcbiAgICAgID8gYCR7dGhpcy5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vJHtwb3N0VHlwZX0vJHtzbHVnfWBcclxuICAgICAgOiBcIlwiO1xyXG4gICAgY29uc3QgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XHJcbiAgICAgIHRpdGxlLCBzbHVnLCBib2R5OiBwcm9jZXNzZWRCb2R5LFxyXG4gICAgICBleGNlcnB0OiBmcm9udG1hdHRlci5leGNlcnB0IHx8IFwiXCIsXHJcbiAgICAgIHR5cGU6IHBvc3RUeXBlLCBzdGF0dXMsXHJcbiAgICAgIHRhZ3M6IGZyb250bWF0dGVyLnRhZ3MgfHwgW10sXHJcbiAgICAgIHBpbGxhcjogZnJvbnRtYXR0ZXIucGlsbGFyIHx8IFwiXCIsXHJcbiAgICAgIGZlYXR1cmVkOiBmcm9udG1hdHRlci5mZWF0dXJlZCB8fCBmYWxzZSxcclxuICAgICAgY292ZXJJbWFnZTogZnJvbnRtYXR0ZXIuY292ZXJJbWFnZSB8fCBcIlwiLFxyXG4gICAgICBtZXRhVGl0bGU6IGZyb250bWF0dGVyLm1ldGFUaXRsZSB8fCBcIlwiLFxyXG4gICAgICBtZXRhRGVzY3JpcHRpb246IGZyb250bWF0dGVyLm1ldGFEZXNjcmlwdGlvbiB8fCBcIlwiLFxyXG4gICAgICBvZ0ltYWdlOiBmcm9udG1hdHRlci5vZ0ltYWdlIHx8IFwiXCIsXHJcbiAgICAgIHZpZGVvVXJsOiBmcm9udG1hdHRlci52aWRlb1VybCB8fCBcIlwiLFxyXG4gICAgICAuLi4oY2Fub25pY2FsVXJsICYmIHsgY2Fub25pY2FsVXJsIH0pLFxyXG4gICAgfTtcclxuICAgIG5ldyBOb3RpY2UoYFBPU1NFaW5nIFwiJHt0aXRsZX1cIiB0byAke2Rlc3RpbmF0aW9ucy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpLi4uYCk7XHJcbiAgICBmb3IgKGNvbnN0IGRlc3Qgb2YgZGVzdGluYXRpb25zKSB7XHJcbiAgICAgIGlmICh0aGlzLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdCkpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1Ymxpc2hUb0Rlc3RpbmF0aW9uKGRlc3QsIHBheWxvYWQsIHZpZXcuZmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgU2tpcHBpbmcgXCIke2Rlc3QubmFtZX1cIiBcdTIwMTQgY3JlZGVudGlhbHMgbm90IGNvbmZpZ3VyZWRgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrIHdoZXRoZXIgYSBkZXN0aW5hdGlvbiBoYXMgdGhlIHJlcXVpcmVkIGNyZWRlbnRpYWxzIGNvbmZpZ3VyZWQuICovXHJcbiAgaGFzVmFsaWRDcmVkZW50aWFscyhkZXN0OiBEZXN0aW5hdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgc3dpdGNoIChkZXN0LnR5cGUpIHtcclxuICAgICAgY2FzZSBcImRldnRvXCI6ICAgIHJldHVybiAhIWRlc3QuYXBpS2V5O1xyXG4gICAgICBjYXNlIFwibWFzdG9kb25cIjogcmV0dXJuICEhKGRlc3QuaW5zdGFuY2VVcmwgJiYgZGVzdC5hY2Nlc3NUb2tlbik7XHJcbiAgICAgIGNhc2UgXCJibHVlc2t5XCI6ICByZXR1cm4gISEoZGVzdC5oYW5kbGUgJiYgZGVzdC5hcHBQYXNzd29yZCk7XHJcbiAgICAgIGRlZmF1bHQ6ICAgICAgICAgcmV0dXJuICEhKGRlc3QudXJsICYmIGRlc3QuYXBpS2V5KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXcml0ZSBhIHN5bmRpY2F0aW9uIGVudHJ5IGJhY2sgaW50byB0aGUgbm90ZSdzIGZyb250bWF0dGVyLiAqL1xyXG4gIHByaXZhdGUgYXN5bmMgd3JpdGVTeW5kaWNhdGlvbihmaWxlOiBURmlsZSwgbmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZykge1xyXG4gICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmbSkgPT4ge1xyXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZm0uc3luZGljYXRpb24pKSBmbS5zeW5kaWNhdGlvbiA9IFtdO1xyXG4gICAgICBjb25zdCBhbHJlYWR5ID0gKGZtLnN5bmRpY2F0aW9uIGFzIEFycmF5PHsgbmFtZT86IHN0cmluZyB9Pikuc29tZSgocykgPT4gcy5uYW1lID09PSBuYW1lKTtcclxuICAgICAgaWYgKCFhbHJlYWR5KSBmbS5zeW5kaWNhdGlvbi5wdXNoKHsgdXJsLCBuYW1lIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dTdGF0dXNCYXJTdWNjZXNzKHNpdGVOYW1lOiBzdHJpbmcpIHtcclxuICAgIGlmICghdGhpcy5zdGF0dXNCYXJFbCkgcmV0dXJuO1xyXG4gICAgdGhpcy5zdGF0dXNCYXJFbC5zZXRUZXh0KGBQT1NTRWQgXHUyNzEzICR7c2l0ZU5hbWV9YCk7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXR1c0JhckVsKSB0aGlzLnN0YXR1c0JhckVsLnNldFRleHQoXCJcIik7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcblxyXG4gIC8qKiBTaG93IGN1cnJlbnQgc3luZGljYXRpb24gc3RhdHVzIGZvciB0aGUgYWN0aXZlIG5vdGUuICovXHJcbiAgcHJpdmF0ZSBwb3NzZVN0YXR1cygpIHtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3IHx8ICF2aWV3LmZpbGUpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBtYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWxlQ2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh2aWV3LmZpbGUpO1xyXG4gICAgY29uc3Qgc3luZGljYXRpb24gPSBmaWxlQ2FjaGU/LmZyb250bWF0dGVyPy5zeW5kaWNhdGlvbjtcclxuICAgIGNvbnN0IHRpdGxlID0gZmlsZUNhY2hlPy5mcm9udG1hdHRlcj8udGl0bGUgfHwgdmlldy5maWxlLmJhc2VuYW1lO1xyXG4gICAgbmV3IFBvc3NlU3RhdHVzTW9kYWwodGhpcy5hcHAsIHRpdGxlLCBzeW5kaWNhdGlvbikub3BlbigpO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIENvbmZpcm1hdGlvbiBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbmNsYXNzIENvbmZpcm1QdWJsaXNoTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcbiAgcHJpdmF0ZSBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbjtcclxuICBwcml2YXRlIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBhcHA6IEFwcCxcclxuICAgIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxyXG4gICAgZGVzdGluYXRpb246IERlc3RpbmF0aW9uLFxyXG4gICAgb25Db25maXJtOiAoKSA9PiB2b2lkLFxyXG4gICkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XHJcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9uQ29uZmlybTtcclxuICB9XHJcblxyXG4gIG9uT3BlbigpIHtcclxuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwicG9zc2UtcHVibGlzaGVyLWNvbmZpcm0tbW9kYWxcIik7XHJcblxyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkNvbmZpcm0gUE9TU0VcIiB9KTtcclxuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwge1xyXG4gICAgICB0ZXh0OiBgWW91IGFyZSBhYm91dCB0byBQT1NTRSB0byAke3RoaXMuZGVzdGluYXRpb24ubmFtZX06YCxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHN1bW1hcnkgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInB1Ymxpc2gtc3VtbWFyeVwiIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUaXRsZTogJHt0aGlzLnBheWxvYWQudGl0bGV9YCB9KTtcclxuICAgIHN1bW1hcnkuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBgU2x1ZzogJHt0aGlzLnBheWxvYWQuc2x1Z31gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBTdGF0dXM6ICR7dGhpcy5wYXlsb2FkLnN0YXR1c31gIH0pO1xyXG4gICAgc3VtbWFyeS5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGBUeXBlOiAke3RoaXMucGF5bG9hZC50eXBlfWAgfSk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG5cclxuICAgIGNvbnN0IGNhbmNlbEJ0biA9IGJ1dHRvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIkNhbmNlbFwiIH0pO1xyXG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xyXG5cclxuICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgdGV4dDogXCJQT1NTRVwiLFxyXG4gICAgICBjbHM6IFwibW9kLWN0YVwiLFxyXG4gICAgfSk7XHJcbiAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgdGhpcy5vbkNvbmZpcm0oKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DbG9zZSgpIHtcclxuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2l0ZSBQaWNrZXIgTW9kYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXHJcblxyXG5jbGFzcyBTaXRlUGlja2VyTW9kYWwgZXh0ZW5kcyBTdWdnZXN0TW9kYWw8RGVzdGluYXRpb24+IHtcclxuICBwcml2YXRlIGRlc3RpbmF0aW9uczogRGVzdGluYXRpb25bXTtcclxuICBwcml2YXRlIG9uQ2hvb3NlOiAoZGVzdGluYXRpb246IERlc3RpbmF0aW9uKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgZGVzdGluYXRpb25zOiBEZXN0aW5hdGlvbltdLCBvbkNob29zZTogKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikgPT4gdm9pZCkge1xyXG4gICAgc3VwZXIoYXBwKTtcclxuICAgIHRoaXMuZGVzdGluYXRpb25zID0gZGVzdGluYXRpb25zO1xyXG4gICAgdGhpcy5vbkNob29zZSA9IG9uQ2hvb3NlO1xyXG4gICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIkNob29zZSBhIGRlc3RpbmF0aW9uIHRvIFBPU1NFIHRvLi4uXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IERlc3RpbmF0aW9uW10ge1xyXG4gICAgY29uc3QgbG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25zLmZpbHRlcihcclxuICAgICAgKGQpID0+XHJcbiAgICAgICAgZC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXIpIHx8XHJcbiAgICAgICAgZC51cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlciksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyU3VnZ2VzdGlvbihkZXN0aW5hdGlvbjogRGVzdGluYXRpb24sIGVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgZWwuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBkZXN0aW5hdGlvbi5uYW1lLCBjbHM6IFwic3VnZ2VzdGlvbi10aXRsZVwiIH0pO1xyXG4gICAgZWwuY3JlYXRlRWwoXCJzbWFsbFwiLCB7IHRleHQ6IGRlc3RpbmF0aW9uLnVybCwgY2xzOiBcInN1Z2dlc3Rpb24tbm90ZVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgb25DaG9vc2VTdWdnZXN0aW9uKGRlc3RpbmF0aW9uOiBEZXN0aW5hdGlvbikge1xyXG4gICAgdGhpcy5vbkNob29zZShkZXN0aW5hdGlvbik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDAgU2V0dGluZ3MgVGFiIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xyXG5cclxuY2xhc3MgUG9zc2VQdWJsaXNoZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBQb3NzZVB1Ymxpc2hlclBsdWdpbjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogUG9zc2VQdWJsaXNoZXJQbHVnaW4pIHtcclxuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gIH1cclxuXHJcbiAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIllvdXIgQ2Fub25pY2FsIFNpdGVcIiB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJDYW5vbmljYWwgQmFzZSBVUkxcIilcclxuICAgICAgLnNldERlc2MoXCJZb3VyIG93biBzaXRlJ3Mgcm9vdCBVUkwuIEV2ZXJ5IHB1Ymxpc2hlZCBwb3N0IHdpbGwgaW5jbHVkZSBhIGNhbm9uaWNhbFVybCBwb2ludGluZyBoZXJlIFx1MjAxNCB0aGUgb3JpZ2luYWwgeW91IG93bi5cIilcclxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgdGV4dFxyXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly95b3Vyc2l0ZS5jb21cIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYW5vbmljYWxCYXNlVXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cDovL2xvY2FsaG9zdFwiKSkge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXYXJuaW5nOiBDYW5vbmljYWwgQmFzZSBVUkwgc2hvdWxkIHN0YXJ0IHdpdGggaHR0cHM6Ly9cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJEZXN0aW5hdGlvbnNcIiB9KTtcclxuXHJcbiAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMuZm9yRWFjaCgoZGVzdGluYXRpb24sIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGRlc3RDb250YWluZXIgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoe1xyXG4gICAgICAgIGNsczogXCJwb3NzZS1wdWJsaXNoZXItc2l0ZVwiLFxyXG4gICAgICB9KTtcclxuICAgICAgZGVzdENvbnRhaW5lci5jcmVhdGVFbChcImgzXCIsIHtcclxuICAgICAgICB0ZXh0OiBkZXN0aW5hdGlvbi5uYW1lIHx8IGBEZXN0aW5hdGlvbiAke2luZGV4ICsgMX1gLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJEZXN0aW5hdGlvbiBOYW1lXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJBIGxhYmVsIGZvciB0aGlzIGRlc3RpbmF0aW9uIChlLmcuIE15IEJsb2cpXCIpXHJcbiAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIk15IFNpdGVcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLm5hbWUpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLm5hbWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgLnNldE5hbWUoXCJUeXBlXCIpXHJcbiAgICAgICAgLnNldERlc2MoXCJQbGF0Zm9ybSB0byBwdWJsaXNoIHRvXCIpXHJcbiAgICAgICAgLmFkZERyb3Bkb3duKChkZCkgPT5cclxuICAgICAgICAgIGRkXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb24oXCJjdXN0b20tYXBpXCIsIFwiQ3VzdG9tIEFQSVwiKVxyXG4gICAgICAgICAgICAuYWRkT3B0aW9uKFwiZGV2dG9cIiwgXCJEZXYudG9cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcIm1hc3RvZG9uXCIsIFwiTWFzdG9kb25cIilcclxuICAgICAgICAgICAgLmFkZE9wdGlvbihcImJsdWVza3lcIiwgXCJCbHVlc2t5XCIpXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi50eXBlIHx8IFwiY3VzdG9tLWFwaVwiKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS50eXBlID0gdmFsdWUgYXMgRGVzdGluYXRpb25UeXBlO1xyXG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgY29uc3QgZGVzdFR5cGUgPSBkZXN0aW5hdGlvbi50eXBlIHx8IFwiY3VzdG9tLWFwaVwiO1xyXG5cclxuICAgICAgaWYgKGRlc3RUeXBlID09PSBcImN1c3RvbS1hcGlcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIlNpdGUgVVJMXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgc2l0ZSdzIGJhc2UgVVJMIChtdXN0IHN0YXJ0IHdpdGggaHR0cHM6Ly8pXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vZXhhbXBsZS5jb21cIilcclxuICAgICAgICAgICAgICAuc2V0VmFsdWUoZGVzdGluYXRpb24udXJsIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS51cmwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiaHR0cDovL2xvY2FsaG9zdFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiV2FybmluZzogRGVzdGluYXRpb24gVVJMIHNob3VsZCBzdGFydCB3aXRoIGh0dHBzOi8vXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFQSSBLZXlcIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiUFVCTElTSF9BUElfS0VZIGZyb20geW91ciBzaXRlJ3MgZW52aXJvbm1lbnRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwaUtleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBpS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwiZGV2dG9cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkRldi50byBBUEkgS2V5XCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIkZyb20gaHR0cHM6Ly9kZXYudG8vc2V0dGluZ3MvZXh0ZW5zaW9uc1wiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcclxuICAgICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkVudGVyIERldi50byBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwaUtleSB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uYXBpS2V5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGV4dC5pbnB1dEVsLnR5cGUgPSBcInBhc3N3b3JkXCI7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC5hdXRvY29tcGxldGUgPSBcIm9mZlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzdFR5cGUgPT09IFwibWFzdG9kb25cIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkluc3RhbmNlIFVSTFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJZb3VyIE1hc3RvZG9uIGluc3RhbmNlIChlLmcuIGh0dHBzOi8vbWFzdG9kb24uc29jaWFsKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJodHRwczovL21hc3RvZG9uLnNvY2lhbFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5pbnN0YW5jZVVybCB8fCBcIlwiKVxyXG4gICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlc3RpbmF0aW9uc1tpbmRleF0uaW5zdGFuY2VVcmwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgICAgLnNldE5hbWUoXCJBY2Nlc3MgVG9rZW5cIilcclxuICAgICAgICAgIC5zZXREZXNjKFwiRnJvbSB5b3VyIE1hc3RvZG9uIGFjY291bnQ6IFNldHRpbmdzIFx1MjE5MiBEZXZlbG9wbWVudCBcdTIxOTIgTmV3IEFwcGxpY2F0aW9uXCIpXHJcbiAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRW50ZXIgYWNjZXNzIHRva2VuXCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFjY2Vzc1Rva2VuIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hY2Nlc3NUb2tlbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlc3RUeXBlID09PSBcImJsdWVza3lcIikge1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkJsdWVza3kgSGFuZGxlXCIpXHJcbiAgICAgICAgICAuc2V0RGVzYyhcIllvdXIgaGFuZGxlIChlLmcuIHlvdXJuYW1lLmJza3kuc29jaWFsKVwiKVxyXG4gICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJ5b3VybmFtZS5ic2t5LnNvY2lhbFwiKVxyXG4gICAgICAgICAgICAgIC5zZXRWYWx1ZShkZXN0aW5hdGlvbi5oYW5kbGUgfHwgXCJcIilcclxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnNbaW5kZXhdLmhhbmRsZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIG5ldyBTZXR0aW5nKGRlc3RDb250YWluZXIpXHJcbiAgICAgICAgICAuc2V0TmFtZShcIkFwcCBQYXNzd29yZFwiKVxyXG4gICAgICAgICAgLnNldERlc2MoXCJGcm9tIGh0dHBzOi8vYnNreS5hcHAvc2V0dGluZ3MvYXBwLXBhc3N3b3JkcyBcdTIwMTQgTk9UIHlvdXIgbG9naW4gcGFzc3dvcmRcIilcclxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJ4eHh4LXh4eHgteHh4eC14eHh4XCIpXHJcbiAgICAgICAgICAgICAgLnNldFZhbHVlKGRlc3RpbmF0aW9uLmFwcFBhc3N3b3JkIHx8IFwiXCIpXHJcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVzdGluYXRpb25zW2luZGV4XS5hcHBQYXNzd29yZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xyXG4gICAgICAgICAgICB0ZXh0LmlucHV0RWwuYXV0b2NvbXBsZXRlID0gXCJvZmZcIjtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXcgU2V0dGluZyhkZXN0Q29udGFpbmVyKVxyXG4gICAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KFwiVGVzdCBDb25uZWN0aW9uXCIpLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGx1Z2luLmhhc1ZhbGlkQ3JlZGVudGlhbHMoZGVzdGluYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShcIkNvbmZpZ3VyZSBjcmVkZW50aWFscyBmaXJzdFwiKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlc3RUeXBlID09PSBcImN1c3RvbS1hcGlcIikge1xyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgJHtkZXN0aW5hdGlvbi51cmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpfS9hcGkvcHVibGlzaGA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJPUFRJT05TXCIsXHJcbiAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJ4LXB1Ymxpc2gta2V5XCI6IGRlc3RpbmF0aW9uLmFwaUtleSB9LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCA0MDApIHtcclxuICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHUyNzEzIENvbm5lY3Rpb24gdG8gJHtkZXN0aW5hdGlvbi5uYW1lIHx8IGRlc3RpbmF0aW9uLnVybH0gc3VjY2Vzc2Z1bGApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHUyNzE3ICR7ZGVzdGluYXRpb24ubmFtZSB8fCBkZXN0aW5hdGlvbi51cmx9IHJlc3BvbmRlZCB3aXRoICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHUyNzE3IENvdWxkIG5vdCByZWFjaCAke2Rlc3RpbmF0aW9uLm5hbWUgfHwgZGVzdGluYXRpb24udXJsfWApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBuZXcgTm90aWNlKGBDcmVkZW50aWFscyBsb29rIGNvbmZpZ3VyZWQgZm9yICR7ZGVzdGluYXRpb24ubmFtZX0uIFB1Ymxpc2ggdG8gdGVzdC5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5hZGRCdXR0b24oKGJ0bikgPT5cclxuICAgICAgICAgIGJ0blxyXG4gICAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIlJlbW92ZSBEZXN0aW5hdGlvblwiKVxyXG4gICAgICAgICAgICAuc2V0V2FybmluZygpXHJcbiAgICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBjb25maXJtRWwgPSBkZXN0Q29udGFpbmVyLmNyZWF0ZURpdih7XHJcbiAgICAgICAgICAgICAgICBjbHM6IFwic2V0dGluZy1pdGVtXCIsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uZmlybUVsLmNyZWF0ZUVsKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBgUmVtb3ZlIFwiJHtkZXN0aW5hdGlvbi5uYW1lIHx8IFwidGhpcyBkZXN0aW5hdGlvblwifVwiPyBgLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHllc0J0biA9IGNvbmZpcm1FbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlllcywgcmVtb3ZlXCIsXHJcbiAgICAgICAgICAgICAgICBjbHM6IFwibW9kLXdhcm5pbmdcIixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25zdCBub0J0biA9IGNvbmZpcm1FbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiQ2FuY2VsXCIgfSk7XHJcbiAgICAgICAgICAgICAgeWVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgbm9CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGNvbmZpcm1FbC5yZW1vdmUoKSk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgIGJ0blxyXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoXCJBZGQgRGVzdGluYXRpb25cIilcclxuICAgICAgICAgIC5zZXRDdGEoKVxyXG4gICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZXN0aW5hdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCJcIixcclxuICAgICAgICAgICAgICB0eXBlOiBcImN1c3RvbS1hcGlcIixcclxuICAgICAgICAgICAgICB1cmw6IFwiXCIsXHJcbiAgICAgICAgICAgICAgYXBpS2V5OiBcIlwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiRGVmYXVsdHNcIiB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJEZWZhdWx0IFN0YXR1c1wiKVxyXG4gICAgICAuc2V0RGVzYyhcIkRlZmF1bHQgcHVibGlzaCBzdGF0dXMgd2hlbiBub3Qgc3BlY2lmaWVkIGluIGZyb250bWF0dGVyXCIpXHJcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XHJcbiAgICAgICAgZHJvcGRvd25cclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJkcmFmdFwiLCBcIkRyYWZ0XCIpXHJcbiAgICAgICAgICAuYWRkT3B0aW9uKFwicHVibGlzaGVkXCIsIFwiUHVibGlzaGVkXCIpXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFN0YXR1cylcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFN0YXR1cyA9IHZhbHVlIGFzXHJcbiAgICAgICAgICAgICAgfCBcImRyYWZ0XCJcclxuICAgICAgICAgICAgICB8IFwicHVibGlzaGVkXCI7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiQ29uZmlybSBCZWZvcmUgUHVibGlzaGluZ1wiKVxyXG4gICAgICAuc2V0RGVzYyhcIlNob3cgYSBjb25maXJtYXRpb24gbW9kYWwgd2l0aCBwb3N0IGRldGFpbHMgYmVmb3JlIHB1Ymxpc2hpbmdcIilcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbmZpcm1CZWZvcmVQdWJsaXNoKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb25maXJtQmVmb3JlUHVibGlzaCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIlN0cmlwIE9ic2lkaWFuIFN5bnRheFwiKVxyXG4gICAgICAuc2V0RGVzYyhcclxuICAgICAgICBcIkNvbnZlcnQgd2lraS1saW5rcywgcmVtb3ZlIGVtYmVkcywgY29tbWVudHMsIGFuZCBkYXRhdmlldyBibG9ja3MgYmVmb3JlIHB1Ymxpc2hpbmdcIixcclxuICAgICAgKVxyXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheClcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3RyaXBPYnNpZGlhblN5bnRheCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyogXHUyNTAwXHUyNTAwXHUyNTAwIFBPU1NFIFN0YXR1cyBNb2RhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cclxuXHJcbnR5cGUgU3luZGljYXRpb25FbnRyeSA9IHsgdXJsPzogc3RyaW5nOyBuYW1lPzogc3RyaW5nIH07XHJcblxyXG5jbGFzcyBQb3NzZVN0YXR1c01vZGFsIGV4dGVuZHMgTW9kYWwge1xyXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZztcclxuICBwcml2YXRlIHN5bmRpY2F0aW9uOiBTeW5kaWNhdGlvbkVudHJ5W10gfCB1bmtub3duO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgdGl0bGU6IHN0cmluZywgc3luZGljYXRpb246IHVua25vd24pIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XHJcbiAgICB0aGlzLnN5bmRpY2F0aW9uID0gc3luZGljYXRpb247XHJcbiAgfVxyXG5cclxuICBvbk9wZW4oKSB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5hZGRDbGFzcyhcInBvc3NlLXB1Ymxpc2hlci1jb25maXJtLW1vZGFsXCIpO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlBPU1NFIFN0YXR1c1wiIH0pO1xyXG4gICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IGBOb3RlOiAke3RoaXMudGl0bGV9YCB9KTtcclxuXHJcbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuaXNBcnJheSh0aGlzLnN5bmRpY2F0aW9uKVxyXG4gICAgICA/ICh0aGlzLnN5bmRpY2F0aW9uIGFzIFN5bmRpY2F0aW9uRW50cnlbXSlcclxuICAgICAgOiBbXTtcclxuXHJcbiAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7XHJcbiAgICAgICAgdGV4dDogXCJUaGlzIG5vdGUgaGFzIG5vdCBiZWVuIFBPU1NFZCB0byBhbnkgZGVzdGluYXRpb24geWV0LlwiLFxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcInN0cm9uZ1wiLCB7IHRleHQ6IGBTeW5kaWNhdGVkIHRvICR7ZW50cmllcy5sZW5ndGh9IGRlc3RpbmF0aW9uKHMpOmAgfSk7XHJcbiAgICAgIGNvbnN0IGxpc3QgPSBjb250ZW50RWwuY3JlYXRlRWwoXCJ1bFwiKTtcclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgY29uc3QgbGkgPSBsaXN0LmNyZWF0ZUVsKFwibGlcIik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnVybCkge1xyXG4gICAgICAgICAgY29uc3QgYSA9IGxpLmNyZWF0ZUVsKFwiYVwiLCB7IHRleHQ6IGVudHJ5Lm5hbWUgfHwgZW50cnkudXJsIH0pO1xyXG4gICAgICAgICAgYS5ocmVmID0gZW50cnkudXJsO1xyXG4gICAgICAgICAgYS50YXJnZXQgPSBcIl9ibGFua1wiO1xyXG4gICAgICAgICAgYS5yZWwgPSBcIm5vb3BlbmVyXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxpLnNldFRleHQoZW50cnkubmFtZSB8fCBcIlVua25vd25cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYnV0dG9ucyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibW9kYWwtYnV0dG9uLWNvbnRhaW5lclwiIH0pO1xyXG4gICAgY29uc3QgY2xvc2VCdG4gPSBidXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJDbG9zZVwiIH0pO1xyXG4gICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XHJcbiAgfVxyXG5cclxuICBvbkNsb3NlKCkge1xyXG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQVdPO0FBMEJQLElBQU0sbUJBQTJDO0FBQUEsRUFDL0MsY0FBYyxDQUFDO0FBQUEsRUFDZixrQkFBa0I7QUFBQSxFQUNsQixlQUFlO0FBQUEsRUFDZixzQkFBc0I7QUFBQSxFQUN0QixxQkFBcUI7QUFDdkI7QUFvQkEsU0FBUyxZQUFZLFNBQXlCO0FBQzVDLFFBQU0sUUFBUSxRQUFRLE1BQU0sMkNBQTJDO0FBQ3ZFLFNBQU8sUUFBUSxNQUFNLENBQUMsRUFBRSxLQUFLLElBQUk7QUFDbkM7QUFNQSxTQUFTLGlCQUFpQixPQUF5RDtBQUNqRixN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
