'use strict';
import * as vscode from 'vscode';
const ls = require('lite-server');
import * as path from 'path';
import * as cp from 'child_process';

let liteServer = null;
let channel: vscode.OutputChannel = null;
export function activate(context: vscode.ExtensionContext) {

    let ll = vscode.commands.registerCommand('lite-server.launch', () => {
        channel = vscode.window.createOutputChannel('vscode-lite-server');
        let configPath = vscode.workspace.getConfiguration('vscode-lite-server').get('configFilePath');
        let args = configPath != null
            ? ['-c', `${configPath}`]
            : [];
        let cmd = `${context.extensionPath}/node_modules/.bin/lite-server`;

        liteServer = cp.spawn(/^win/.test(process.platform) ? `${cmd}.cmd` : `${cmd}`, args, { cwd: vscode.workspace.rootPath || undefined });
        channel.show();
        liteServer.stdout.on('data', function (data) {
            channel.append('stdout: ' + data);
        });
        liteServer.stderr.setEncoding('utf8');
        liteServer.stderr.on('data', function (data) {
            if (/^execvp\(\)/.test(data)) {
                console.log('Failed to start child process.');
            } else {
                channel.append('stderr: ' + data);
            }
        });

        liteServer.on('close', function (code) {
            channel.append('child process exited with code ' + code);
            channel.dispose();
        });
    });

    context.subscriptions.push(ll);

    let ls = vscode.commands.registerCommand('lite-server.stop', () => {
        if (liteServer != null) {
            liteServer.kill();
        }
    });

    context.subscriptions.push(ls);
}

export function deactivate() {
    if (liteServer != null) {
        liteServer.kill();
    }
}
