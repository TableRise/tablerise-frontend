#!/usr/bin/env node
/* eslint-disable no-console */

delete process.env.ELECTRON_RUN_AS_NODE;

const cypress = require('cypress');

const mode = process.argv[2] ?? 'run';
const extraArgs = process.argv.slice(3);

function toCypressOptions(args) {
    const options = {};

    for (let index = 0; index < args.length; index++) {
        const arg = args[index];

        if (arg === '--spec') {
            options.spec = args[index + 1];
            index += 1;
        }
    }

    return options;
}

async function main() {
    if (mode === 'open') {
        await cypress.open(toCypressOptions(extraArgs));
        return;
    }

    const result = await cypress.run(toCypressOptions(extraArgs));

    if (result.failures || result.totalFailed) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
