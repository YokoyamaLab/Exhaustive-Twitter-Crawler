#!/usr/bin/env node

import uniqid from 'uniqid';
import path from 'path';
import fs from 'fs';

const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const monitorIdFile = path.join(HOME_DIR, '.exhaustive-twitter');
const monitorId = fs.existsSync(monitorIdFile) ? fs.readFileSync(monitorIdFile, { encoding: 'utf8' }) : uniqid('PFT');
if (!fs.existsSync(monitorIdFile)) {
    fs.writeFileSync(monitorIdFile, monitorId, { flag: 'w+' });
}

console.log();
console.log('Your ID is',monitorId);
console.log();