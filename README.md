# Clicky MCP Server

A Model Context Protocol (MCP) server for fetching traffic analytics data from the Clicky API.

## Features

This MCP server provides four tools to interact with Clicky analytics:

- **`get_total_visitors`** - Get total visitors for a date range
- **`get_domain_visitors`** - Get visitors filtered by referrer domain 
- **`get_top_pages`** - Get top pages for a date range
- **`get_traffic_sources`** - Get traffic sources breakdown for a date range

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

Get visitor data filtered by referrer domain.

**Parameters:**
- `domain` (string, required): Domain name to filter by (e.g., "facebook", "google")
- `start_date` (string, required): Start date in YYYY-MM-DD format  
- `end_date` (string, required): End date in YYYY-MM-DD format

**Example:**
```json
{
  "domain": "facebook",
  "start_date": "2024-01-01", 
  "end_date": "2024-01-31"
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

Get traffic sources breakdown showing where visitors come from.

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

**Returns:** Clean breakdown of traffic sources with visitor counts and percentages for sources like Direct, Search engines, Social media, Links, etc.

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
│       └── get-traffic-sources.ts
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT