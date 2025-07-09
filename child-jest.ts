import {existsSync, statSync} from 'fs';
import {runCLI} from 'jest';

process.on('message', async ({cwd, testPattern}) => {
    if (!existsSync(cwd)) {
        return process.send?.({
            type: 'text',
            text: `Error: ${cwd} does not exist`,
        });
    }
    if (!statSync(cwd).isDirectory()) {
        return process.send?.({
            type: 'text',
            text: `Error: ${cwd} is not a directory`,
        });
    }
    process.chdir(cwd);
    try {
        const result = await runCLI(
            {
                _: testPattern ? [testPattern] : [],
                coverage: true,
                json: true,
                $0: 'jest-mcp',
                runInBand: true,
                // testNamePattern: testPattern ? testPattern : undefined,
                silent: true,
                rootDir: cwd,
            },
            [cwd],
        );

        const {results} = result;
        process.send?.({
            type: 'text',
            text: JSON.stringify({
                success: results.success,
                numPassedTests: results.numPassedTests,
                numFailedTests: results.numFailedTests,
                testResults: results.testResults,
                coverageMap: results.coverageMap,
            }),
        });
    } catch (err) {
        return process.send?.({
            type: 'text',
            text: `Error running jest: ${(err as Error).message}`,
        });
    }
});
/*
/Users/jared/clone/apps/artswap/backend
*/
