# mermaid-house-style

An [Agent Skill](https://agentskills.io) that makes any coding agent draw
Mermaid diagrams in one consistent style, the mermaid.live default look, and
render them locally to PNG, SVG or PDF.

White boxes, thick dark borders, offset shadows, rounded step lines, black
arrows, grey edge-label tags, Recursive font.

## Install

With the [`skills`](https://www.skills.sh) installer, for any supported agent
(Claude Code, Codex, Cursor, Gemini CLI and others):

```bash
npx skills@latest add SAGILI2/mermaid-house-style --agent claude-code --agent codex --global
```

Drop `--global` to install into the current project only. Use `skills` 1.5.16
or newer; older versions don't link skills into Claude Code.

Or clone it straight into an agent's skills folder:

```bash
git clone https://github.com/SAGILI2/mermaid-house-style ~/.claude/skills/mermaid-house-style
```

| Agent | Personal (all projects) | One project |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| OpenAI Codex | `~/.agents/skills/` | `.agents/skills/` |
| Others supporting Agent Skills | the agent's skills folder | the agent's project skills folder |

Restart the agent, or run `/reload-skills` in Claude Code, to pick it up.

Agents without skills support can still follow it: point them at `SKILL.md`,
or paste its "Writing a diagram" section into the project's `AGENTS.md`.

## Usage

Ask the agent for a diagram. It writes Mermaid with this header, which is the
whole style:

```
---
config:
  theme: redux-color
---
```

To render by hand, from the skill folder:

```bash
node scripts/render.mjs diagram.mmd             # -> diagram.png
node scripts/render.mjs diagram.mmd out.svg     # .png, .svg or .pdf
node scripts/render.mjs ARCHITECTURE.md         # each mermaid block -> ARCHITECTURE-diagrams/
node scripts/render.mjs --check ARCHITECTURE.md # syntax check only
```

## Requirements

- Writing diagrams: nothing.
- Rendering: Node.js 18+ and npm. The first render installs pinned packages
  (mermaid 12.0.0, @mermaid-js/mermaid-cli 12.0.0, about 200 MB including a
  headless browser) into `scripts/node_modules`. Later renders work offline.

## Layout

```
mermaid-house-style/
├── SKILL.md                 instructions the agent loads
├── scripts/
│   ├── render.mjs           renderer, self-installing
│   └── package.json         pinned dependencies
├── assets/
│   ├── recursive-latin-wght-normal.woff2
│   └── Recursive-OFL.txt    font licence
└── references/
    └── equal-boxes.md       fixed-size box workaround
```

## Licence

Skill files: MIT, see `LICENSE`. The Recursive font is © The Recursive
Project Authors, under the SIL Open Font License 1.1
(`assets/Recursive-OFL.txt`).
