// Minimal stubs for Obsidian module — enough for vitest to import main.ts
export class Plugin {
  app: unknown = {};
  loadData() { return Promise.resolve({}); }
  saveData(_: unknown) { return Promise.resolve(); }
  addCommand(_: unknown) {}
  addSettingTab(_: unknown) {}
  addRibbonIcon(_s: string, _d: string, _cb: () => void) {}
  addStatusBarItem() { return { setText: () => {} }; }
}

export class PluginSettingTab {
  app: unknown;
  plugin: unknown;
  containerEl = { empty: () => {}, createEl: () => ({}) };
  constructor(app: unknown, plugin: unknown) {
    this.app = app;
    this.plugin = plugin;
  }
}

export class Modal {
  app: unknown;
  contentEl = { empty: () => {}, createEl: () => ({}), createDiv: () => ({}), addClass: () => {} };
  constructor(app: unknown) { this.app = app; }
  open() {}
  close() {}
}

export class SuggestModal {
  app: unknown;
  constructor(app: unknown) { this.app = app; }
  setPlaceholder(_: string) {}
  open() {}
  close() {}
}

export class Notice {
  constructor(_message: string) {}
}

export class Setting {
  constructor(_el: unknown) {}
  setName(_: string) { return this; }
  setDesc(_: string) { return this; }
  addText(_: unknown) { return this; }
  addDropdown(_: unknown) { return this; }
  addToggle(_: unknown) { return this; }
  addButton(_: unknown) { return this; }
}

export class MarkdownView {}
export class TFile {}

export function requestUrl(_: unknown) {
  return Promise.resolve({ status: 200, json: {} });
}

export class App {}
