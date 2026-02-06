# MCP Echo Tool

A minimal MCP (Model Context Protocol) server that echoes messages with metadata.

## Features

- Echoes any message back with enriched metadata
- Returns: original message, reversed text, word count, character count, timestamp
- Works with npx execution
- Fully typed TypeScript implementation

## Installation

```bash
npm install -g mcp-echo-tool
```

Or run directly with npx:

```bash
npx mcp-echo-tool
```

## Usage

### With Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "echo": {
      "command": "npx",
      "args": ["mcp-echo-tool"]
    }
  }
}
```

### Tool Schema

```json
{
  "name": "echo",
  "description": "Echo a message with metadata",
  "inputSchema": {
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "The message to echo"
      }
    },
    "required": ["message"]
  }
}
```

### Example Response

Input:
```json
{ "message": "Hello World" }
```

Output:
```json
{
  "original": "Hello World",
  "reversed": "dlroW olleH",
  "word_count": 2,
  "char_count": 11,
  "timestamp": "2026-02-06T08:00:00.000Z"
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev
```

## Project Structure

```
mcp-echo-tool/
├── src/
│   └── index.ts    # Main server code
├── package.json    # With proper bin config
├── tsconfig.json   # TypeScript config
└── README.md       # This file
```

## License

MIT

## Author

tylarcam - Built for The Jam bounty challenge
