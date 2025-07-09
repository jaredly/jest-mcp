#!/usr/bin/env fnm exec --using 24 node
import {McpServer, ResourceTemplate} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {runCLI} from 'jest';
import {z} from 'zod';

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
        description: 'Run jest tests in a directory, with an optional test pattern',
        inputSchema: {cwd: z.string(), testPattern: z.string().optional()},
    },
    async ({cwd, testPattern}) => {
        process.chdir(cwd);
        const result = await runCLI(
            {
                _: [],
                coverage: true,
                json: true,
                $0: 'jest-mcp',
                runInBand: true,
                testNamePattern: testPattern ? testPattern : undefined,
                silent: true,
            },
            [cwd],
        );

        const {results} = result;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: results.success,
                        numPassedTests: results.numPassedTests,
                        numFailedTests: results.numFailedTests,
                        testResults: results.testResults,
                        coverageMap: results.coverageMap,
                    }),
                },
            ],
        };

        //     ({
        //     content: [{type: 'text', text: String(a + b)}],
        // })
    },
);

// Add a dynamic greeting resource
server.registerResource(
    'greeting',
    new ResourceTemplate('greeting://{name}', {list: undefined}),
    {
        title: 'Greeting Resource', // Display name for UI
        description: 'Dynamic greeting generator',
    },
    async (uri, {name}) => ({
        contents: [
            {
                uri: uri.href,
                text: `Hello, ${name}!`,
            },
        ],
    }),
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
