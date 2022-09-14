
import * as vscode from 'vscode';
import * as fs from "fs";
import {paths} from "./paths";
import { sep } from 'path';


export function setupExtension() {
	if (!fs.existsSync(paths.simpleProject.csproj)) {
		let options = { name: "Adventures in C# Setup", cwd: paths.extensionPath };
		let terminal = vscode.window.createTerminal(options);
		terminal.sendText(`dotnet new console -o '${paths.simpleProject.dirName}'`);
        setTimeout(() => {
            if (fs.existsSync(paths.simpleProject.csproj)) {
                vscode.window.showInformationMessage("Adventures in C# Extension: Setup Successful.");
                terminal.sendText("exit");  
            } else {
                vscode.window.showErrorMessage("Adventures in C# Extension: Setup Failed.");
            }        
        }, 5000);
	}
}

export function setupCheck() {
    vscode.window.showInformationMessage("Starting Health Check...");
    let options = { name: "Adventures in C# Setup" };
	let terminal = vscode.window.createTerminal(options);
    terminal.show();

    const versionPath = `${paths.extensionPath}${sep}dotnet.version.txt`;
    const initLog = `${paths.extensionPath}${sep}create-simple-project.log.txt`;
    fs.rmSync(versionPath, { force: true });
    fs.rmSync(initLog, { force: true });
    let steps = 0;
    vscode.window.onDidCloseTerminal(async t => {
        if (terminal === t) {
            const check: string[] = [];
            check.push(`Extension Path: ${paths.extensionPath}`);
            check.push(`Extension Path Exists: ${fs.existsSync(paths.extensionPath)}`);
            check.push(`Simple Project Path: ${paths.simpleProject.path}`);
            check.push(`Simple Project Path Exists: ${fs.existsSync(paths.simpleProject.path)}`);
            if(fs.existsSync(versionPath)) {
                vscode.workspace.openTextDocument(versionPath).then(doc => {
                    check.push(`Dotnet version:`);
                    check.push(doc.getText());
                    steps++;
                    openWindow(check, steps);
                });
            } else {
                check.push(`Dotnet version: Failed!`);
                steps++;
            }
            if(fs.existsSync(initLog)) {
                vscode.workspace.openTextDocument(initLog).then(doc => {
                    check.push(`Simple Project Init Log: `);
                    check.push(doc.getText());
                    steps++;
                    openWindow(check, steps);
                });
            } else {
                check.push(`Simple Project Init Log: Failed!`);
                steps++;
            }
            openWindow(check, steps);
        }
    });
    terminal.sendText(`dotnet --version 1> '${versionPath}' 2>&1`);
    terminal.sendText(`dotnet new console --force -o '${paths.simpleProject.path}' > '${initLog}' 2>&1`);
    terminal.sendText("exit");
    vscode.window.showInformationMessage("Waiting for terminal to finish...");
}

function openWindow(check : string[], count: number) {
    if (count === 2) {
        vscode.workspace.openTextDocument({content: (check.join("\n"))}).then(doc =>
        {
            vscode.window.showTextDocument(doc);
        });
    }
}