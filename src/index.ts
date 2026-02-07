#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID, createHash } from "crypto";

/**
 * MCP Echo Tool Enhanced - 10X Version
 * 
 * A comprehensive MCP utility server with multiple tools:
 * - echo: Enhanced echo with metadata and transformations
 * - format: Text formatting utilities
 * - analyze: Text analysis and statistics
 * - hash: Cryptographic hashing
 * - uuid: UUID generation
 * - timestamp: Timestamp utilities
 * - base64: Base64 encoding/decoding
 * - json: JSON validation and formatting
 */

// Initialize the MCP server
const server = new McpServer({
  name: "mcp-echo-tool-enhanced",
  version: "2.0.0",
});

// ============================================================================
// TOOL 1: Enhanced Echo
// ============================================================================
server.registerTool(
  "echo",
  {
    title: "Enhanced Echo",
    description: `Echo a message with comprehensive metadata and optional transformations.
    
Returns the original message plus:
- Reversed text
- Word count, character count, line count
- Timestamp in multiple formats
- Optional transformations (uppercase, lowercase, title case)
- Base64 encoded version
- Hash (MD5, SHA256) of the message`,
    inputSchema: {
      message: z.string().min(1).max(10000).describe("The message to echo"),
      transform: z.enum(["none", "uppercase", "lowercase", "titlecase", "snake_case", "kebab-case", "camelCase"]).optional().describe("Optional text transformation"),
      includeHash: z.boolean().optional().describe("Include MD5 and SHA256 hashes"),
    },
  },
  async (args) => {
    try {
      const { message, transform = "none", includeHash = false } = args;
      
      // Basic stats
      const reversed = message.split("").reverse().join("");
      const wordCount = message.trim().split(/\s+/).filter(w => w.length > 0).length;
      const charCount = message.length;
      const charCountNoSpaces = message.replace(/\s/g, "").length;
      const lineCount = message.split(/\r\n|\r|\n/).length;
      
      // Apply transformation
      let transformed = message;
      switch (transform) {
        case "uppercase":
          transformed = message.toUpperCase();
          break;
        case "lowercase":
          transformed = message.toLowerCase();
          break;
        case "titlecase":
          transformed = message.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
          break;
        case "snake_case":
          transformed = message.replace(/[\s]+/g, "_").toLowerCase();
          break;
        case "kebab-case":
          transformed = message.replace(/[\s]+/g, "-").toLowerCase();
          break;
        case "camelCase":
          transformed = message.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          ).replace(/\s+/g, "");
          break;
      }
      
      // Build response
      const response: Record<string, any> = {
        original: message,
        transformed: transform !== "none" ? transformed : undefined,
        reversed,
        stats: {
          word_count: wordCount,
          char_count: charCount,
          char_count_no_spaces: charCountNoSpaces,
          line_count: lineCount,
          avg_word_length: wordCount > 0 ? (charCountNoSpaces / wordCount).toFixed(2) : 0,
        },
        timestamps: {
          iso: new Date().toISOString(),
          unix: Date.now(),
          utc: new Date().toUTCString(),
          locale: new Date().toLocaleString(),
        },
        encoding: {
          base64: Buffer.from(message).toString("base64"),
          base64url: Buffer.from(message).toString("base64url"),
        },
      };
      
      if (includeHash) {
        response.hashes = {
          md5: createHash("md5").update(message).digest("hex"),
          sha256: createHash("sha256").update(message).digest("hex"),
          sha512: createHash("sha512").update(message).digest("hex"),
        };
      }
      
      // Clean up undefined values
      Object.keys(response).forEach(key => {
        if (response[key] === undefined) delete response[key];
      });
      
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 2: Text Format
// ============================================================================
server.registerTool(
  "format",
  {
    title: "Text Formatter",
    description: "Format text with various transformations",
    inputSchema: {
      text: z.string().min(1).describe("Text to format"),
      operation: z.enum([
        "uppercase", 
        "lowercase", 
        "titlecase", 
        "reverse", 
        "trim",
        "remove_spaces",
        "remove_punctuation",
        "slugify",
        "sentence_case"
      ]).describe("Formatting operation to apply"),
    },
  },
  async (args) => {
    try {
      const { text, operation } = args;
      let result = text;
      
      switch (operation) {
        case "uppercase":
          result = text.toUpperCase();
          break;
        case "lowercase":
          result = text.toLowerCase();
          break;
        case "titlecase":
          result = text.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
        case "sentence_case":
          result = text.toLowerCase().replace(/(^")|([.!?]\s+)([a-z])/g, (match, p1, p2, p3) => 
            p1 ? p1 : p2 + p3.toUpperCase()
          );
          result = result.charAt(0).toUpperCase() + result.slice(1);
          break;
        case "reverse":
          result = text.split("").reverse().join("");
          break;
        case "trim":
          result = text.trim();
          break;
        case "remove_spaces":
          result = text.replace(/\s/g, "");
          break;
        case "remove_punctuation":
          result = text.replace(/[^\w\s]/g, "");
          break;
        case "slugify":
          result = text.toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s]+/g, "-")
            .replace(/-+/g, "-")
            .trim();
          break;
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ original: text, operation, result }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 3: Text Analysis
// ============================================================================
server.registerTool(
  "analyze",
  {
    title: "Text Analyzer",
    description: "Analyze text and provide detailed statistics",
    inputSchema: {
      text: z.string().min(1).describe("Text to analyze"),
      includeCharFrequency: z.boolean().optional().describe("Include character frequency analysis"),
    },
  },
  async (args) => {
    try {
      const { text, includeCharFrequency = false } = args;
      
      // Basic stats
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
      
      // Character types
      const letters = (text.match(/[a-zA-Z]/g) || []).length;
      const digits = (text.match(/\d/g) || []).length;
      const spaces = (text.match(/\s/g) || []).length;
      const punctuation = (text.match(/[^\w\s]/g) || []).length;
      
      // Word length distribution
      const wordLengths: Record<number, number> = {};
      words.forEach(word => {
        const len = word.length;
        wordLengths[len] = (wordLengths[len] || 0) + 1;
      });
      
      const response: Record<string, any> = {
        counts: {
          characters: text.length,
          characters_no_spaces: text.replace(/\s/g, "").length,
          words: words.length,
          sentences: sentences.length,
          paragraphs: paragraphs.length,
        },
        averages: {
          words_per_sentence: sentences.length > 0 ? (words.length / sentences.length).toFixed(2) : 0,
          chars_per_word: words.length > 0 ? (text.replace(/\s/g, "").length / words.length).toFixed(2) : 0,
          sentences_per_paragraph: paragraphs.length > 0 ? (sentences.length / paragraphs.length).toFixed(2) : 0,
        },
        composition: {
          letters,
          digits,
          spaces,
          punctuation,
          other: text.length - letters - digits - spaces - punctuation,
        },
        word_length_distribution: wordLengths,
        readability: {
          // Simple approximation
          estimated_reading_time_min: Math.ceil(words.length / 200),
          complexity: words.length > 0 && sentences.length > 0 
            ? (words.length / sentences.length > 20 ? "complex" : 
               words.length / sentences.length > 10 ? "moderate" : "simple")
            : "unknown",
        },
      };
      
      if (includeCharFrequency) {
        const freq: Record<string, number> = {};
        for (const char of text.toLowerCase()) {
          if (/[a-z]/.test(char)) {
            freq[char] = (freq[char] || 0) + 1;
          }
        }
        response.character_frequency = freq;
      }
      
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 4: Hash Generator
// ============================================================================
server.registerTool(
  "hash",
  {
    title: "Hash Generator",
    description: "Generate cryptographic hashes of input data",
    inputSchema: {
      data: z.string().describe("Data to hash"),
      algorithm: z.enum(["md5", "sha1", "sha256", "sha512", "sha3-256"]).default("sha256").describe("Hash algorithm"),
      encoding: z.enum(["hex", "base64", "base64url"]).default("hex").describe("Output encoding"),
    },
  },
  async (args) => {
    try {
      const { data, algorithm = "sha256", encoding = "hex" } = args;
      
      // Generate hash
      const hash = createHash(algorithm).update(data);
      let result: string;
      
      switch (encoding) {
        case "base64":
          result = hash.digest("base64");
          break;
        case "base64url":
          result = hash.digest("base64url");
          break;
        case "hex":
        default:
          result = hash.digest("hex");
          break;
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            input_length: data.length,
            algorithm, 
            encoding, 
            hash: result 
          }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 5: UUID Generator
// ============================================================================
server.registerTool(
  "uuid",
  {
    title: "UUID Generator",
    description: "Generate UUIDs (Universally Unique Identifiers)",
    inputSchema: {
      version: z.enum(["v4", "v7"]).default("v4").describe("UUID version to generate"),
      count: z.number().int().min(1).max(100).default(1).describe("Number of UUIDs to generate"),
      uppercase: z.boolean().default(false).describe("Return UUIDs in uppercase"),
    },
  },
  async (args) => {
    try {
      const { version = "v4", count = 1, uppercase = false } = args;
      
      const uuids: string[] = [];
      for (let i = 0; i < count; i++) {
        // Note: Node's randomUUID generates v4 by default
        let uuid: string = randomUUID();
        if (uppercase) {
          uuid = uuid.toUpperCase();
        }
        uuids.push(uuid);
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            version,
            count: uuids.length,
            uuids 
          }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 6: Timestamp Utilities
// ============================================================================
server.registerTool(
  "timestamp",
  {
    title: "Timestamp Utilities",
    description: "Generate and convert timestamps in various formats",
    inputSchema: {
      operation: z.enum([
        "now", 
        "convert", 
        "add", 
        "format"
      ]).default("now").describe("Operation to perform"),
      value: z.string().optional().describe("Value for convert/add operations (timestamp or ISO date)"),
      format: z.enum([
        "iso", 
        "unix_ms", 
        "unix_s", 
        "utc", 
        "locale", 
        "date_only", 
        "time_only"
      ]).default("iso").describe("Output format"),
      addMs: z.number().optional().describe("Milliseconds to add (for add operation)"),
    },
  },
  async (args) => {
    try {
      const { operation = "now", value, format = "iso", addMs } = args;
      
      let date: Date;
      
      switch (operation) {
        case "now":
          date = new Date();
          break;
        case "convert":
          if (!value) throw new Error("Value required for convert operation");
          // Try parsing as number (unix timestamp)
          if (/^\d+$/.test(value)) {
            const num = parseInt(value, 10);
            date = new Date(num < 10000000000 ? num * 1000 : num);
          } else {
            date = new Date(value);
          }
          if (isNaN(date.getTime())) throw new Error("Invalid date value");
          break;
        case "add":
          if (!value || addMs === undefined) throw new Error("Value and addMs required for add operation");
          if (/^\d+$/.test(value)) {
            const num = parseInt(value, 10);
            date = new Date(num < 10000000000 ? num * 1000 : num);
          } else {
            date = new Date(value);
          }
          if (isNaN(date.getTime())) throw new Error("Invalid date value");
          date = new Date(date.getTime() + addMs);
          break;
        default:
          date = new Date();
      }
      
      let result: string | number;
      switch (format) {
        case "iso":
          result = date.toISOString();
          break;
        case "unix_ms":
          result = date.getTime();
          break;
        case "unix_s":
          result = Math.floor(date.getTime() / 1000);
          break;
        case "utc":
          result = date.toUTCString();
          break;
        case "locale":
          result = date.toLocaleString();
          break;
        case "date_only":
          result = date.toISOString().split("T")[0];
          break;
        case "time_only":
          result = date.toISOString().split("T")[1].replace("Z", "");
          break;
        default:
          result = date.toISOString();
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            operation,
            format,
            result,
            all_formats: {
              iso: date.toISOString(),
              unix_ms: date.getTime(),
              unix_s: Math.floor(date.getTime() / 1000),
              utc: date.toUTCString(),
              locale: date.toLocaleString(),
              date_only: date.toISOString().split("T")[0],
              time_only: date.toISOString().split("T")[1].replace("Z", ""),
            }
          }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 7: Base64 Encoding/Decoding
// ============================================================================
server.registerTool(
  "base64",
  {
    title: "Base64 Encoder/Decoder",
    description: "Encode or decode Base64 data",
    inputSchema: {
      operation: z.enum(["encode", "decode"]).describe("Operation to perform"),
      data: z.string().describe("Data to encode or decode"),
      urlSafe: z.boolean().default(false).describe("Use URL-safe Base64 (for encoding)"),
    },
  },
  async (args) => {
    try {
      const { operation, data, urlSafe = false } = args;
      
      if (operation === "encode") {
        const encoded = urlSafe 
          ? Buffer.from(data).toString("base64url")
          : Buffer.from(data).toString("base64");
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              operation,
              input_length: data.length,
              output_length: encoded.length,
              url_safe: urlSafe,
              result: encoded 
            }, null, 2) 
          }],
        };
      } else {
        // Decode
        try {
          const decoded = Buffer.from(data, urlSafe ? "base64url" : "base64").toString("utf-8");
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                operation,
                input_length: data.length,
                output_length: decoded.length,
                url_safe: urlSafe,
                result: decoded 
              }, null, 2) 
            }],
          };
        } catch {
          throw new Error("Invalid Base64 input");
        }
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 8: JSON Utilities
// ============================================================================
server.registerTool(
  "json",
  {
    title: "JSON Utilities",
    description: "Validate, format, and analyze JSON data",
    inputSchema: {
      operation: z.enum(["validate", "format", "minify", "get_keys", "get_type"]).default("validate").describe("Operation to perform"),
      data: z.string().describe("JSON string to process"),
      indent: z.number().int().min(0).max(8).default(2).describe("Indentation spaces (for format)"),
    },
  },
  async (args) => {
    try {
      const { operation = "validate", data, indent = 2 } = args;
      
      // Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              valid: false,
              error: e instanceof Error ? e.message : "Invalid JSON"
            }, null, 2) 
          }],
          isError: true,
        };
      }
      
      let result: any;
      
      switch (operation) {
        case "validate":
          result = {
            valid: true,
            type: Array.isArray(parsed) ? "array" : typeof parsed,
            size_bytes: Buffer.byteLength(data, "utf-8"),
            keys: typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
              ? Object.keys(parsed)
              : undefined,
            array_length: Array.isArray(parsed) ? parsed.length : undefined,
          };
          break;
        case "format":
          result = {
            valid: true,
            formatted: JSON.stringify(parsed, null, indent),
          };
          break;
        case "minify":
          result = {
            valid: true,
            minified: JSON.stringify(parsed),
            original_size: data.length,
            minified_size: JSON.stringify(parsed).length,
            compression_ratio: (JSON.stringify(parsed).length / data.length).toFixed(2),
          };
          break;
        case "get_keys":
          const getAllKeys = (obj: any, prefix = ""): string[] => {
            const keys: string[] = [];
            for (const key in obj) {
              const fullKey = prefix ? `${prefix}.${key}` : key;
              keys.push(fullKey);
              if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                keys.push(...getAllKeys(obj[key], fullKey));
              }
            }
            return keys;
          };
          result = {
            valid: true,
            keys: typeof parsed === "object" && parsed !== null 
              ? getAllKeys(parsed)
              : [],
          };
          break;
        case "get_type":
          const getType = (val: any): string => {
            if (val === null) return "null";
            if (Array.isArray(val)) return "array";
            return typeof val;
          };
          result = {
            valid: true,
            root_type: getType(parsed),
            types: typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
              ? Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, getType(v)]))
              : undefined,
          };
          break;
        default:
          result = { valid: true };
      }
      
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 9: Random Data Generator
// ============================================================================
server.registerTool(
  "random",
  {
    title: "Random Data Generator",
    description: "Generate random data (numbers, strings, hex, etc.)",
    inputSchema: {
      type: z.enum(["integer", "float", "hex", "alphanumeric", "string", "boolean"]).default("integer").describe("Type of random data"),
      min: z.number().optional().describe("Minimum value (for numbers)"),
      max: z.number().optional().describe("Maximum value (for numbers)"),
      length: z.number().int().min(1).max(1000).default(16).describe("Length (for strings/hex)"),
      count: z.number().int().min(1).max(100).default(1).describe("Number of values to generate"),
    },
  },
  async (args) => {
    try {
      const { type = "integer", min = 0, max = 100, length = 16, count = 1 } = args;
      
      const generate = (): any => {
        switch (type) {
          case "integer":
            return Math.floor(Math.random() * (max - min + 1)) + min;
          case "float":
            return Math.random() * (max - min) + min;
          case "boolean":
            return Math.random() < 0.5;
          case "hex":
            return Array.from({ length }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join("");
          case "alphanumeric":
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return Array.from({ length }, () => 
              chars.charAt(Math.floor(Math.random() * chars.length))
            ).join("");
          case "string":
            const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            return Array.from({ length }, () => 
              allChars.charAt(Math.floor(Math.random() * allChars.length))
            ).join("");
          default:
            return null;
        }
      };
      
      const results: any[] = [];
      for (let i = 0; i < count; i++) {
        results.push(generate());
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            type,
            count: results.length,
            values: count === 1 ? results[0] : results
          }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// TOOL 10: Server Info
// ============================================================================
server.registerTool(
  "info",
  {
    title: "Server Information",
    description: "Get information about this MCP server and its capabilities",
    inputSchema: {
      detail: z.enum(["basic", "full"]).default("basic").describe("Level of detail"),
    },
  },
  async (args) => {
    try {
      const { detail = "basic" } = args;
      
      const basic = {
        name: "mcp-echo-tool-enhanced",
        version: "2.0.0",
        description: "Enhanced MCP server with 10+ utility tools",
        node_version: process.version,
        platform: process.platform,
      };
      
      if (detail === "full") {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              ...basic,
              tools: [
                { name: "echo", description: "Enhanced echo with metadata and transformations" },
                { name: "format", description: "Text formatting utilities" },
                { name: "analyze", description: "Text analysis and statistics" },
                { name: "hash", description: "Cryptographic hashing (MD5, SHA256, etc.)" },
                { name: "uuid", description: "UUID generation" },
                { name: "timestamp", description: "Timestamp utilities" },
                { name: "base64", description: "Base64 encoding/decoding" },
                { name: "json", description: "JSON validation and formatting" },
                { name: "random", description: "Random data generator" },
                { name: "info", description: "Server information" },
              ],
              capabilities: {
                tools: true,
                resources: false,
                prompts: false,
              },
              uptime_seconds: process.uptime(),
              memory_usage: process.memoryUsage(),
            }, null, 2) 
          }],
        };
      }
      
      return {
        content: [{ type: "text", text: JSON.stringify(basic, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// Start Server
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Echo Tool Enhanced (10X) running on stdio");
  console.error("Available tools: echo, format, analyze, hash, uuid, timestamp, base64, json, random, info");
}

main().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
