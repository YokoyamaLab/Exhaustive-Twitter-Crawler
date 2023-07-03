import { Command, Option } from 'commander/esm.mjs';
const program = new Command();
const { terminal } = terminal_kit;
const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
program
    .option('-u, --url <url>', 'URL of WebSocket Server', 'wss://tokyo.jp.ngrok.io');
program.parse();
const options = program.opts();
const socket = io(options.url);
socket.on('disconnect', async () => {
    terminal.clear();
    terminal.eraseDisplay();
    terminal('\n');
    terminal.bgColorRgb(244, 67, 54);
    terminal.colorRgb(232, 234, 246);
    terminal('[Disconnected!] サーバから切断されました。\n\n');
    terminal.defaultColor();
    terminal.bgDefaultColor();
    terminal.processExit();
});
socket.on('connect', async () => {
    socket.emit('hello', { clientId }, async (response) => {
        terminal.clear();
        terminal.eraseDisplay();
        terminal(JSON.stringify(response));
        terminal.processExit();
    });
});