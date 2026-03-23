import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian"],
  format: "cjs",
  target: "es2020",
  outfile: "main.js",
  platform: "node",
  sourcemap: "inline",
  logLevel: "info",
}).catch(() => process.exit(1));
