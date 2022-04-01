#!/usr/bin/env node

import { io } from 'socket.io-client';
import terminal_kit from 'terminal-kit';
import { DateTime } from 'luxon';
import { CronJob } from 'cron';
import uniqid from 'uniqid';
import path from 'path';
import fs from 'fs';
import { Command, Option } from 'commander/esm.mjs';
const program = new Command();
const { terminal } = terminal_kit;

program
    .requiredOption('-i, --id <id>', 'Query Identifier')
    .requiredOption('-u, --url <url>', 'URL of WebSocket Server')
    .requiredOption('-t, --term <yyyy/mm/ddThh:mm-yyyy/mm/ddThh:mm>', 'Search Term')
    .addOption(new Option('--keywords-match <method>', 'Text Match Method').choices(['text-and', 'text-or', 'RegExp']).default('text-or', 'Text OR'))
    .requiredOption('-k, --keywords <word...>', 'Comma Separated Search Keywords')
    .addOption(new Option('-l, --lang <lang>', 'Language').choices(['ja', 'en']))
    .option('-m, --mask <mask>', 'JSON Mask (https://www.npmjs.com/package/json-mask)')
    .option('--ignore-retweet', 'Ignore Retweet')
    .option('--only-retweet', 'Only Retweet')
    .addOption(new Option('-g, --giveaway <method>', 'Upload Method').choices(['no', 'local', 'webdav']).default('local', 'Copy to anywhere in the local'))
    .option('--jst', 'Convert create_at to JST')
    .option('-d, --destination <url-or-path>', 'Save Location')
    .option('-n, --user <username>', 'Username for Webdav Server')
    .option('-v, --verbose', 'Output detailed stats and errors');

program.parse();
const options = program.opts();

let password;
if (options.giveaway == 'webdav') {
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

const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const monitorIdFile = path.join(HOME_DIR, '.exhaustive-twitter');
const monitorId = fs.existsSync(monitorIdFile) ? fs.readFileSync(monitorIdFile, { encoding: 'utf8' }) : uniqid('PFT');
if (!fs.existsSync(monitorIdFile)) {
    fs.writeFileSync(monitorIdFile, monitorId, { flag: 'w+' });
}

const term = options.term.split('-').map((term) => {
    const dt = term.split('T');
    return dt[0] + ' ' + dt[1];
});
if (options.keywords.length == 1) {
    try {
        console.log('JSON Keyword Mode');
        options.keywords = JSON.parse(options.keywords[0]);
    } catch (e) {
        //Nothing To Do
    }
}
const query = {
    title: options.id,
    from: DateTime.fromFormat(term[0], 'yyyy/MM/dd HH:mm').toISO(),
    to: DateTime.fromFormat(term[1], 'yyyy/MM/dd HH:mm').toISO(),
    keywordsMatch: options.keywordsMatch, //,"text-and" or "RegExp"
    keywords: options.keywords,
    //hashtagsMatch:"text-or", //,"text-and" or "RegExp"
    //hashtags:["コロナ"],
    //urlsMatch:"text-or", //,"text-and" or "RegExp"
    //urls:[""],
    //lang: 'ja',
    filters: {}, //ignore_retweet, only_retweet
    verbose: options.verbose ? true : false,
    jst: options.jst ? true : false,
};
if (options.mask) {
    query.mask = options.mask;
} else {
    query.mask = 'id_str,text,user(id_str,name,screen_name),is_quote_status,quoted_status_id_str,retweeted_status(id_str,user(id_str,name,screen_name)),entities(hashtags,user_mentions,urls),lang,timestamp_ms,created_at';
}
if (options.lang) {
    query.lang = options.lang;
}
if (options.ignoreRetweet) {
    //query.filters.push('ignore_retweet');
    query.filters['ignore_retweet'] = true;
}
if (options.onlyRetweet) {
    // query.filters.push('only_retweet');
    query.filters['only_retweet'] = true;
}
if (options.giveaway == 'local') {
    query.giveaway = 'local';
    query.destination = options.destination;
} else if (options.giveaway == 'webdav') {
    query.giveaway = 'webdav';
    query.destination = options.destination;
    query.user = options.user;
    query.password = password;
} else {
    query.giveaway = 'no';
}
const queryId = monitorId + '_' + uniqid();
console.log(query, queryId);

//console.log(options.url);
const socket = io(options.url);
socket.on('disconnect', async () => {
    terminal.processExit();
});
socket.on('connect', async () => {
    socket.emit('query', { queryId, query }, async (response) => {
        //progressBar.stop();
        job.stop();
        terminal.clear();
        terminal('\n[Query Done]\n');
        /*
        if (options.giveaway == 'local') {
            terminal('[Save File] Transferring...\n');
            //fs.promises.rename(response.archiveFile, options.destination);
            const origin = await fs.promises.open(response.archiveFile, 'r');
            const destination = await fs.promises.open(
                path.join(
                    options.destination,
                    options.id +
                        '_' +
                        DateTime.now().toFormat('yyyyMMddHHmm') +
                        '.tgz'
                ),
                'w+'
            );
            origin
                .createReadStream()
                .pipe(destination.createWriteStream())
                .on('finish', (err) => {
                    terminal(
                        'Giveaway! Move the result to ' +
                            options.destination +
                            '\n'
                    );
                    terminal('[ALL DONE]\n');
                });
        } else if (options.giveaway == 'webdav') {
            terminal('[WebDAV] Uploading...\n');
            socket.emit(
                'webdav',
                {
                    queryId: path.basename(response.archiveFile, '.tgz'),
                    name: options.name,
                    user: options.user,
                    password: password,
                    url:
                        options.destination +
                        options.id +
                        '_' +
                        DateTime.now().toFormat('yyyyMMddHHmm') +
                        '.tgz',
                },
                (responseWebDAV) => {
                    terminal(
                        'Giveaway! Start uploading to ' +
                            options.destination +
                            '\n'
                    );
                    terminal('[ALL DONE]\n');
                }
            );
        }*/
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
            if (response.all != 0) {
                if (response.done == response.all && response.transfer.done == response.transfer.all && response.glue.done == response.glue.all) {
                    job.stop();
                }
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
