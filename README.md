# MCP Echo Tool Enhanced (10X) 🚀

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> **10X Enhanced Version** of the MCP Echo Tool - A comprehensive utility MCP server with 10+ powerful tools for text processing, encoding, hashing, and data generation.

## ✨ Features

This enhanced MCP server provides a complete suite of utility tools:

| Tool | Description |
|------|-------------|
| 🔊 **echo** | Enhanced echo with metadata, transformations, and hashes |
| 📝 **format** | Text formatting (uppercase, lowercase, title case, slugify, etc.) |
| 📊 **analyze** | Comprehensive text analysis and statistics |
| 🔐 **hash** | Cryptographic hashing (MD5, SHA1, SHA256, SHA512) |
| 🆔 **uuid** | UUID generation (v4, up to 100 at once) |
| ⏰ **timestamp** | Timestamp utilities and conversions |
| 🔢 **base64** | Base64 encoding and decoding |
| 🧰 **json** | JSON validation, formatting, and analysis |
| 🎲 **random** | Random data generator (numbers, strings, hex) |
| ℹ️ **info** | Server information and capabilities |

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/tylarcam/mcp-echo-tool-enhanced.git
cd mcp-echo-tool-enhanced

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

### Using npx (No Installation)

```bash
npx mcp-echo-tool-enhanced
```

### Using Docker

```bash
# Build and run with Docker
docker build -t mcp-echo-tool-enhanced .
docker run -i mcp-echo-tool-enhanced

# Or use Docker Compose
docker-compose up
```

## 🔧 Configuration

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "echo-enhanced": {
      "command": "npx",
      "args": ["mcp-echo-tool-enhanced"]
    }
  }
}
```

### With Docker

```json
{
  "mcpServers": {
    "echo-enhanced": {
      "command": "docker",
      "args": ["run", "-i", "mcp-echo-tool-enhanced:latest"]
    }
  }
}
```

## 📖 Tool Reference

### 1. Echo Tool

Echo a message with comprehensive metadata.

**Input:**
```json
{
  "message": "Hello World",
  "transform": "uppercase",
  "includeHash": true
}
```

**Output:**
```json
{
  "original": "Hello World",
  "transformed": "HELLO WORLD",
  "reversed": "dlroW olleH",
  "stats": {
    "word_count": 2,
    "char_count": 11,
    "char_count_no_spaces": 10,
    "line_count": 1,
    "avg_word_length": "5.00"
  },
  "timestamps": {
    "iso": "2026-02-07T16:30:00.000Z",
    "unix": 1675785000000,
    "utc": "Fri, 07 Feb 2026 16:30:00 GMT",
    "locale": "2/7/2026, 4:30:00 PM"
  },
  "encoding": {
    "base64": "SGVsbG8gV29ybGQ=",
    "base64url": "SGVsbG8gV29ybGQ"
  },
  "hashes": {
    "md5": "ed076287532e86365e841e92bfc50d8c",
    "sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "sha512": "861844d6704e8573fec34d967e20bcfef3d424cf48be04e6dc08f2bd58c729743371015ead891cc3cf1c9d34b49264b510751b1ff9e537937bc46b5d6ff4ecc8"
  }
}
```

**Transform options:** `none`, `uppercase`, `lowercase`, `titlecase`, `snake_case`, `kebab-case`, `camelCase`

### 2. Format Tool

Format text with various transformations.

**Input:**
```json
{
  "text": "hello world example",
  "operation": "titlecase"
}
```

**Operations:** `uppercase`, `lowercase`, `titlecase`, `sentence_case`, `reverse`, `trim`, `remove_spaces`, `remove_punctuation`, `slugify`

### 3. Analyze Tool

Analyze text and provide detailed statistics.

**Input:**
```json
{
  "text": "This is a sample text. It has multiple sentences!",
  "includeCharFrequency": true
}
```

**Output includes:**
- Word, sentence, paragraph counts
- Character composition (letters, digits, spaces, punctuation)
- Word length distribution
- Readability metrics
- Character frequency (optional)

### 4. Hash Tool

Generate cryptographic hashes.

**Input:**
```json
{
  "data": "password123",
  "algorithm": "sha256",
  "encoding": "hex"
}
```

**Algorithms:** `md5`, `sha1`, `sha256`, `sha512`, `sha3-256`
**Encodings:** `hex`, `base64`, `base64url`

### 5. UUID Tool

Generate UUIDs.

**Input:**
```json
{
  "version": "v4",
  "count": 5,
  "uppercase": false
}
```

### 6. Timestamp Tool

Timestamp utilities and conversions.

**Operations:**
- `now` - Get current timestamp
- `convert` - Convert between formats
- `add` - Add time to a timestamp

**Formats:** `iso`, `unix_ms`, `unix_s`, `utc`, `locale`, `date_only`, `time_only`

### 7. Base64 Tool

Encode and decode Base64 data.

**Input:**
```json
{
  "operation": "encode",
  "data": "Hello World",
  "urlSafe": false
}
```

### 8. JSON Tool

Validate, format, and analyze JSON.

**Operations:**
- `validate` - Validate JSON structure
- `format` - Pretty-print JSON
- `minify` - Remove whitespace
- `get_keys` - Extract all object keys
- `get_type` - Analyze value types

### 9. Random Tool

Generate random data.

**Types:**
- `integer` - Random integers
- `float` - Random floating point
- `hex` - Random hex strings
- `alphanumeric` - Random alphanumeric strings
- `string` - Random strings with special characters
- `boolean` - Random booleans

### 10. Info Tool

Get server information.

**Input:**
```json
{
  "detail": "full"
}
```

## 🐳 Docker Usage

### Build

```bash
docker build -t mcp-echo-tool-enhanced .
```

### Run

```bash
# Interactive mode (required for MCP)
docker run -i mcp-echo-tool-enhanced

# With resource limits
docker run -i --memory=256m --cpus=0.5 mcp-echo-tool-enhanced
```

### Docker Compose

```bash
# Production
docker-compose up -d

# Development (with hot reload)
docker-compose --profile dev up
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## 📁 Project Structure

```
mcp-echo-tool-enhanced/
├── src/
│   └── index.ts          # Main server code with all tools
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## 🏆 Bounty Submission

This project was built for **The Jam** bounty challenge: [Build an MCP Echo Tool](https://github.com/GeorgiyAleksanyan/the-jam/issues/3)

### Enhancements Over Base Requirements

| Requirement | Base | Enhanced (10X) |
|-------------|------|----------------|
| Echo tool | ✅ Basic | ✅ Enhanced with 7 transformations |
| Metadata | ✅ 4 fields | ✅ 15+ fields including hashes |
| Tools | 1 | 10 |
| Docker | ❌ | ✅ Dockerfile + Compose |
| Validation | ❌ | ✅ Zod schemas |
| Error handling | Basic | ✅ Comprehensive |
| Documentation | Basic | ✅ Comprehensive with examples |

## 🔗 Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Servers Registry](https://registry.modelcontextprotocol.io/)

## 📝 License

MIT © tylarcam

## 🙏 Acknowledgments

- Built for [The Jam](https://github.com/GeorgiyAleksanyan/the-jam) ecosystem
- Inspired by the [MCP Reference Servers](https://github.com/modelcontextprotocol/servers)
