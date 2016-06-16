var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var readline = require('readline');
var debug = require('debug');

var rl = readline.createInterface(process.stdin, process.stdout);

// Enable debug for our namespace
debug.enable('log,log:*');

var rimraf = require('rimraf');


function makeRelease(releaseType, modifiers, callback) {
    var log = debug(`log:${releaseType}`);

    // Get version string from package.json
    const packageData = require('../package.json');

    // Get current time and convert it to FS safe value
    const curTime = new Date().toISOString().replace(/:|\./gi, '-');

    // Target build dir
    const targetDir = path.join('.release', `${releaseType}-${curTime}`);

    // Log parameters
    log(`Original: ${packageData.name}@${packageData.version}`);
    log(`Release Type: ${releaseType}`);
    log(`Target Dir: ${targetDir}`);

    // Modify package data with modifiers
    (modifiers || []).forEach(modFn => {
        // Extend packageData
        Object.assign(packageData, modFn(Object.assign({}, packageData), releaseType, curTime));
    });

    // Log new name
    log(`Preparing: ${packageData.name}@${packageData.version}`);

    // Create directory
    fs.mkdirpSync(targetDir);

    // Copy files to it ignoring dist & scripts
    fs.copy('.', targetDir, {
        filter: tPath => {
            tPath = tPath.replace(path.join(__dirname, '..'), '');

            if (tPath[0] === '/') {
                tPath = tPath.substring(1);
            }

            if (tPath.startsWith('.git/') || tPath === '.git') {
                return false;
            }

            return !(tPath.startsWith('.release') || tPath.startsWith('node_modules') || tPath.startsWith('dist') || tPath.startsWith('scripts'));
        }
    }, () => {
        // Dump out pacakge.json
        fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(packageData));

        // Link node modules
        log('Directories synced');

        log('Installing node modules');
        child_process.execSync('npm install', {
            cwd: targetDir
        });
        log('Installed node modules');

        log('Building package');
        child_process.execSync('npm run build', {
            cwd: targetDir
        });
        log('Completed');

        const anwserHandler = function(answer) {
            answer = answer.trim().toLowerCase();

            if (answer === 'y' || answer === 'yes' ) {
                log('releasing package');
                child_process.execSync('npm publish', {
                    cwd: targetDir
                });
                log('package released');
            } else {
                log('Not releasing!');
            }

            log('Cleaning up node modules to preserve disk space');
            rimraf(`${targetDir}/node_modules`, {}, function () {
                log('Done');

                if (callback) {
                    callback();
                }
            });
        }

        if (process.env.R_NO_PROMPT !== 'y') {
            rl.question(`Release ${packageData.name}@${packageData.version} on npm? [yes]/no: `, anwserHandler);
        } else {
            anwserHandler('yes');
        }
    });
}

/**
 * Set correct release name
 */
function setReleaseName(packageData, releaseType, curTime) {
    if (releaseType !== 'default') {
        packageData.name = `${packageData.name}-${releaseType}`;
    }

    return packageData;
}

/**
 * Remove browser/node specific peerDependencies from react-native release
 */

function cleanupPeerDeps(packageData, releaseType, curTime) {
    if (releaseType === 'react-native') {
        delete packageData.peerDependencies['babel-runtime'];
    }

    return packageData;
}

function removeRuntimeBuild(packageData, releaseType, curTime) {
    if (releaseType === 'react-native') {
        packageData.scripts.build = packageData.scripts.build.replace('--optional runtime', '')
    }

    return packageData;
}

const ourModifiers = [
    setReleaseName,
    cleanupPeerDeps,
    removeRuntimeBuild
];


// First release the default, then the react-native version
makeRelease('default', ourModifiers, () => {
    makeRelease('react-native', ourModifiers, () => {
        // Cleanup after readline
        rl.close();
        process.stdin.destroy();
    });
});
