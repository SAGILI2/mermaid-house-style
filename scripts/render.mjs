#!/usr/bin/env node
/**
 * Render Mermaid diagrams in the house style (the mermaid.live default look):
 * Mermaid 12.0.0, theme redux-color, Recursive font embedded.
 *
 * Usage:
 *   node render.mjs <diagram.mmd> [out.png|out.svg|out.pdf]
 *   node render.mjs <doc.md> [out-dir]      every ```mermaid block -> out-dir/diagram-NN.png
 *   node render.mjs --check <file>          syntax check only, writes nothing you keep
 *
 * Needs Node.js 18+ and npm. On first run it installs its pinned dependencies
 * into this scripts/ folder (one-time, about 200 MB including a headless browser).
 * Set MERMAID_HOUSE_STYLE_NO_INSTALL=1 to fail instead of installing.
 *
 * A diagram without a front-matter header gets `theme: redux-color` added.
 * A diagram with its own header is rendered as written.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = dirname(HERE);
const MMDC = join(HERE, "node_modules", "@mermaid-js", "mermaid-cli", "src", "cli.js");
const FONT = join(SKILL, "assets", "recursive-latin-wght-normal.woff2");
const HEADER = "---\nconfig:\n  theme: redux-color\n---\n";
const FONT_FAMILY = '"Recursive Variable", arial, sans-serif';

function fail(msg) {
  console.error(`mermaid-house-style: ${msg}`);
  process.exit(1);
}

function ensureInstalled() {
  if (existsSync(MMDC)) return;
  if (process.env.MERMAID_HOUSE_STYLE_NO_INSTALL) fail(`renderer not installed; run "npm install" in ${HERE}`);
  console.error("mermaid-house-style: first run, installing renderer (one-time)...");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  try {
    execFileSync(npm, ["install", "--no-audit", "--no-fund", "--loglevel=error"], {
      cwd: HERE,
      stdio: ["ignore", "inherit", "inherit"],
      shell: process.platform === "win32",
    });
  } catch {
    fail(`npm install failed in ${HERE}; check network access and Node.js 18+`);
  }
  if (!existsSync(MMDC)) fail("install finished but mermaid-cli is missing");
}

function styleFiles(work) {
  const css = join(work, "font.css");
  const cfg = join(work, "config.json");
  const b64 = readFileSync(FONT).toString("base64");
  // mmdc stylesheets can't @import, so the font is embedded as a data URL.
  writeFileSync(css,
    "@font-face{font-family:'Recursive Variable';font-style:normal;font-weight:300 1000;" +
    `src:url(data:font/woff2;base64,${b64}) format('woff2');}\n`);
  writeFileSync(cfg, JSON.stringify({ fontFamily: FONT_FAMILY }));
  return { css, cfg };
}

const withHeader = (src) => (src.trimStart().startsWith("---") ? src : HEADER + src);

function render(source, output, work, files) {
  const input = join(work, `in-${Math.random().toString(36).slice(2)}.mmd`);
  writeFileSync(input, withHeader(source), "utf8");
  mkdirSync(dirname(output), { recursive: true });
  try {
    execFileSync(process.execPath, [
      MMDC, "-i", input, "-o", output, "-b", "white", "-s", "2",
      "-C", files.css, "-c", files.cfg, "-q",
    ], { stdio: ["ignore", "inherit", "pipe"] });
  } catch (e) {
    const detail = (e.stderr?.toString() || "").split("\n").filter(Boolean).slice(0, 6).join("\n");
    throw new Error(detail || e.message);
  }
}

const args = process.argv.slice(2);
const check = args[0] === "--check";
if (check) args.shift();
const [inArg, outArg] = args;
if (!inArg) fail("usage: node render.mjs [--check] <file.mmd|file.md> [output]");
const inPath = resolve(inArg);
if (!existsSync(inPath)) fail(`no such file: ${inPath}`);

ensureInstalled();
const work = mkdtempSync(join(tmpdir(), "mermaid-house-style-"));
const files = styleFiles(work);
const text = readFileSync(inPath, "utf8");
let failed = 0;

try {
  if (extname(inPath).toLowerCase() === ".md") {
    const blocks = [...text.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
    if (!blocks.length) fail(`no \`\`\`mermaid blocks in ${inPath}`);
    const outDir = check ? work : outArg ? resolve(outArg) : join(dirname(inPath), `${basename(inPath, extname(inPath))}-diagrams`);
    blocks.forEach((block, i) => {
      const name = `diagram-${String(i + 1).padStart(2, "0")}.${check ? "svg" : "png"}`;
      try {
        render(block, join(outDir, name), work, files);
        console.log(check ? `ok    block ${i + 1}` : `wrote ${join(outDir, name)}`);
      } catch (e) {
        failed++;
        console.error(`ERROR block ${i + 1}: ${e.message}`);
      }
    });
  } else {
    const out = check ? join(work, "check.svg") : outArg ? resolve(outArg) : inPath.replace(/\.[^.\\/]+$/, "") + ".png";
    try {
      render(text, out, work, files);
      console.log(check ? "ok" : `wrote ${out}`);
    } catch (e) {
      failed++;
      console.error(`ERROR: ${e.message}`);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
