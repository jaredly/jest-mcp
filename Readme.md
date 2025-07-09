# jest-mcp

Have your agent run jest, without resorting to the CLI 😅.

**Input Schema:**
- `rootDir` (string): Root directory of the project
- `testPattern` (string, optional): Pattern to match test files
- `includeCoverage` (boolean, optional): Whether to include a coverage report

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

## Development

The [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) is very useful for debugging.

## License

ISC
