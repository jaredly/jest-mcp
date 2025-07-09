#!/usr/bin/env fnm exec --using 24 node
import {McpServer, ResourceTemplate} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {runCLI} from 'jest';
import {z} from 'zod';
import {fork} from 'child_process';
import {resolve} from 'path';

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
        return new Promise((res) => {
            console.log('forking');
            const child = fork(resolve('./child-jest.ts'), [], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });

            const out = [];
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
                res({content: [message]});
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

        // process.chdir(cwd);
        // const result = await runCLI(
        //     {
        //         _: testPattern ? [testPattern] : [],
        //         coverage: true,
        //         json: true,
        //         $0: 'jest-mcp',
        //         runInBand: true,
        //         // testNamePattern: testPattern ? testPattern : undefined,
        //         silent: true,
        //         rootDir: cwd,
        //     },
        //     [cwd],
        // );

        // const {results} = result;
        // return {
        //     content: [
        //         {
        //             type: 'text',
        //             text: JSON.stringify({
        //                 success: results.success,
        //                 numPassedTests: results.numPassedTests,
        //                 numFailedTests: results.numFailedTests,
        //                 testResults: results.testResults,
        //                 coverageMap: results.coverageMap,
        //             }),
        //         },
        //     ],
        // };
    },
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
