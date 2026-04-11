# Clicky MCP Server

A Model Context Protocol (MCP) server for fetching traffic analytics data from the Clicky API.

## Install for AI agents (one-shot)

If you are an AI agent installing this MCP for a user, follow these exact steps:

1. Clone and build:
   ```bash
   git clone <repo-url> clicky-mcp
   cd clicky-mcp && npm install && npm run build
   ```
2. Ask the user for their Clicky **Site ID** and **Site Key** (found at https://clicky.com/user/preferences/site).
3. Locate the Claude Desktop config file (create it if missing):
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
4. Merge this into the file's `mcpServers` object (replace the three `ALL_CAPS` tokens):
   ```json
   {
     "mcpServers": {
       "clicky-analytics": {
         "command": "node",
         "args": ["ABSOLUTE_PATH_TO_CLICKY_MCP/dist/index.js"],
         "env": {
           "CLICKY_SITE_ID": "USER_SITE_ID",
           "CLICKY_SITE_KEY": "USER_SITE_KEY"
         }
       }
     }
   }
   ```
5. Ask the user to fully restart Claude Desktop. Verify by asking Claude *"list my Clicky MCP tools"* — 11 tools should appear.

## Features

This MCP server provides 11 tools to interact with Clicky analytics:

- **`get_total_visitors`** — Total visitors for a date range
- **`get_domain_visitors`** — Visitors filtered by referrer domain (with optional segmentation)
- **`get_top_pages`** — Most popular pages for a date range
- **`get_traffic_sources`** — Traffic sources breakdown (optionally per page)
- **`get_page_traffic`** — Traffic data for a specific page URL
- **`get_visitors_online`** — Currently-online visitors (real-time)
- **`get_actions`** — Total pageviews/actions for a date range
- **`get_bounce_rate`** — Bounce rate and average time-on-site
- **`get_countries`** — Visitor breakdown by country
- **`get_searches`** — Top search terms bringing traffic
- **`get_referring_domains`** — Top referring domains

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Run the server:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

## Configuration

You need to provide your Clicky analytics credentials. Get them from your Clicky account preferences (Site ID and Site Key).

**Option 1: Environment variables**
```bash
export CLICKY_SITE_ID="YOUR_SITE_ID"
export CLICKY_SITE_KEY="YOUR_SITE_KEY"
```

**Option 2: Command line arguments**
```bash
npm start -- --site-id YOUR_SITE_ID --site-key YOUR_SITE_KEY
```

**Option 3: .env file**
```bash
# Create .env file in project root
CLICKY_SITE_ID=YOUR_SITE_ID
CLICKY_SITE_KEY=YOUR_SITE_KEY
```

⚠️ **Security Note**: Never commit your actual credentials to version control. The `.env` file is already in `.gitignore`.

## Date parameters

Every date-aware tool accepts **either** an explicit date range **or** a Clicky relative-date keyword — but not both:

- Explicit: `start_date` + `end_date`, both `YYYY-MM-DD`, range ≤ 31 days.
- Keyword: `date_range`, one of:
  - `today`
  - `yesterday`
  - `last-7-days`
  - `last-30-days`
  - `this-week`
  - `last-week`
  - `this-month`
  - `last-month`
  - `this-year`
  - `last-year`

Example using a keyword:
```json
{ "date_range": "last-7-days" }
```

## Available Tools

### get_total_visitors

Total visitor counts for a period.

- `start_date` / `end_date` (string, optional) — explicit YYYY-MM-DD range
- `date_range` (string, optional) — keyword alternative

### get_domain_visitors

Visitor data filtered by referrer domain, with optional segmentation.

- `domain` (string, **required**)
- `start_date` / `end_date` **or** `date_range`
- `segments` (array, optional) — `["pages", "visitors"]`. Defaults to `["visitors"]`.
- `limit` (number, optional, max 1000)

### get_top_pages

Most popular pages for a period.

- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_traffic_sources

Traffic sources breakdown — optionally filter by page URL.

- `start_date` / `end_date` **or** `date_range`
- `page_url` (string, optional) — full URL or path

### get_page_traffic

Traffic data for a specific page URL.

- `url` (string, **required**)
- `start_date` / `end_date` **or** `date_range`

### get_visitors_online

Real-time visitor count and segmentation. Takes no parameters.

### get_actions

Total pageviews/actions for a period.

- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_bounce_rate

Bounce rate and average time-on-site for a period.

- `start_date` / `end_date` **or** `date_range`

### get_countries

Visitor breakdown by country.

- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_searches

Top search terms that brought visitors.

- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

### get_referring_domains

Top referring domains sending traffic.

- `start_date` / `end_date` **or** `date_range`
- `limit` (number, optional, max 1000)

## API Limitations

- Maximum explicit date range: 31 days (Clicky API limit)
- Maximum results per request: 1,000 items
- One simultaneous request per IP per site ID

## Error Handling

Errors surfaced by the server include:
- Missing or conflicting date parameters
- Invalid calendar dates (e.g. `2024-02-30`)
- Reversed or out-of-range date windows
- Clicky API errors (rate limits, auth, network)

All errors are returned with descriptive messages.

## Testing

```bash
npm test                  # unit tests (offline, no credentials needed)
npm run test:integration  # live smoke against the Clicky API (requires .env)
```

The unit suite covers `buildDateParam` validation, `ClickyClient` parameter shaping (via a stub axios), and the `get_traffic_sources` defensive transform — ~45 tests, runs in well under a second.

A pre-push git hook (in `.githooks/pre-push`) auto-runs `npm test` before any push that updates the remote `main` branch. It's installed automatically by the `prepare` script after `npm install`. Pushes to feature branches are not gated. To bypass in an emergency: `git push --no-verify`.

## Development

```
clicky-mcp/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── clicky-client.ts      # Clicky API client
│   ├── date-utils.ts         # Shared date param builder
│   └── tools/                # One file per tool
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
