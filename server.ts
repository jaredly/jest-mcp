import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js';
import {fork} from 'child_process';
import {z} from 'zod';

const __dirname = import.meta.dirname;

// Create an MCP server
const server = new McpServer({
    name: 'jest-mcp',
    version: '1.0.0',
});

// Add an addition tool
server.registerTool(
    'run-jest',
    {
        title: 'Jest',
        description: 'Run jest tests in a directory, with an optional test pattern which matches the test file path',
        inputSchema: {cwd: z.string(), testPattern: z.string().optional()},
    },
    async ({cwd, testPattern}) => {
        return new Promise((res) => {
            const child = fork(__dirname + '/child-jest.ts', [], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });

            const out: CallToolResult['content'] = [];
            child.stdout?.setEncoding('utf8');
            child.stdout?.on('data', (data) => {
                out.push({type: 'text', text: `stdout: ${data.trim()}`});
            });
            child.stderr?.setEncoding('utf8');
            child.stderr?.on('data', (data) => {
                if (data.includes(`ExperimentalWarning: Type Stripping`)) {
                    return; // ignore that one
                }
                out.push({type: 'text', text: `stderr: ${data.trim()}`});
            });

            child.send({cwd, testPattern});

            // happy path, no need to bother with stdout/stderr
            child.on('message', (message) => {
                res({content: [message as CallToolResult['content'][0]]});
                child.kill();
            });

            child.on('exit', (err) => {
                res({
                    content: [
                        ...out,
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: 'Exited without responding',
                            }),
                        },
                    ],
                });
            });

            child.on('error', (err) => {
                res({
                    content: [
                        ...out,
                        {
                            type: 'text',
                            text: JSON.stringify({error: err.message}),
                        },
                    ],
                });
            });
        });
    },
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
