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
  default: () => PublishBlogToWebPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  sites: [],
  defaultStatus: "draft"
};
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  const fm = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    switch (key) {
      case "title":
        fm.title = value;
        break;
      case "slug":
        fm.slug = value;
        break;
      case "excerpt":
        fm.excerpt = value;
        break;
      case "type":
        fm.type = value;
        break;
      case "status":
        fm.status = value;
        break;
      case "pillar":
        fm.pillar = value;
        break;
      case "coverImage":
        fm.coverImage = value;
        break;
      case "featured":
        fm.featured = value === "true";
        break;
      case "metaTitle":
        fm.metaTitle = value;
        break;
      case "metaDescription":
        fm.metaDescription = value;
        break;
      case "ogImage":
        fm.ogImage = value;
        break;
      case "videoUrl":
        fm.videoUrl = value;
        break;
      case "tags":
        fm.tags = value.replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()).filter(Boolean);
        break;
    }
  }
  return { frontmatter: fm, body: match[2].trim() };
}
function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
var PublishBlogToWebPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.migrateSettings();
    this.addCommand({
      id: "publish-to-blog",
      name: "Publish to Blog",
      callback: () => this.pickSiteAndPublish()
    });
    this.addCommand({
      id: "publish-draft",
      name: "Publish as Draft",
      callback: () => this.pickSiteAndPublish("draft")
    });
    this.addCommand({
      id: "publish-live",
      name: "Publish Live",
      callback: () => this.pickSiteAndPublish("published")
    });
    this.addSettingTab(new PublishBlogToWebSettingTab(this.app, this));
  }
  /** Migrate from single-site settings (v1) to multi-site (v2) */
  migrateSettings() {
    const raw = this.settings;
    if (typeof raw.siteUrl === "string" && raw.siteUrl) {
      this.settings.sites = [{
        name: "Default",
        url: raw.siteUrl,
        apiKey: raw.apiKey || ""
      }];
      delete raw.siteUrl;
      delete raw.apiKey;
      this.saveSettings();
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!Array.isArray(this.settings.sites)) {
      this.settings.sites = [];
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  pickSiteAndPublish(overrideStatus) {
    const { sites } = this.settings;
    if (sites.length === 0) {
      new import_obsidian.Notice("Add at least one site in plugin settings");
      return;
    }
    if (sites.length === 1) {
      this.publish(sites[0], overrideStatus);
      return;
    }
    new SitePickerModal(this.app, sites, (site) => {
      this.publish(site, overrideStatus);
    }).open();
  }
  async publish(site, overrideStatus) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view) {
      new import_obsidian.Notice("Open a markdown file first");
      return;
    }
    if (!site.url || !site.apiKey) {
      new import_obsidian.Notice(`Configure URL and API key for "${site.name}" in plugin settings`);
      return;
    }
    const content = view.getViewData();
    const { frontmatter, body } = parseFrontmatter(content);
    const title = frontmatter.title || view.file?.basename || "Untitled";
    const slug = frontmatter.slug || toSlug(title);
    const status = overrideStatus || frontmatter.status || this.settings.defaultStatus;
    const payload = {
      title,
      slug,
      body,
      excerpt: frontmatter.excerpt || "",
      type: frontmatter.type || "blog",
      status,
      tags: frontmatter.tags || [],
      pillar: frontmatter.pillar || "",
      featured: frontmatter.featured || false,
      coverImage: frontmatter.coverImage || "",
      metaTitle: frontmatter.metaTitle || "",
      metaDescription: frontmatter.metaDescription || "",
      ogImage: frontmatter.ogImage || "",
      videoUrl: frontmatter.videoUrl || ""
    };
    try {
      new import_obsidian.Notice(`Publishing "${title}" \u2192 ${site.name}...`);
      const url = `${site.url.replace(/\/$/, "")}/api/publish`;
      const response = await (0, import_obsidian.requestUrl)({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publish-key": site.apiKey
        },
        body: JSON.stringify(payload)
      });
      if (response.status >= 200 && response.status < 300) {
        const verb = response.json?.upserted ? "Updated" : "Published";
        new import_obsidian.Notice(`${verb} "${title}" on ${site.name} as ${status}`);
      } else {
        new import_obsidian.Notice(`Publish to ${site.name} failed: ${response.json?.error || response.status}`);
      }
    } catch (err) {
      new import_obsidian.Notice(`Publish error (${site.name}): ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
};
var SitePickerModal = class extends import_obsidian.SuggestModal {
  constructor(app, sites, onChoose) {
    super(app);
    this.sites = sites;
    this.onChoose = onChoose;
    this.setPlaceholder("Choose a site to publish to...");
  }
  getSuggestions(query) {
    const lower = query.toLowerCase();
    return this.sites.filter(
      (s) => s.name.toLowerCase().includes(lower) || s.url.toLowerCase().includes(lower)
    );
  }
  renderSuggestion(site, el) {
    el.createEl("div", { text: site.name, cls: "suggestion-title" });
    el.createEl("small", { text: site.url, cls: "suggestion-note" });
  }
  onChooseSuggestion(site) {
    this.onChoose(site);
  }
};
var PublishBlogToWebSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Sites" });
    this.plugin.settings.sites.forEach((site, index) => {
      const siteContainer = containerEl.createDiv({ cls: "publish-blog-to-web-site" });
      siteContainer.createEl("h3", { text: site.name || `Site ${index + 1}` });
      new import_obsidian.Setting(siteContainer).setName("Site Name").setDesc("A label for this site (e.g. My Blog)").addText(
        (text) => text.setPlaceholder("My Site").setValue(site.name).onChange(async (value) => {
          this.plugin.settings.sites[index].name = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(siteContainer).setName("Site URL").setDesc("The site's base URL").addText(
        (text) => text.setPlaceholder("https://example.com").setValue(site.url).onChange(async (value) => {
          this.plugin.settings.sites[index].url = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(siteContainer).setName("API Key").setDesc("PUBLISH_API_KEY from that site's .env.local").addText(
        (text) => text.setPlaceholder("Enter API key").setValue(site.apiKey).onChange(async (value) => {
          this.plugin.settings.sites[index].apiKey = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(siteContainer).addButton(
        (btn) => btn.setButtonText("Remove Site").setWarning().onClick(async () => {
          this.plugin.settings.sites.splice(index, 1);
          await this.plugin.saveSettings();
          this.display();
        })
      );
    });
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText("Add Site").setCta().onClick(async () => {
        this.plugin.settings.sites.push({ name: "", url: "", apiKey: "" });
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
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBBcHAsIFNldHRpbmcsIE5vdGljZSwgcmVxdWVzdFVybCwgTWFya2Rvd25WaWV3LCBNb2RhbCwgU3VnZ2VzdE1vZGFsIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcblxyXG5pbnRlcmZhY2UgU2l0ZSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHVybDogc3RyaW5nO1xyXG4gIGFwaUtleTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUHVibGlzaEJsb2dUb1dlYlNldHRpbmdzIHtcclxuICBzaXRlczogU2l0ZVtdO1xyXG4gIGRlZmF1bHRTdGF0dXM6IFwiZHJhZnRcIiB8IFwicHVibGlzaGVkXCI7XHJcbn1cclxuXHJcbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFB1Ymxpc2hCbG9nVG9XZWJTZXR0aW5ncyA9IHtcclxuICBzaXRlczogW10sXHJcbiAgZGVmYXVsdFN0YXR1czogXCJkcmFmdFwiLFxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEZyb250bWF0dGVyIHtcclxuICB0aXRsZT86IHN0cmluZztcclxuICBzbHVnPzogc3RyaW5nO1xyXG4gIGV4Y2VycHQ/OiBzdHJpbmc7XHJcbiAgdHlwZT86IHN0cmluZztcclxuICBzdGF0dXM/OiBzdHJpbmc7XHJcbiAgdGFncz86IHN0cmluZ1tdO1xyXG4gIHBpbGxhcj86IHN0cmluZztcclxuICBjb3ZlckltYWdlPzogc3RyaW5nO1xyXG4gIGZlYXR1cmVkPzogYm9vbGVhbjtcclxuICBtZXRhVGl0bGU/OiBzdHJpbmc7XHJcbiAgbWV0YURlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIG9nSW1hZ2U/OiBzdHJpbmc7XHJcbiAgdmlkZW9Vcmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudDogc3RyaW5nKTogeyBmcm9udG1hdHRlcjogRnJvbnRtYXR0ZXI7IGJvZHk6IHN0cmluZyB9IHtcclxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goL14tLS1cXHI/XFxuKFtcXHNcXFNdKj8pXFxyP1xcbi0tLVxccj9cXG4/KFtcXHNcXFNdKikkLyk7XHJcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IHt9LCBib2R5OiBjb250ZW50IH07XHJcblxyXG4gIGNvbnN0IGZtOiBGcm9udG1hdHRlciA9IHt9O1xyXG4gIGNvbnN0IGxpbmVzID0gbWF0Y2hbMV0uc3BsaXQoXCJcXG5cIik7XHJcblxyXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xyXG4gICAgY29uc3QgY29sb25JZHggPSBsaW5lLmluZGV4T2YoXCI6XCIpO1xyXG4gICAgaWYgKGNvbG9uSWR4ID09PSAtMSkgY29udGludWU7XHJcbiAgICBjb25zdCBrZXkgPSBsaW5lLnNsaWNlKDAsIGNvbG9uSWR4KS50cmltKCk7XHJcbiAgICBjb25zdCB2YWx1ZSA9IGxpbmUuc2xpY2UoY29sb25JZHggKyAxKS50cmltKCk7XHJcblxyXG4gICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgY2FzZSBcInRpdGxlXCI6IGZtLnRpdGxlID0gdmFsdWU7IGJyZWFrO1xyXG4gICAgICBjYXNlIFwic2x1Z1wiOiBmbS5zbHVnID0gdmFsdWU7IGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZXhjZXJwdFwiOiBmbS5leGNlcnB0ID0gdmFsdWU7IGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHlwZVwiOiBmbS50eXBlID0gdmFsdWU7IGJyZWFrO1xyXG4gICAgICBjYXNlIFwic3RhdHVzXCI6IGZtLnN0YXR1cyA9IHZhbHVlOyBicmVhaztcclxuICAgICAgY2FzZSBcInBpbGxhclwiOiBmbS5waWxsYXIgPSB2YWx1ZTsgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJjb3ZlckltYWdlXCI6IGZtLmNvdmVySW1hZ2UgPSB2YWx1ZTsgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmZWF0dXJlZFwiOiBmbS5mZWF0dXJlZCA9IHZhbHVlID09PSBcInRydWVcIjsgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJtZXRhVGl0bGVcIjogZm0ubWV0YVRpdGxlID0gdmFsdWU7IGJyZWFrO1xyXG4gICAgICBjYXNlIFwibWV0YURlc2NyaXB0aW9uXCI6IGZtLm1ldGFEZXNjcmlwdGlvbiA9IHZhbHVlOyBicmVhaztcclxuICAgICAgY2FzZSBcIm9nSW1hZ2VcIjogZm0ub2dJbWFnZSA9IHZhbHVlOyBicmVhaztcclxuICAgICAgY2FzZSBcInZpZGVvVXJsXCI6IGZtLnZpZGVvVXJsID0gdmFsdWU7IGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGFnc1wiOlxyXG4gICAgICAgIGZtLnRhZ3MgPSB2YWx1ZVxyXG4gICAgICAgICAgLnJlcGxhY2UoL15cXFt8XFxdJC9nLCBcIlwiKVxyXG4gICAgICAgICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgICAgICAgLm1hcCgodCkgPT4gdC50cmltKCkpXHJcbiAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgZnJvbnRtYXR0ZXI6IGZtLCBib2R5OiBtYXRjaFsyXS50cmltKCkgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gdG9TbHVnKHRpdGxlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiB0aXRsZVxyXG4gICAgLnRvTG93ZXJDYXNlKClcclxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csIFwiLVwiKVxyXG4gICAgLnJlcGxhY2UoL14tfC0kL2csIFwiXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQdWJsaXNoQmxvZ1RvV2ViUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuICBzZXR0aW5nczogUHVibGlzaEJsb2dUb1dlYlNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUztcclxuXHJcbiAgYXN5bmMgb25sb2FkKCkge1xyXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuICAgIHRoaXMubWlncmF0ZVNldHRpbmdzKCk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicHVibGlzaC10by1ibG9nXCIsXHJcbiAgICAgIG5hbWU6IFwiUHVibGlzaCB0byBCbG9nXCIsXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnBpY2tTaXRlQW5kUHVibGlzaCgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwicHVibGlzaC1kcmFmdFwiLFxyXG4gICAgICBuYW1lOiBcIlB1Ymxpc2ggYXMgRHJhZnRcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwiZHJhZnRcIiksXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJwdWJsaXNoLWxpdmVcIixcclxuICAgICAgbmFtZTogXCJQdWJsaXNoIExpdmVcIixcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucGlja1NpdGVBbmRQdWJsaXNoKFwicHVibGlzaGVkXCIpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBQdWJsaXNoQmxvZ1RvV2ViU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG4gIH1cclxuXHJcbiAgLyoqIE1pZ3JhdGUgZnJvbSBzaW5nbGUtc2l0ZSBzZXR0aW5ncyAodjEpIHRvIG11bHRpLXNpdGUgKHYyKSAqL1xyXG4gIHByaXZhdGUgbWlncmF0ZVNldHRpbmdzKCkge1xyXG4gICAgY29uc3QgcmF3ID0gdGhpcy5zZXR0aW5ncyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcclxuICAgIGlmICh0eXBlb2YgcmF3LnNpdGVVcmwgPT09IFwic3RyaW5nXCIgJiYgcmF3LnNpdGVVcmwpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5zaXRlcyA9IFt7XHJcbiAgICAgICAgbmFtZTogXCJEZWZhdWx0XCIsXHJcbiAgICAgICAgdXJsOiByYXcuc2l0ZVVybCBhcyBzdHJpbmcsXHJcbiAgICAgICAgYXBpS2V5OiAocmF3LmFwaUtleSBhcyBzdHJpbmcpIHx8IFwiXCIsXHJcbiAgICAgIH1dO1xyXG4gICAgICBkZWxldGUgcmF3LnNpdGVVcmw7XHJcbiAgICAgIGRlbGV0ZSByYXcuYXBpS2V5O1xyXG4gICAgICB0aGlzLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5zZXR0aW5ncy5zaXRlcykpIHtcclxuICAgICAgdGhpcy5zZXR0aW5ncy5zaXRlcyA9IFtdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGlja1NpdGVBbmRQdWJsaXNoKG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgeyBzaXRlcyB9ID0gdGhpcy5zZXR0aW5ncztcclxuICAgIGlmIChzaXRlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbmV3IE5vdGljZShcIkFkZCBhdCBsZWFzdCBvbmUgc2l0ZSBpbiBwbHVnaW4gc2V0dGluZ3NcIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChzaXRlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdGhpcy5wdWJsaXNoKHNpdGVzWzBdLCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIE11bHRpcGxlIHNpdGVzIFx1MjAxNCBzaG93IHBpY2tlclxyXG4gICAgbmV3IFNpdGVQaWNrZXJNb2RhbCh0aGlzLmFwcCwgc2l0ZXMsIChzaXRlKSA9PiB7XHJcbiAgICAgIHRoaXMucHVibGlzaChzaXRlLCBvdmVycmlkZVN0YXR1cyk7XHJcbiAgICB9KS5vcGVuKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBwdWJsaXNoKHNpdGU6IFNpdGUsIG92ZXJyaWRlU3RhdHVzPzogXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIikge1xyXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcbiAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgbmV3IE5vdGljZShcIk9wZW4gYSBtYXJrZG93biBmaWxlIGZpcnN0XCIpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzaXRlLnVybCB8fCAhc2l0ZS5hcGlLZXkpIHtcclxuICAgICAgbmV3IE5vdGljZShgQ29uZmlndXJlIFVSTCBhbmQgQVBJIGtleSBmb3IgXCIke3NpdGUubmFtZX1cIiBpbiBwbHVnaW4gc2V0dGluZ3NgKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSB2aWV3LmdldFZpZXdEYXRhKCk7XHJcbiAgICBjb25zdCB7IGZyb250bWF0dGVyLCBib2R5IH0gPSBwYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xyXG5cclxuICAgIGNvbnN0IHRpdGxlID0gZnJvbnRtYXR0ZXIudGl0bGUgfHwgdmlldy5maWxlPy5iYXNlbmFtZSB8fCBcIlVudGl0bGVkXCI7XHJcbiAgICBjb25zdCBzbHVnID0gZnJvbnRtYXR0ZXIuc2x1ZyB8fCB0b1NsdWcodGl0bGUpO1xyXG4gICAgY29uc3Qgc3RhdHVzID0gb3ZlcnJpZGVTdGF0dXMgfHwgZnJvbnRtYXR0ZXIuc3RhdHVzIHx8IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFN0YXR1cztcclxuXHJcbiAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgc2x1ZyxcclxuICAgICAgYm9keSxcclxuICAgICAgZXhjZXJwdDogZnJvbnRtYXR0ZXIuZXhjZXJwdCB8fCBcIlwiLFxyXG4gICAgICB0eXBlOiBmcm9udG1hdHRlci50eXBlIHx8IFwiYmxvZ1wiLFxyXG4gICAgICBzdGF0dXMsXHJcbiAgICAgIHRhZ3M6IGZyb250bWF0dGVyLnRhZ3MgfHwgW10sXHJcbiAgICAgIHBpbGxhcjogZnJvbnRtYXR0ZXIucGlsbGFyIHx8IFwiXCIsXHJcbiAgICAgIGZlYXR1cmVkOiBmcm9udG1hdHRlci5mZWF0dXJlZCB8fCBmYWxzZSxcclxuICAgICAgY292ZXJJbWFnZTogZnJvbnRtYXR0ZXIuY292ZXJJbWFnZSB8fCBcIlwiLFxyXG4gICAgICBtZXRhVGl0bGU6IGZyb250bWF0dGVyLm1ldGFUaXRsZSB8fCBcIlwiLFxyXG4gICAgICBtZXRhRGVzY3JpcHRpb246IGZyb250bWF0dGVyLm1ldGFEZXNjcmlwdGlvbiB8fCBcIlwiLFxyXG4gICAgICBvZ0ltYWdlOiBmcm9udG1hdHRlci5vZ0ltYWdlIHx8IFwiXCIsXHJcbiAgICAgIHZpZGVvVXJsOiBmcm9udG1hdHRlci52aWRlb1VybCB8fCBcIlwiLFxyXG4gICAgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBuZXcgTm90aWNlKGBQdWJsaXNoaW5nIFwiJHt0aXRsZX1cIiBcdTIxOTIgJHtzaXRlLm5hbWV9Li4uYCk7XHJcblxyXG4gICAgICBjb25zdCB1cmwgPSBgJHtzaXRlLnVybC5yZXBsYWNlKC9cXC8kLywgXCJcIil9L2FwaS9wdWJsaXNoYDtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgICB1cmwsXHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIFwieC1wdWJsaXNoLWtleVwiOiBzaXRlLmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgIGNvbnN0IHZlcmIgPSByZXNwb25zZS5qc29uPy51cHNlcnRlZCA/IFwiVXBkYXRlZFwiIDogXCJQdWJsaXNoZWRcIjtcclxuICAgICAgICBuZXcgTm90aWNlKGAke3ZlcmJ9IFwiJHt0aXRsZX1cIiBvbiAke3NpdGUubmFtZX0gYXMgJHtzdGF0dXN9YCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3IE5vdGljZShgUHVibGlzaCB0byAke3NpdGUubmFtZX0gZmFpbGVkOiAke3Jlc3BvbnNlLmpzb24/LmVycm9yIHx8IHJlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoYFB1Ymxpc2ggZXJyb3IgKCR7c2l0ZS5uYW1lfSk6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgU2l0ZVBpY2tlck1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPFNpdGU+IHtcclxuICBwcml2YXRlIHNpdGVzOiBTaXRlW107XHJcbiAgcHJpdmF0ZSBvbkNob29zZTogKHNpdGU6IFNpdGUpID0+IHZvaWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBzaXRlczogU2l0ZVtdLCBvbkNob29zZTogKHNpdGU6IFNpdGUpID0+IHZvaWQpIHtcclxuICAgIHN1cGVyKGFwcCk7XHJcbiAgICB0aGlzLnNpdGVzID0gc2l0ZXM7XHJcbiAgICB0aGlzLm9uQ2hvb3NlID0gb25DaG9vc2U7XHJcbiAgICB0aGlzLnNldFBsYWNlaG9sZGVyKFwiQ2hvb3NlIGEgc2l0ZSB0byBwdWJsaXNoIHRvLi4uXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IFNpdGVbXSB7XHJcbiAgICBjb25zdCBsb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gdGhpcy5zaXRlcy5maWx0ZXIoXHJcbiAgICAgIChzKSA9PiBzLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlcikgfHwgcy51cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlciksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyU3VnZ2VzdGlvbihzaXRlOiBTaXRlLCBlbDogSFRNTEVsZW1lbnQpIHtcclxuICAgIGVsLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogc2l0ZS5uYW1lLCBjbHM6IFwic3VnZ2VzdGlvbi10aXRsZVwiIH0pO1xyXG4gICAgZWwuY3JlYXRlRWwoXCJzbWFsbFwiLCB7IHRleHQ6IHNpdGUudXJsLCBjbHM6IFwic3VnZ2VzdGlvbi1ub3RlXCIgfSk7XHJcbiAgfVxyXG5cclxuICBvbkNob29zZVN1Z2dlc3Rpb24oc2l0ZTogU2l0ZSkge1xyXG4gICAgdGhpcy5vbkNob29zZShzaXRlKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFB1Ymxpc2hCbG9nVG9XZWJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBQdWJsaXNoQmxvZ1RvV2ViUGx1Z2luO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBQdWJsaXNoQmxvZ1RvV2ViUGx1Z2luKSB7XHJcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xyXG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJTaXRlc1wiIH0pO1xyXG5cclxuICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNpdGVzLmZvckVhY2goKHNpdGUsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNpdGVDb250YWluZXIgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6IFwicHVibGlzaC1ibG9nLXRvLXdlYi1zaXRlXCIgfSk7XHJcbiAgICAgIHNpdGVDb250YWluZXIuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IHNpdGUubmFtZSB8fCBgU2l0ZSAke2luZGV4ICsgMX1gIH0pO1xyXG5cclxuICAgICAgbmV3IFNldHRpbmcoc2l0ZUNvbnRhaW5lcilcclxuICAgICAgICAuc2V0TmFtZShcIlNpdGUgTmFtZVwiKVxyXG4gICAgICAgIC5zZXREZXNjKFwiQSBsYWJlbCBmb3IgdGhpcyBzaXRlIChlLmcuIE15IEJsb2cpXCIpXHJcbiAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIk15IFNpdGVcIilcclxuICAgICAgICAgICAgLnNldFZhbHVlKHNpdGUubmFtZSlcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNpdGVzW2luZGV4XS5uYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICBuZXcgU2V0dGluZyhzaXRlQ29udGFpbmVyKVxyXG4gICAgICAgIC5zZXROYW1lKFwiU2l0ZSBVUkxcIilcclxuICAgICAgICAuc2V0RGVzYyhcIlRoZSBzaXRlJ3MgYmFzZSBVUkxcIilcclxuICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUoc2l0ZS51cmwpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zaXRlc1tpbmRleF0udXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICBuZXcgU2V0dGluZyhzaXRlQ29udGFpbmVyKVxyXG4gICAgICAgIC5zZXROYW1lKFwiQVBJIEtleVwiKVxyXG4gICAgICAgIC5zZXREZXNjKFwiUFVCTElTSF9BUElfS0VZIGZyb20gdGhhdCBzaXRlJ3MgLmVudi5sb2NhbFwiKVxyXG4gICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgICAgdGV4dFxyXG4gICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFbnRlciBBUEkga2V5XCIpXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzaXRlLmFwaUtleSlcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNpdGVzW2luZGV4XS5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgIG5ldyBTZXR0aW5nKHNpdGVDb250YWluZXIpXHJcbiAgICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxyXG4gICAgICAgICAgYnRuXHJcbiAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KFwiUmVtb3ZlIFNpdGVcIilcclxuICAgICAgICAgICAgLnNldFdhcm5pbmcoKVxyXG4gICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2l0ZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuYWRkQnV0dG9uKChidG4pID0+XHJcbiAgICAgICAgYnRuXHJcbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkFkZCBTaXRlXCIpXHJcbiAgICAgICAgICAuc2V0Q3RhKClcclxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2l0ZXMucHVzaCh7IG5hbWU6IFwiXCIsIHVybDogXCJcIiwgYXBpS2V5OiBcIlwiIH0pO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJEZWZhdWx0c1wiIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkRlZmF1bHQgU3RhdHVzXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiRGVmYXVsdCBwdWJsaXNoIHN0YXR1cyB3aGVuIG5vdCBzcGVjaWZpZWQgaW4gZnJvbnRtYXR0ZXJcIilcclxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cclxuICAgICAgICBkcm9wZG93blxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcImRyYWZ0XCIsIFwiRHJhZnRcIilcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJwdWJsaXNoZWRcIiwgXCJQdWJsaXNoZWRcIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3RhdHVzID0gdmFsdWUgYXMgXCJkcmFmdFwiIHwgXCJwdWJsaXNoZWRcIjtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQThHO0FBYTlHLElBQU0sbUJBQTZDO0FBQUEsRUFDakQsT0FBTyxDQUFDO0FBQUEsRUFDUixlQUFlO0FBQ2pCO0FBa0JBLFNBQVMsaUJBQWlCLFNBQTZEO0FBQ3JGLFFBQU0sUUFBUSxRQUFRLE1BQU0sNkNBQTZDO0FBQ3pFLE1BQUksQ0FBQyxNQUFPLFFBQU8sRUFBRSxhQUFhLENBQUMsR0FBRyxNQUFNLFFBQVE7QUFFcEQsUUFBTSxLQUFrQixDQUFDO0FBQ3pCLFFBQU0sUUFBUSxNQUFNLENBQUMsRUFBRSxNQUFNLElBQUk7QUFFakMsYUFBVyxRQUFRLE9BQU87QUFDeEIsVUFBTSxXQUFXLEtBQUssUUFBUSxHQUFHO0FBQ2pDLFFBQUksYUFBYSxHQUFJO0FBQ3JCLFVBQU0s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
