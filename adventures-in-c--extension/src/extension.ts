// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('adventures-in-c--extension.runProgram', () => {
		vscode.window.showInformationMessage('Running Program');
		runProgram();
	});
	context.subscriptions.push(disposable);


	// vscode://undefined_publisher.adventures-in-c--extension/some-data
	disposable = vscode.window.registerUriHandler(new URIHandler());
	context.subscriptions.push(disposable);

	setupExtension();
	console.debug("Adventures in C#: Extension Activated");
}

// this method is called when your extension is deactivated
export function deactivate() {}

function runProgram() {
	const adventuresPath = getExtensionPath();
	const simpleProjectProgram = getExtensionPath() + "/SimpleProject/Program.cs";
	if(!fs.existsSync(simpleProjectProgram)){
		vscode.window.showInformationMessage("No Program Found.");
		return;
	}

	vscode.workspace.openTextDocument(simpleProjectProgram).then(doc => {
		let options = { preview: true };
		vscode.window.showTextDocument(doc, options);
	});

	let terminal = vscode.window.terminals.find(t => t.name=== "Adventures in C#");
	if (terminal !== undefined) {
		terminal.dispose();
	}

	let options = { name: "Adventures in C#", cwd: adventuresPath };
	terminal = vscode.window.createTerminal(options);
	terminal.show();
	terminal.sendText("dotnet run --project SimpleProject/SimpleProject.csproj");
}

function loadAndRunSimpleProgram(programData : string) {
	const simpleProjectProgram = getExtensionPath() + "/SimpleProject/Program.cs";
	fs.writeFileSync(simpleProjectProgram, programData);
	runProgram();
}

function setupExtension() {
	const adventuresPath = getExtensionPath();
	const simpleProjectPath = adventuresPath + "/SimpleProject/SimpleProject.csproj";
	if (!fs.existsSync(adventuresPath)) {
		fs.mkdirSync(adventuresPath);
	}
	if (!fs.existsSync(simpleProjectPath)) {
		let options = { name: "Adventures in C# Setup", cwd: adventuresPath };
		let terminal = vscode.window.createTerminal(options);
		terminal.sendText("dotnet new console -o SimpleProject");
		terminal.sendText("exit");
	}
}

function getExtensionPath() : string {
	return vscode.extensions.getExtension("captain-codergit .adventures-in-c--extension")!.extensionPath;
}

class URIHandler implements vscode.UriHandler {

	handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
		vscode.window.showInformationMessage('Loading Adventures in C# Program...');
		if (uri.path === "/load-simple-project") {
			this.loadSimpleProject(uri.query);
		}
	}

	private loadSimpleProject(query : string) {
		if(!query.startsWith("program.cs=")) {
			vscode.window.showErrorMessage("Unable to load program.");
			return;
		}
		const programData = Buffer.from(query.substring(11), 'base64').toString();
		loadAndRunSimpleProgram(programData);
	}
}