#!/usr/bin/env node

import path from 'path';
import fs from 'fs';

const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const instantConfigFile = path.join(HOME_DIR, '.exhaustive-twitter.json');
if (fs.existsSync(instantConfigFile)) {
    if (process.argv.length == 3) {
        const tokens = process.argv[2].split('_');
        const instantConfig = JSON.parse(fs.readFileSync(instantConfigFile, { encoding: 'utf8' }));
        let nReg = 0;
        tokens.forEach((token) => {
            if (instantConfig.tokens.includes(token)) {
                console.log('', token, '登録済みのためスキップします');
            } else {
                instantConfig.tokens.push(token);
                console.log('', token);
                nReg++;
            }
        });
        fs.writeFileSync(instantConfigFile, JSON.stringify(instantConfig), { flag: 'w' });
        console.log('以上の', nReg, '個のTokenを登録しました。');
        console.log('現在、全部で' + instantConfig.tokens.length + '個のTokenが登録されています。');
    } else if (process.argv.length == 2) {
        const instantConfig = JSON.parse(fs.readFileSync(instantConfigFile, { encoding: 'utf8' }));
        console.log('現在、全部で' + instantConfig.tokens.length + '個のTokenが登録されています。');
    } else {
        console.log('Error:', 'コマンドの実行方法が異なります。途中に不要なスペース、改行がないか確認してください。');
    }
} else {
    console.log('Error:', '設定ファイルが見つかりません。Client IDを発行した環境でこのコマンドを実行してください。');
}
