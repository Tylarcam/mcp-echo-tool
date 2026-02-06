#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
/**
 * MCP Echo Tool Server
 * Echoes messages back with metadata (timestamp, word count, reversed)
 */
const server = new Server({
    name: "mcp-echo-tool",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define the echo tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "echo",
                description: "Echo a message with metadata including timestamp, word count, character count, and reversed text",
                inputSchema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "The message to echo",
                        },
                    },
                    required: ["message"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "echo") {
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
    const message = request.params.arguments?.message;
    if (!message) {
        throw new Error("Message parameter is required");
    }
    // Process the message
    const reversed = message.split("").reverse().join("");
    const wordCount = message.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = message.length;
    const timestamp = new Date().toISOString();
    const response = {
        original: message,
        reversed: reversed,
        word_count: wordCount,
        char_count: charCount,
        timestamp: timestamp,
    };
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response, null, 2),
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Echo Tool server running on stdio");
}
main().catch(console.error);
