# Clicky MCP Server

A Model Context Protocol (MCP) server that exposes [Clicky](https://clicky.com) web analytics as 11 tools for AI assistants — visitor counts, top pages, traffic sources, bounce rate, search terms, real-time visitors, and more. See the [Tool reference](#tool-reference) for the full list.

---

## Quick start

You need:
- **Node.js 20+** installed (`node --version`)
- A **Clicky Site ID and Site Key** — find both at https://clicky.com/user/preferences/site under "Info"
- This repo cloned and built once:
  ```bash
  git clone https://github.com/colintoh/clicky-mcp.git
  cd clicky-mcp && npm install && npm run build
  ```

Then pick your MCP host below.

> **Why isn't there an `npm start` step?** MCP stdio servers don't run as standalone daemons — your MCP host (Claude Desktop, Claude Code, etc.) spawns the server as a subprocess on demand and talks to it over stdin/stdout. There's nothing to "start" yourself.

### Claude Desktop

1. Open the config file (create it if missing):
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`
2. Merge this into the file's `mcpServers` block (replace the three `ALL_CAPS` placeholders):
   ```json
   {
     "mcpServers": {
       "clicky-analytics": {
         "command": "ABSOLUTE_PATH_TO_NODE", // e.g. /Users/.../.nvm/versions/node/v25.2.1/bin/node
         "args": ["ABSOLUTE_PATH_TO_CLICKY_MCP_FOLDER/dist/index.js"], // e.g. /Users/.../clicky-mcp/dist/index.js
         "env": {
           "CLICKY_SITE_ID": "YOUR_SITE_ID",
           "CLICKY_SITE_KEY": "YOUR_SITE_KEY"
         }
       }
     }
   }
   ```
   Get `ABSOLUTE_PATH_TO_NODE` by running `which node` in your terminal. **Don't just put `"node"`** — Claude Desktop launches via `launchd` with a minimal PATH that doesn't include nvm or homebrew, so a bare `"node"` will fail silently. Same goes for the path to `dist/index.js`: it must be absolute.
3. Fully quit Claude Desktop (`⌘Q` on macOS — closing the window isn't enough), then reopen it.
4. Verify by asking Claude *"list my Clicky MCP tools"* — you should see 11 tools.

If something goes wrong, see [Troubleshooting](#troubleshooting).

### Claude Code

One command:

```bash
claude mcp add clicky-analytics \
  -e CLICKY_SITE_ID=YOUR_SITE_ID \
  -e CLICKY_SITE_KEY=YOUR_SITE_KEY \
  -- node /absolute/path/to/clicky-mcp/dist/index.js
```

This writes to `~/.claude.json` by default. Add `--scope project` to write a project-local `.mcp.json` instead. Restart Claude Code (or run `/mcp` to refresh) and the 11 tools become available.

### MCP Inspector (debugging)

Use this when you want to call tools directly without committing the server to a host — handy for inspecting schemas or troubleshooting responses:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Then open the printed URL, set `CLICKY_SITE_ID` and `CLICKY_SITE_KEY` as environment variables in the Inspector UI (or pass `--site-id … --site-key …` as CLI args after `dist/index.js`), and click around.

---

## Date parameters

Every date-aware tool accepts **either** an explicit date range **or** a Clicky relative-date keyword — but not both:

- **Explicit**: `start_date` + `end_date`, both `YYYY-MM-DD`, range ≤ 31 days.
- **Keyword**: `date_range`, one of `today`, `yesterday`, `last-7-days`, `last-30-days`, `this-week`, `last-week`, `this-month`, `last-month`, `this-year`, `last-year`.

Example:

```json
{ "date_range": "last-7-days" }
```

---

## Tool reference

All 11 tools, alphabetical-ish by use case.

### get_total_visitors
Total visitor counts for a period.
- `start_date` / `end_date` **or** `date_range`

### get_actions
Total pageviews/actions for a period.
- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_bounce_rate
Bounce rate and average time-on-site for a period.
- `start_date` / `end_date` **or** `date_range`

### get_visitors_online
Real-time visitor count and segmentation. Takes no parameters.

### get_top_pages
Most popular pages for a period.
- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_page_traffic
Traffic data for a specific page URL.
- `url` (string, **required**)
- `start_date` / `end_date` **or** `date_range`

### get_traffic_sources
Traffic sources breakdown — optionally filter by page URL.
- `start_date` / `end_date` **or** `date_range`
- `page_url` (string, optional) — full URL or path

### get_referring_domains
Top referring domains sending traffic.
- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_domain_visitors
Visitor data filtered by referrer domain, with optional segmentation.
- `domain` (string, **required**)
- `start_date` / `end_date` **or** `date_range`
- `segments` (array, optional) — `["pages", "visitors"]`. Defaults to `["visitors"]`.
- `limit` (number, optional, max 1000)

### get_searches
Top search terms that brought visitors.
- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_countries
Visitor breakdown by country.
- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

---

## API limits

Imposed by Clicky, not by this server:

- Maximum explicit date range: **31 days**
- Maximum results per request: **1,000 items**
- One simultaneous request per IP per site ID

---

## Troubleshooting

**"Claude Desktop doesn't see the server."** Check the spawn log at `~/Library/Logs/Claude/mcp-server-clicky-analytics.log`. The most common cause is `node` not being on Claude Desktop's launchd PATH — fix by replacing `"command": "node"` with the absolute path from `which node`. The second-most-common cause is forgetting to fully quit Claude Desktop (`⌘Q`, not just close the window).

**"Date range cannot exceed 31 days."** That's a Clicky API limit, not us. Either narrow the range or use a `date_range` keyword like `last-30-days`.

---

## Local development

For working *on* the server, not just using it.

```bash
npm install         # install deps
npm run dev         # run with tsx, watching for changes (used for local testing only)
npm run build       # compile TS to dist/
npm test            # 46 unit tests, offline, no credentials needed
npm run test:integration  # live API smoke test (requires .env or env vars)
```

For local dev, credentials can come from a `.env` file in the project root:

```
CLICKY_SITE_ID=your_site_id
CLICKY_SITE_KEY=your_site_key
```

`.env` is gitignored. **Don't use `.env` for hosts like Claude Desktop** — pass credentials via the host's config `env` block instead, as shown in [Quick start](#quick-start). The server only loads `.env` when credentials aren't already in the environment.

A pre-push git hook in `.githooks/pre-push` auto-runs `npm test` before any push that updates the remote `main` branch, so a regression can't slip out unnoticed. It's installed automatically by the `prepare` npm script after `npm install`. Pushes to feature branches are not gated. Bypass in an emergency with `git push --no-verify`.

### Project structure

```
clicky-mcp/
├── src/
│   ├── index.ts              # MCP server + tool dispatcher
│   ├── clicky-client.ts      # Clicky HTTP API client
│   ├── date-utils.ts         # Shared date param builder
│   └── tools/                # One file per tool
├── test/                     # node:test unit tests
├── scripts/verify.mjs        # Live API smoke runner
├── .githooks/pre-push        # Auto-installed test gate for main
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installing this MCP via an AI agent

If you'd like an AI agent (e.g. Claude Code in another project) to install this MCP for you, point it at this section. The agent should:

1. Clone and build:
   ```bash
   git clone https://github.com/colintoh/clicky-mcp.git
   cd clicky-mcp && npm install && npm run build
   ```
2. Ask the user for their Clicky Site ID and Site Key (https://clicky.com/user/preferences/site).
3. Run `which node` and capture the absolute path.
4. Locate the user's Claude Desktop config (paths in [Quick start › Claude Desktop](#claude-desktop)) and merge in the `mcpServers` snippet from that section, substituting the absolute `node` path, the absolute `dist/index.js` path, and the user's credentials.
5. Tell the user to fully restart Claude Desktop (`⌘Q`), then verify by asking Claude *"list my Clicky MCP tools"* — 11 tools should appear.

For Claude Code, the single `claude mcp add` command in [Quick start › Claude Code](#claude-code) is faster and writes the config in one step.

---

## License

MIT
