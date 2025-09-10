# Clicky MCP Server

A Model Context Protocol (MCP) server for fetching traffic analytics data from the Clicky API.

## Features

This MCP server provides five tools to interact with Clicky analytics:

- **`get_total_visitors`** - Get total visitors for a date range
- **`get_domain_visitors`** - Get visitors filtered by referrer domain
- **`get_top_pages`** - Get top pages for a date range
- **`get_traffic_sources`** - Get traffic sources breakdown for a date range
- **`get_page_traffic`** - Get traffic data for a specific page by URL

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

You need to provide your Clicky analytics credentials to use this server. Get these from your Clicky account:

1. **Get your credentials** from your Clicky account:
   - Site ID: Available in your site preferences
   - Site Key: Available in your site preferences under "Preferences" → "Info"

2. **Configure credentials** using one of these methods:

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

⚠️ **Security Note**: Never commit your actual credentials to version control. The `.env` file is already included in `.gitignore` for security.

## Using with Claude Desktop

To use this MCP server with Claude Desktop, you need to add it to your Claude Desktop configuration:

1. **Locate your Claude Desktop config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the MCP server to your config:**
   ```json
   {
     "mcpServers": {
       "clicky-analytics": {
         "command": "node",
         "args": ["/path/to/clicky-mcp/dist/index.js"],
         "env": {
           "CLICKY_SITE_ID": "YOUR_SITE_ID",
           "CLICKY_SITE_KEY": "YOUR_SITE_KEY"
         }
       }
     }
   }
   ```

3. **Update the path**: Replace `/path/to/clicky-mcp/` with the actual path to your cloned repository.

4. **Add your credentials**: Replace `YOUR_SITE_ID` and `YOUR_SITE_KEY` with your actual Clicky credentials.

5. **Restart Claude Desktop** for the changes to take effect.

Once configured, you'll be able to use tools like "get traffic sources for my website" or "show me top pages from last week" directly in Claude Desktop conversations.

## Available Tools

### get_total_visitors

Get total visitor counts for a specified date range.

**Parameters:**
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format

**Example:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

### get_domain_visitors

Get visitor data filtered by referrer domain with optional segmentation data.

**Parameters:**
- `domain` (string, required): Domain name to filter by (e.g., "facebook.com", "google.com")
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format
- `segments` (array, optional): Array of segments to include. Options: "pages", "visitors". Defaults to "visitors" only.
  - "visitors": Gets the total number of visitors from the domain
  - "pages": Gets the list of pages and their visit counts from the domain
- `limit` (number, optional): Maximum number of results to return (1-1000)

**Basic Example (visitor count only):**
```json
{
  "domain": "facebook.com",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Advanced Example (with segmentation):**
```json
{
  "domain": "facebook.com",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "segments": ["pages", "visitors"],
  "limit": 100
}
```

### get_top_pages

Get the most popular pages for a date range.

**Parameters:**
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format
- `limit` (number, optional): Maximum number of pages to return (1-1000)

**Example:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "limit": 50
}
```

### get_traffic_sources

Get traffic sources breakdown showing where visitors come from. Optionally filter by specific page URL.

**Parameters:**
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format
- `page_url` (string, optional): Full URL or path of the page to get traffic sources for (e.g., "https://example.com/path" or "/path")

**Example:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Example with page filter:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "page_url": "https://example.com/blog/post"
}
```

**Returns:** Clean breakdown of traffic sources with visitor counts and percentages for sources like Direct, Search engines, Social media, Links, etc.

### get_page_traffic

Get traffic data for a specific page by filtering with its URL.

**Parameters:**
- `url` (string, required): Full URL or path of the page (e.g., "https://example.com/page" or "/page")
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format

**Example:**
```json
{
  "url": "https://news.ycombinator.com/show",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Returns:** Traffic data for the specific page including visitor counts, actions, and other page-specific metrics.

## API Limitations

- Maximum date range: 31 days (enforced by Clicky API)
- Maximum results per request: 1,000 items
- One simultaneous request per IP address per site ID

## Error Handling

The server includes built-in error handling for:
- Invalid date ranges (> 31 days)
- API rate limits
- Network errors
- Invalid parameters

All errors are returned with descriptive messages to help with debugging.

## Development

The project structure:

```
clicky-mcp/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── clicky-client.ts      # Clicky API client
│   └── tools/
│       ├── get-total-visitors.ts
│       ├── get-domain-visitors.ts
│       ├── get-top-pages.ts
│       ├── get-traffic-sources.ts
│       └── get-page-traffic.ts
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT