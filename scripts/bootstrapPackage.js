const fs = require('fs');
const { join, resolve } = require('path');

const lernaCfg = require('../lerna.json');

const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error('Expecting arguments: <destination directory name> <package name>');
    process.exit(1);
}

const packageName = args[1];
const destinationDirName = args[0];
const destDir = resolve(join(
    __dirname, '..', 'packages', destinationDirName,
));
const templateDir = resolve(join(
    __dirname, '..', '.template',
));

function createFileFromTemplate(fileName, src, dest, values = null) {
    let data = fs.readFileSync(join(src, fileName), { encoding: 'utf-8' });

    if (values) {
        Object.keys(values).forEach((key) => {
            data = data.replace(key, values[key]);
        });
    }

    fs.writeFileSync(join(dest, fileName), data, { encoding: 'utf-8' });
}

function cleanPackageName(name) {
    return name
        .toLowerCase()
        .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
}

console.log(`Creating "${packageName}" from template`);
fs.mkdirSync(destDir);

console.log(cleanPackageName(packageName));

const values = {
    '<%VERSION%>': lernaCfg.version,
    '<%PACKAGE_NAME%>': packageName,
    '<%PACKAGE_NAME_SAFE%>': cleanPackageName(packageName),
    '<%DIR_NAME%>': destinationDirName,
};

fs.readdirSync(templateDir).forEach((fileName) => {
    console.log(`Creating ${fileName}`);
    createFileFromTemplate(fileName, templateDir, destDir, values);
});

fs.mkdirSync(join(destDir, 'src'));
fs.closeSync(fs.openSync(join(destDir, 'README.md'), 'w'));
fs.closeSync(fs.openSync(join(destDir, 'src', 'index.ts'), 'w'));
