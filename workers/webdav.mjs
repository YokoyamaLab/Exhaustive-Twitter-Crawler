#!/usr/bin/env node

import { workerData } from 'worker_threads';
import { v2 as webdav } from 'webdav-server';
2
const server = new webdav.WebDAVServer({
    port: workerData.port,
});
server.on('create', (ctx, fs, path, data) => {
    //console.log('Resource created; createIntermediates=', data.createIntermediates);
});
server.on('before-create', (ctx, fs, path, data) => {
    //console.log('Before resource created; createIntermediates=', data.createIntermediates);
});

server.setFileSystem('/' + workerData.path, new webdav.PhysicalFileSystem('.'), (success) => {
    server.start(() => console.log('Start WebDAV server:', workerData.url + '/' + workerData.path));
});
