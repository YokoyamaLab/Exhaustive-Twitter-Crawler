#!/usr/bin/env node

import { io } from 'socket.io-client';
import terminal_kit from 'terminal-kit';
import { DateTime } from 'luxon';
import { CronJob } from 'cron';
//import uniqid from 'uniqid';
import { Worker, isMainThread, workerData } from 'worker_threads';
import ngrok from 'ngrok';
import cryptoRandomString from 'crypto-random-string';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Command, Option } from 'commander/esm.mjs';
const program = new Command();
const { terminal } = terminal_kit;
const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
program
    .requiredOption('-i, --id <id>', 'Query Identifier')
    .option('-u, --url <url>', 'URL of WebSocket Server', 'wss://tokyo.jp.ngrok.io')
    .requiredOption('-t, --term <yyyy/mm/ddThh:mm-yyyy/mm/ddThh:mm>', 'Search Term')
    .addOption(new Option('--keywords-match <method>', 'Text Match Method').choices(['text-and', 'text-or', 'RegExp', 'tweet-id', 'expanded-url']).default('text-or', 'Text OR'))
    .option('--no-keywords', 'Fetch All Tweets!')
    .option('-k, --keywords <word...>', 'Comma Separated Search Keywords')
    .addOption(new Option('-l, --lang <lang>', 'Language').choices(['ja', 'en']))
    .option('-m, --mask <mask>', 'JSON Mask (https://www.npmjs.com/package/json-mask)')
    .option('--ignore-retweet', 'Filter: Ignore Retweet')
    .option('--only-retweet', 'Filter: Only Retweet')
    .option('--only-quote', 'Filter: Only Quote')
    .option('--has-geo', 'Filter: Has Geotag (Point and Polygon)')
    .option('--has-geo-point', 'Filter: Has Geotag (only Point)')
    .option('--bbox <min-lng,min-lat,max-lng,max-lat>', 'Filter: Tweets inside/intersect BBOX (with -gas-geo-option)')
    .option('--has-emoji', 'Filter: Has Emoji)')
    .addOption(new Option('-g, --giveaway <method>', 'Upload Method').choices(['no', 'local', 'webdav', 'here']).default('here', 'Download result to the current directory'))
    .option('--jst', 'Convert create_at to JST')
    .option('-d, --destination <url-or-path>', '(giveawa=local|webdav) Save Location')
    .option('-n, --user <username>', '(giveaway=webdav) Username for Webdav Server')
    .option('-p, --port <port>', '(giveaway=here) Port Number of this machine', 4580)
    .option('-b, --boost', 'Enable 2 phase text match')
    .option('-v, --verbose', 'Output detailed stats and errors')
    .option('--retweet-count <min-retweet>', 'Filter: retweet_count >= min-retweet');
program.parse();
const options = program.opts();
try {
    let password = null;
    if (options.giveaway == 'here') {
        options.giveaway = 'webdav';
        const aUrl = await ngrok.connect(options.port);
        const aPath = 'DIR' + cryptoRandomString({ length: 36, type: 'alphanumeric' });
        options.destination = aUrl + '/' + aPath;
        const worker = new Worker(path.join(__dirname, './workers/webdav.mjs'), {
            workerData: {
                url: aUrl,
                path: aPath,
                port: options.port,
            },
        });
    } else if (options.giveaway == 'webdav') {
        if (!options.destination) {
            terminal('ERROR: ' + 'WebDAV URL NOT FOUND. Please specify --destination.\n');
            terminal.processExit();
        }
        terminal('Password for the webdav server:');
        password = await terminal.inputField({
            echoChar: true,
        }).promise;
        terminal('\nThank you for telling me your password! 😋\n');
    } else if (options.giveaway == 'local') {
        try {
            if (!options.destination) {
                options.destination = path.normalize('~/exhaustive-twitter');
            } else {
                options.destination = path.isAbsolute(options.destination) ? options.destination : path.resolve(process.cwd(), options.destination);
            }
            if (!fs.existsSync(options.destination)) {
                fs.mkdirSync(options.destination, { recursive: true });
            }
        } catch (e) {
            terminal('Error:' + e + '\n');
            terminal.processExit();
        }
    }
    const instantConfigFile = path.join(HOME_DIR, '.exhaustive-twitter.json');
    //ファイルがなければ停止："get-id"の実行を勧める
    if (!fs.existsSync(instantConfigFile)) {
        terminal.bgColorRgb(244, 67, 54);
        terminal.colorRgb(232, 234, 246);
        terminal('[Config Error] ClientIDが見つかりません。');
        terminal.defaultColor();
        terminal.bgDefaultColor();
        terminal('\n以下のコマンドでClient Idを生成し、それを管理者に伝えTokensを発行してもらってください。\n\n');
        terminal('npx -y -p exhaustive-twitter-crawler@latest get-id\n\n');
        terminal.processExit();
        process.exit();
    }

    if (options.term.split('~').length != 2) {
        throw new RangeError('-termは"->"区切りで検索期間の最初と最後の日時をISO8601形式で記述してください。');
    }
    const term = options.term.split('~').map((term) => {
        const dt = DateTime.fromISO(term);
        if (!dt.isValid) {
            throw new RangeError("日付 ' " + term + " ' は無効です。理由：" + dt.invalidReason);
        }
        return dt;
        //const dt = term.split('T');
        //return dt[0] + ' ' + dt[1];
    });
    if (options.keywords === false) {
        //no-keywordsモード
        options.keywords = [];
    } else if (options.keywords === true) {
        //no-keywords, keywords指定なし
        throw new RangeError('--keywordsを指定しない場合(=全ツイート取得)は--no-keywordsスイッチを指定してください。');
    } else if (options.keywords.length == 1 && options.keywords[0].indexOf('[') === 0) {
        //JSONモード
        try {
            options.keywords = JSON.parse(options.keywords[0]);
        } catch (e) {
            throw new RangeError('--keywordsにJSONが指定されているようですが、フォーマットが間違っています。');
        }
    }
    if (
        options.bbox &&
        (options.bbox.split(',').length != 4 ||
            options.bbox.split(',').some((v) => {
                return isNaN(parseFloat(v));
            }))
    ) {
        throw new RangeError('--bboxの指定が間違っています。西,南,東,北の順でカンマ区切りで指定してください。');
    }
    const query = {
        title: options.id,
        //from: DateTime.fromFormat(term[0], 'yyyy/MM/dd HH:mm').toISO(),
        //to: DateTime.fromFormat(term[1], 'yyyy/MM/dd HH:mm').toISO(),
        from: term[0].toISO(),
        to: term[1].toISO(),
        keywordsMatch: options.keywordsMatch, //,"text-and" or "RegExp" or "tweet-id"
        keywords: options.keywords,
        //hashtagsMatch:"text-or", //,"text-and" or "RegExp"
        //hashtags:["コロナ"],
        //urlsMatch:"text-or", //,"text-and" or "RegExp"
        //urls:[""],
        //lang: 'ja',
        filters: {}, //ignore_retweet, only_retweet, only_quote, retweet_count
        verbose: options.verbose ? true : false,
        jst: options.jst ? true : false,
    };
    if (options.mask) {
        query.mask = options.mask;
    } else if (options.hasGeo || options.hasGeoPoint) {
        if (options.bbox) {
            query.bbox = options.bbox.split(',');
        }
        query.mask =
            'id_str,text,user(id_str,name,screen_name,location),is_quote_status,quoted_status_id_str,retweeted_status(id_str,user(id_str,name,screen_name,location)),entities(hashtags,user_mentions,urls),geo,place,coordinates,lang,timestamp_ms,created_at';
    } else {
        query.mask = 'id_str,text,user(id_str,name,screen_name),is_quote_status,quoted_status_id_str,retweeted_status(id_str,user(id_str,name,screen_name)),entities(hashtags,user_mentions,urls),lang,timestamp_ms,created_at';
    }
    if (options.lang) {
        query.lang = options.lang;
    }
    if (options.keywords.length == 0) {
        query.filters['no_keywords'] = true;
    }
    if (options.ignoreRetweet) {
        query.filters['ignore_retweet'] = true;
    }
    if (options.onlyRetweet) {
        query.filters['only_retweet'] = true;
    }
    if (options.onlyQuote) {
        query.filters['only_quote'] = true;
    }
    if (options.hasGeo) {
        query.filters['has_geo'] = 'all';
    }
    if (options.hasEmoji) {
        query.filters['has_emoji'] = true;
    }
    if (options.hasGeoPoint) {
        query.filters['has_geo'] = 'point';
    }
    if (options.retweetCount) {
        query.filters['retweet_count'] = options.retweetCount;
    }
    query.boost = options.boost ? true : false;
    if (options.giveaway == 'local') {
        query.giveaway = 'local';
        query.destination = options.destination;
    } else if (options.giveaway == 'webdav') {
        query.giveaway = 'webdav';
        query.destination = options.destination;
        if (password != null) {
            query.user = options.user;
            query.password = password;
        }
    } else {
        query.giveaway = 'no';
    }
    if (options.email) {
        query.email = options.email;
    }

    //ファイルが有ってtokensの長さが0なら停止："set-tokens"の実行を勧める
    const instantConfig = JSON.parse(fs.readFileSync(instantConfigFile, { encoding: 'utf8' }));
    if (instantConfig.tokens.length == 0) {
        terminal('\n');
        terminal.bgColorRgb(244, 67, 54);
        terminal.colorRgb(232, 234, 246);
        terminal('[Token Error] Tokenの残りがありません。以下のClient IDを管理者へ伝え、Tokensを発行してもらってください。');
        terminal.defaultColor();
        terminal.bgDefaultColor();
        terminal('\nYour Client ID is ' + instantConfig.clientId + '\n\n');
        terminal.processExit();
        process.exit();
    } else if (instantConfig.tokens.length < 1000) {
        terminal('[Token Warning] Tokenの残りが' + instantConfig.tokens.length + 'です。必要に応じて以下のClient IDを管理者へ伝えて追加のTokenを発行を依頼してください。');
        terminal('\nYour Client ID is ' + instantConfig.clientId + '\n\n');
        await ((msec) => new Promise((resolve) => setTimeout(resolve, msec)))(5000);
    }
    const token = instantConfig.tokens.pop();
    fs.writeFileSync(instantConfigFile, JSON.stringify(instantConfig), { flag: 'w+' });

    const queryId = instantConfig.clientId + '_' + token;
    const commandLine = process.argv.join(' ');
    const socket = io(options.url);
    socket.on('disconnect', async () => {
        terminal.clear();
        terminal('\n');
        terminal.bgColorRgb(244, 67, 54);
        terminal.colorRgb(232, 234, 246);
        terminal('[Disconnected!] サーバから切断されました。\n\n');
        terminal.defaultColor();
        terminal.bgDefaultColor();
        terminal.processExit();
    });
    let stopped = false;
    socket.on('connect', async () => {
        socket.emit('query', { queryId, query, commandLine }, async (response) => {
            //progressBar.stop();
            job.stop();
            stopped = true;
            terminal.clear();
            terminal.eraseDisplay();
            if (response.success) {
                const tsStart = DateTime.fromMillis(response.stats.tsStart);
                const tsFinish = DateTime.fromMillis(response.stats.tsFinish);
                terminal('[Query Done]\n');
                const pad = (num, keta) => {
                    return num.length > keta ? num : (' '.repeat(keta) + num).slice(keta * -1);
                };
                terminal.table(
                    [
                        ['Hit数', pad(response.stats.nHits, 10) + ' tweets'],
                        ['走査数', pad(response.stats.nTweets, 10) + ' tweets'],
                        ['秒間処理数', pad(Math.round(response.stats.TPS), 10) + ' tweets/sec'],
                        ['検索時間', tsFinish.diff(tsStart, ['days', 'hours', 'minutes', 'seconds']).toHuman() + ' (' + tsStart + ' ~ ' + tsFinish + ' )'],
                    ],
                    {
                        hasBorder: true,
                        borderAttr: { color: 'blue' },
                        fit: true,
                    }
                );
            } else {
                terminal('\n');
                terminal.bgColorRgb(244, 67, 54);
                terminal.colorRgb(232, 234, 246);
                terminal('[Query Error]');
                terminal.defaultColor();
                terminal.bgDefaultColor();
                terminal('\n' + response.message + '\n\n');
            }
            terminal.processExit();
        });
        terminal.clear();
        const progressBar = terminal.progressBar({
            width: 70,
            title: 'Scanning:',
            eta: true,
            percent: true,
            y: 1,
        });
        const transferBar = terminal.progressBar({
            width: 70,
            title: 'Transfer:',
            eta: true,
            percent: true,
            y: 2,
        });
        const glueBar = terminal.progressBar({
            width: 70,
            title: 'Concat  :',
            eta: true,
            percent: true,
            y: 3,
        });
        terminal.moveTo(0, 4).defaultColor('Compress: ').yellow('...').eraseLineAfter();
        const uploadBar = terminal.progressBar({
            width: 70,
            title: 'Upload  :',
            eta: true,
            percent: true,
            y: 5,
        });
        let job = new CronJob('*/2 * * * * *', () => {
            socket.emit('progress', { queryId, query }, (response) => {
                //jobOnGoing = false;
                if (response.all != 0 && !stopped) {
                    /*if (response.done == response.all && response.transfer.done == response.transfer.all && response.glue.done == response.glue.all) {
                    job.stop();
                }*/
                    progressBar.update(response.done / response.all);
                    transferBar.update(response.transfer.done / response.transfer.all);
                    glueBar.update(response.glue.done / response.glue.all);
                    terminal.moveTo(11, 4).yellow(response.compress).eraseLineAfter();
                    uploadBar.update(response.upload.done / response.upload.all);
                    //terminal.clear();
                    //terminal("Scan Files(done/all): "+response.done + '/' + response.all);
                }
            });
        });
        job.start();
    });
} catch (e) {
    if (e instanceof RangeError) {
        terminal.bgColorRgb(244, 67, 54);
        terminal.colorRgb(232, 234, 246);
        terminal('[Input Error] 検索条件の指定が間違っています');
        terminal.defaultColor();
        terminal.bgDefaultColor();
        terminal('\n' + e.message + '\n\n');
        terminal.processExit();
        process.exit();
    } else {
        throw e;
    }
}
let doubleCTRL_C = false;
terminal.on('key', async function (name, matches, data) {
    if (name === 'CTRL_C') {
        if (!doubleCTRL_C) {
            doubleCTRL_C = true;
            terminal('\nQuit? [Y|n]\n');
            let yn = await terminal.yesOrNo({ yes: ['y', 'ENTER'], no: ['n'] }).promise;
            if (yn) {
                terminal.clear();
                terminal.processExit();
            } else {
                doubleCTRL_C = false;
            }
        } else {
            terminal.clear();
            terminal.processExit();
        }
    }
});
