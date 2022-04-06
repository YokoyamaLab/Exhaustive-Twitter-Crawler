#!/usr/bin/env node

import uniqid from 'uniqid';
import path from 'path';
import fs from 'fs';

const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const instantConfigFile = path.join(HOME_DIR, '.exhaustive-twitter.json');
const instantConfig = fs.existsSync(instantConfigFile) ? JSON.parse(fs.readFileSync(instantConfigFile, { encoding: 'utf8' })) : { clientId: uniqid('PFT'), tokens: [] };
if (!fs.existsSync(instantConfigFile)) {
    fs.writeFileSync(instantConfigFile, JSON.stringify(instantConfig), { flag: 'w+' });
}

console.log();
console.log('現在、利用可能な', instantConfig.tokens.length, '個のTokenが登録されています。');
console.log('必要に応じて Client ID を管理者へ伝え、新しい Tokens を発行してもらってください。');
console.log()
console.log('あなたの Client ID は', instantConfig.clientId);
console.log();
