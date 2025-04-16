# 👩‍🍳 Cookbook MCP Server

This is a Model Context Protocol (MCP) server that provides access to the Gousto cookbook API, allowing you to browse recipes, search by category, and view detailed recipe information.

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the server:
   ```
   npm run build
   ```

## Running the Server

Start the server using:

```
npm start
```

## Using with Claude Desktop

To use this server with Claude Desktop:

1. Make sure you have Claude Desktop installed and up-to-date
2. Open or create the Claude configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
3. Add the following configuration:

```json
{
  "mcpServers": {
    "mcp-cookbook": {
      "command": "node",
      "args": [
        "/path/to/your/build/index.js"
      ]
    }
  }
}
```

Replace `/path/to/your/build/index.js` with the absolute path to the built JavaScript file.

4. Restart Claude Desktop