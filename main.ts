import { Plugin, PluginSettingTab, App, Setting, Notice, requestUrl, MarkdownView, Modal, SuggestModal } from "obsidian";

interface Site {
  name: string;
  url: string;
  apiKey: string;
}

interface PublishBlogToWebSettings {
  sites: Site[];
  defaultStatus: "draft" | "published";
}

const DEFAULT_SETTINGS: PublishBlogToWebSettings = {
  sites: [],
  defaultStatus: "draft",
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
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: Frontmatter = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    switch (key) {
      case "title": fm.title = value; break;
      case "slug": fm.slug = value; break;
      case "excerpt": fm.excerpt = value; break;
      case "type": fm.type = value; break;
      case "status": fm.status = value; break;
      case "pillar": fm.pillar = value; break;
      case "coverImage": fm.coverImage = value; break;
      case "featured": fm.featured = value === "true"; break;
      case "metaTitle": fm.metaTitle = value; break;
      case "metaDescription": fm.metaDescription = value; break;
      case "ogImage": fm.ogImage = value; break;
      case "videoUrl": fm.videoUrl = value; break;
      case "tags":
        fm.tags = value
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        break;
    }
  }

  return { frontmatter: fm, body: match[2].trim() };
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default class PublishBlogToWebPlugin extends Plugin {
  settings: PublishBlogToWebSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.migrateSettings();

    this.addCommand({
      id: "publish-to-blog",
      name: "Publish to Blog",
      callback: () => this.pickSiteAndPublish(),
    });

    this.addCommand({
      id: "publish-draft",
      name: "Publish as Draft",
      callback: () => this.pickSiteAndPublish("draft"),
    });

    this.addCommand({
      id: "publish-live",
      name: "Publish Live",
      callback: () => this.pickSiteAndPublish("published"),
    });

    this.addSettingTab(new PublishBlogToWebSettingTab(this.app, this));
  }

  /** Migrate from single-site settings (v1) to multi-site (v2) */
  private migrateSettings() {
    const raw = this.settings as Record<string, unknown>;
    if (typeof raw.siteUrl === "string" && raw.siteUrl) {
      this.settings.sites = [{
        name: "Default",
        url: raw.siteUrl as string,
        apiKey: (raw.apiKey as string) || "",
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

  private pickSiteAndPublish(overrideStatus?: "draft" | "published") {
    const { sites } = this.settings;
    if (sites.length === 0) {
      new Notice("Add at least one site in plugin settings");
      return;
    }
    if (sites.length === 1) {
      this.publish(sites[0], overrideStatus);
      return;
    }
    // Multiple sites — show picker
    new SitePickerModal(this.app, sites, (site) => {
      this.publish(site, overrideStatus);
    }).open();
  }

  async publish(site: Site, overrideStatus?: "draft" | "published") {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("Open a markdown file first");
      return;
    }

    if (!site.url || !site.apiKey) {
      new Notice(`Configure URL and API key for "${site.name}" in plugin settings`);
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
      videoUrl: frontmatter.videoUrl || "",
    };

    try {
      new Notice(`Publishing "${title}" → ${site.name}...`);

      const url = `${site.url.replace(/\/$/, "")}/api/publish`;
      const response = await requestUrl({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publish-key": site.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.status >= 200 && response.status < 300) {
        const verb = response.json?.upserted ? "Updated" : "Published";
        new Notice(`${verb} "${title}" on ${site.name} as ${status}`);
      } else {
        new Notice(`Publish to ${site.name} failed: ${response.json?.error || response.status}`);
      }
    } catch (err) {
      new Notice(`Publish error (${site.name}): ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }
}

class SitePickerModal extends SuggestModal<Site> {
  private sites: Site[];
  private onChoose: (site: Site) => void;

  constructor(app: App, sites: Site[], onChoose: (site: Site) => void) {
    super(app);
    this.sites = sites;
    this.onChoose = onChoose;
    this.setPlaceholder("Choose a site to publish to...");
  }

  getSuggestions(query: string): Site[] {
    const lower = query.toLowerCase();
    return this.sites.filter(
      (s) => s.name.toLowerCase().includes(lower) || s.url.toLowerCase().includes(lower),
    );
  }

  renderSuggestion(site: Site, el: HTMLElement) {
    el.createEl("div", { text: site.name, cls: "suggestion-title" });
    el.createEl("small", { text: site.url, cls: "suggestion-note" });
  }

  onChooseSuggestion(site: Site) {
    this.onChoose(site);
  }
}

class PublishBlogToWebSettingTab extends PluginSettingTab {
  plugin: PublishBlogToWebPlugin;

  constructor(app: App, plugin: PublishBlogToWebPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Sites" });

    this.plugin.settings.sites.forEach((site, index) => {
      const siteContainer = containerEl.createDiv({ cls: "publish-blog-to-web-site" });
      siteContainer.createEl("h3", { text: site.name || `Site ${index + 1}` });

      new Setting(siteContainer)
        .setName("Site Name")
        .setDesc("A label for this site (e.g. My Blog)")
        .addText((text) =>
          text
            .setPlaceholder("My Site")
            .setValue(site.name)
            .onChange(async (value) => {
              this.plugin.settings.sites[index].name = value;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(siteContainer)
        .setName("Site URL")
        .setDesc("The site's base URL")
        .addText((text) =>
          text
            .setPlaceholder("https://example.com")
            .setValue(site.url)
            .onChange(async (value) => {
              this.plugin.settings.sites[index].url = value;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(siteContainer)
        .setName("API Key")
        .setDesc("PUBLISH_API_KEY from that site's .env.local")
        .addText((text) =>
          text
            .setPlaceholder("Enter API key")
            .setValue(site.apiKey)
            .onChange(async (value) => {
              this.plugin.settings.sites[index].apiKey = value;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(siteContainer)
        .addButton((btn) =>
          btn
            .setButtonText("Remove Site")
            .setWarning()
            .onClick(async () => {
              this.plugin.settings.sites.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            }),
        );
    });

    new Setting(containerEl)
      .addButton((btn) =>
        btn
          .setButtonText("Add Site")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.sites.push({ name: "", url: "", apiKey: "" });
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    containerEl.createEl("h2", { text: "Defaults" });

    new Setting(containerEl)
      .setName("Default Status")
      .setDesc("Default publish status when not specified in frontmatter")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("draft", "Draft")
          .addOption("published", "Published")
          .setValue(this.plugin.settings.defaultStatus)
          .onChange(async (value) => {
            this.plugin.settings.defaultStatus = value as "draft" | "published";
            await this.plugin.saveSettings();
          }),
      );
  }
}
