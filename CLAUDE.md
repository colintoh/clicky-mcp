# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in `dist/`
- **Development**: `npm run dev` - Runs the server directly with tsx for development
- **Production**: `npm start` - Runs the built server from `dist/index.js`
- **Install**: `npm install` - Install dependencies

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides Clicky analytics API integration. The architecture follows a modular pattern:

### Core Components

- **`src/index.ts`**: Main MCP server class (`ClickyMCPServer`) that sets up the MCP server with stdio transport and registers all tool handlers
- **`src/clicky-client.ts`**: HTTP client wrapper (`ClickyClient`) for the Clicky API with built-in validation and error handling
- **`src/tools/`**: Individual tool implementations, each exporting a tool definition and handler function

### Tool Pattern

Each tool follows a consistent pattern:
- Exports a `Tool` object with JSON schema validation
- Exports an async handler function that takes validated args and a `ClickyClient` instance
- Returns MCP-formatted responses with proper error handling

### Key Configuration

- **Site credentials**: Configurable via command line args, environment variables, or `.env` file
  - Command line: `--site-id <id> --site-key <key>`
  - Environment: `CLICKY_SITE_ID` and `CLICKY_SITE_KEY`
  - `.env` file: Same environment variable names
- **API constraints**: 31-day maximum date range, 1000 item limit enforced by client
- **Date format**: All dates use YYYY-MM-DD format with regex validation

### Available Tools

1. **`get_total_visitors`**: Fetches visitor counts for date ranges
2. **`get_domain_visitors`**: Filters visitors by referrer domain
3. **`get_top_pages`**: Returns most popular pages with optional limit

### Error Handling

The client includes comprehensive error handling for:
- Date range validation (>31 days, invalid ranges)
- API rate limits and network errors
- Invalid parameters with descriptive messages