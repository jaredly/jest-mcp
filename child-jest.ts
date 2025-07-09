import {existsSync, statSync} from 'fs';
import {runCLI} from 'jest';

process.on('message', async ({rootDir, testFilePattern, includeCoverage}) => {
    if (!existsSync(rootDir)) {
        return process.send?.({
            type: 'text',
            text: `Error: ${rootDir} does not exist`,
        });
    }
    if (!statSync(rootDir).isDirectory()) {
        return process.send?.({
            type: 'text',
            text: `Error: ${rootDir} is not a directory`,
        });
    }
    process.chdir(rootDir);
    try {
        const result = await runCLI(
            {
                _: testFilePattern ? [testFilePattern] : [],
                coverage: !!includeCoverage,
                json: true,
                $0: 'jest-mcp',
                runInBand: true,
                // testNamePattern: testFilePattern ? testFilePattern : undefined,
                silent: true,
                rootDir: rootDir,
            },
            [rootDir],
        );

        const {results} = result;
        process.send?.({
            type: 'text',
            text: JSON.stringify({
                success: results.success,
                numPassedTests: results.numPassedTests,
                numFailedTests: results.numFailedTests,
                testResults: results.testResults,
                coverageMap: includeCoverage ? results.coverageMap : undefined,
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
