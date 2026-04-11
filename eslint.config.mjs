import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

// Default brands from eslint-plugin-obsidianmd plus plugin-specific additions.
// Must list all defaults because the `brands` option replaces (not merges) the default list.
const PLUGIN_BRANDS = [
  // Operating systems
  "iOS", "iPadOS", "macOS", "Windows", "Android", "Linux",
  // Obsidian
  "Obsidian", "Obsidian Sync", "Obsidian Publish",
  // Cloud storage
  "Google Drive", "Dropbox", "OneDrive", "iCloud Drive",
  // Communication platforms
  "YouTube", "Slack", "Discord", "Telegram", "WhatsApp", "Twitter", "X",
  // Productivity tools
  "Readwise", "Zotero",
  // Diagram tools
  "Excalidraw", "Mermaid",
  // Languages
  "Markdown", "LaTeX", "JavaScript", "TypeScript", "Node.js",
  // Development tools
  "npm", "pnpm", "Yarn", "Git", "GitHub",
  // Other tools
  "GitLab", "Notion", "Evernote", "Roam Research", "Logseq", "Anki", "Reddit",
  "VS Code", "Visual Studio Code", "IntelliJ IDEA", "WebStorm", "PyCharm",
  // Plugin-specific: social/publishing platforms and auth
  // OAuth listed as brand so it overrides the default acronym (which would uppercase to OAUTH)
  "LinkedIn", "OAuth", "OAuth2",
];

export default defineConfig([
  { ignores: ["esbuild.config.mjs"] },
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
      globals: { window: "readonly" },
    },
    rules: {
      "obsidianmd/ui/sentence-case": ["error", {
        allowAutoFix: true,
        enforceCamelCaseLower: true,
        brands: PLUGIN_BRANDS,
        ignoreWords: ["URN"],
      }],
    },
  },
]);
