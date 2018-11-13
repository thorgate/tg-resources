#!/usr/bin/env node

const { listen } = require('../lib/index');

const args = process.argv.slice(2);

function getValue(key) {
    const index = args.findIndex(v => v === key);

    if (index >= 0) {
        return args[index + 1];
    }

    return undefined;
}

const port = getValue('-p') || getValue('--port') || 3001;

console.log(`Listening on port ${port}`);
const server = listen(port, true);

process.on('exit', () => {
    console.log('Server closed.');
    server.close();
});
