#!/usr/bin/env node
import { test, describe } from "node:test";
import assert from "node:assert";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe("MCP Echo Tool Server", () => {
    let client;
    let transport;
    test.beforeEach(async () => {
        transport = new StdioClientTransport({
            command: "node",
            args: [join(__dirname, "..", "dist", "index.js")],
        });
        client = new Client({
            name: "test-client",
            version: "1.0.0",
        }, {
            capabilities: {},
        });
        await client.connect(transport);
    });
    test.afterEach(async () => {
        await client.close();
    });
    describe("Server Connection", () => {
        test("should connect to the server successfully", async () => {
            assert.ok(client, "Client should be initialized");
        });
    });
    describe("List Tools", () => {
        test("should list the echo tool", async () => {
            const tools = await client.listTools();
            assert.ok(tools.tools, "Tools should be returned");
            assert.strictEqual(tools.tools.length, 1, "Should have exactly one tool");
            assert.strictEqual(tools.tools[0].name, "echo", "Tool name should be 'echo'");
            assert.ok(tools.tools[0].description, "Tool should have a description");
            assert.ok(tools.tools[0].inputSchema, "Tool should have an input schema");
        });
        test("should have correct input schema for echo tool", async () => {
            const tools = await client.listTools();
            const echoTool = tools.tools[0];
            assert.strictEqual(echoTool.inputSchema.type, "object", "Schema type should be object");
            assert.ok(echoTool.inputSchema.properties, "Schema should have properties");
            assert.ok(echoTool.inputSchema.properties.message, "Schema should have message property");
            assert.strictEqual(echoTool.inputSchema.properties.message.type, "string", "Message property should be a string");
            assert.ok(Array.isArray(echoTool.inputSchema.required), "Schema should have required array");
            assert.ok(echoTool.inputSchema.required.includes("message"), "Message should be required");
        });
    });
    describe("Echo Tool", () => {
        test("should echo a simple message", async () => {
            const result = await client.callTool({
                name: "echo",
                arguments: {
                    message: "Hello World",
                },
            });
            assert.ok(result.content, "Result should have content");
            assert.strictEqual(result.content.length, 1, "Should have one content item");
            assert.strictEqual(result.content[0].type, "text", "Content type should be text");
            const response = JSON.parse(result.content[0].text);
            assert.strictEqual(response.original, "Hello World", "Original message should match");
            assert.strictEqual(response.reversed, "dlroW olleH", "Reversed message should be correct");
            assert.strictEqual(response.word_count, 2, "Word count should be 2");
            assert.strictEqual(response.char_count, 11, "Character count should be 11");
            assert.ok(response.timestamp, "Should have a timestamp");
            assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(response.timestamp), "Timestamp should be ISO format");
        });
        test("should handle empty message", async () => {
            const result = await client.callTool({
                name: "echo",
                arguments: {
                    message: "",
                },
            });
            const response = JSON.parse(result.content[0].text);
            assert.strictEqual(response.original, "", "Original message should be empty");
            assert.strictEqual(response.reversed, "", "Reversed message should be empty");
            assert.strictEqual(response.word_count, 0, "Word count should be 0");
            assert.strictEqual(response.char_count, 0, "Character count should be 0");
        });
        test("should handle message with multiple words", async () => {
            const message = "The quick brown fox jumps over the lazy dog";
            const result = await client.callTool({
                name: "echo",
                arguments: {
                    message,
                },
            });
            const response = JSON.parse(result.content[0].text);
            assert.strictEqual(response.original, message, "Original message should match");
            assert.strictEqual(response.word_count, 9, "Word count should be 9");
            assert.strictEqual(response.char_count, message.length, "Character count should match");
        });
        test("should handle message with special characters", async () => {
            const message = "Hello! @#$%^&*() 世界 🌍";
            const result = await client.callTool({
                name: "echo",
                arguments: {
                    message,
                },
            });
            const response = JSON.parse(result.content[0].text);
            assert.strictEqual(response.original, message, "Original message should match");
            assert.strictEqual(response.reversed, message.split("").reverse().join(""), "Reversed should match");
            assert.strictEqual(response.char_count, message.length, "Character count should match");
        });
        test("should handle message with extra whitespace", async () => {
            const message = "  Hello   World  ";
            const result = await client.callTool({
                name: "echo",
                arguments: {
                    message,
                },
            });
            const response = JSON.parse(result.content[0].text);
            assert.strictEqual(response.original, message, "Original message should preserve whitespace");
            assert.strictEqual(response.word_count, 2, "Word count should be 2 (whitespace trimmed)");
            assert.strictEqual(response.char_count, message.length, "Character count should include whitespace");
        });
        test("should include timestamp in response", async () => {
            const before = new Date().toISOString();
            const result = await client.callTool({
                name: "echo",
                arguments: {
                    message: "Test",
                },
            });
            const after = new Date().toISOString();
            const response = JSON.parse(result.content[0].text);
            assert.ok(response.timestamp, "Should have timestamp");
            const timestamp = new Date(response.timestamp);
            assert.ok(timestamp instanceof Date && !isNaN(timestamp.getTime()), "Timestamp should be valid date");
            // Timestamp should be between before and after
            assert.ok(response.timestamp >= before || response.timestamp <= after, "Timestamp should be recent");
        });
    });
    describe("Error Handling", () => {
        test("should throw error for unknown tool", async () => {
            await assert.rejects(async () => {
                await client.callTool({
                    name: "unknown_tool",
                    arguments: {},
                });
            }, (error) => {
                return error.message.includes("Unknown tool");
            }, "Should throw error for unknown tool");
        });
        test("should throw error when message parameter is missing", async () => {
            await assert.rejects(async () => {
                await client.callTool({
                    name: "echo",
                    arguments: {},
                });
            }, (error) => {
                return error.message.includes("Message parameter is required");
            }, "Should throw error when message is missing");
        });
        test("should throw error when message is null", async () => {
            await assert.rejects(async () => {
                await client.callTool({
                    name: "echo",
                    arguments: {
                        message: null,
                    },
                });
            }, (error) => {
                return error.message.includes("Message parameter is required");
            }, "Should throw error when message is null");
        });
    });
});
