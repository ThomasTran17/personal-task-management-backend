import { spawn } from 'child_process';
import * as os from 'os';

const platform = os.platform();

console.log('Starting NestJS and Cloudflare Tunnel...');

const nest = spawn('npm', ['run', 'start:dev'], { 
  stdio: 'inherit', 
  shell: true 
});

let tunnelCommand: string;
let tunnelArgs: string[];

if (platform === 'win32') {
  tunnelCommand = 'cmd';
  tunnelArgs = ['/c', 'start', 'cmd', '/k', 'npm run tunnel'];
} else if (platform === 'darwin') {
  tunnelCommand = 'osascript';
  tunnelArgs = ['-e', `tell application "Terminal" to do script "cd ${process.cwd()} && npm run tunnel"`];
} else {
  tunnelCommand = 'gnome-terminal';
  tunnelArgs = ['--', 'bash', '-c', 'npm run tunnel; exec bash'];
}

const tunnel = spawn(tunnelCommand, tunnelArgs, { shell: true });

tunnel.on('error', (err) => {
  console.error('You cannot open a new Tunnel window:', err.message);
});

console.log(`✅ NestJS is running here. Check the new window to get the Cloudflare URL!`);