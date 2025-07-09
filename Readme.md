# jest-mcp

A Model Context Protocol (MCP) server for running Jest tests programmatically.

## Overview

`jest-mcp` exposes a tool for running Jest tests in a given directory, optionally filtered by a test pattern. It is implemented as an MCP server using the `@modelcontextprotocol/sdk` and can be used as part of automated workflows or integrated with MCP-compatible clients.

## Features
- Run Jest tests in any directory
- Optional test pattern to filter which tests to run
- Returns structured results including pass/fail counts, test details, and coverage information
- Communicates via MCP protocol over stdio

## Usage

### Prerequisites
- Node.js 18+ (uses ESM and child process features)
- TypeScript (for development)
- Jest (installed as a dependency)

### Running the Server

`server.sh` will do its best to find your `node` binary and use it to run `server.ts`.

In your VSCode `settings.json`, it'll look like this:
```json
    "mcp": {
        "servers": {
            "jest-mcp": {
                "type": "stdio",
                "command": "/path/to/jest-mcp/server.sh",
                "args": []
            }
        }
    }
```

### Tool: `run-jest`

**Description:** Run jest tests in a directory, with an optional test pattern which matches the test file path.

**Input Schema:**
- `cwd` (string): Directory to run tests in (must exist)
- `testPattern` (string, optional): Pattern to match test files

**Example Call:**
```json
{
  "tool": "run-jest",
  "input": {
    "cwd": "/path/to/project",
    "testPattern": "*.test.js"
  }
}
```

**Response:**
- Structured JSON with test results, including pass/fail counts and details.

## Development

- `server.ts`: Main MCP server, registers the `run-jest` tool and handles requests.
- `child-jest.ts`: Forked child process that runs Jest and returns results.
- Uses `@modelcontextprotocol/sdk` for MCP server and transport.
- Uses `zod` for input validation.

The [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) is very useful for debugging.

## License

ISC
