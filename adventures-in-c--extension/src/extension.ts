// https://share.captaincoder.org/?id=b3006e60-64f8-4a4b-a663-fdfad78ee452

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Base64 } from 'js-base64';
import * as axios from 'axios';

// Load Shared Program
// vscode://captain-coder.adventures-in-c--extension/load-shared-program?id=d5914972-fbda-46ff-9d66-81e96ad7ef67

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('adventures-in-c--extension.runProgram', () => {
		vscode.window.showInformationMessage('Running Program');
		runProgram();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('adventures-in-c--extension.previewProgram', () => {
		openSimpleProgram();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('adventures-in-c--extension.generateProgramURL', () => {
		vscode.window.showInformationMessage('Generating Program URL');
		generateProgramURL();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.window.registerUriHandler(new URIHandler());
	context.subscriptions.push(disposable);

	setupExtension();
	console.debug("Adventures in C#: Extension Activated");
}

// this method is called when your extension is deactivated
export function deactivate() {}

function runProgram() {
	const adventuresPath = getExtensionPath();
	openSimpleProgram();

	let terminal = vscode.window.terminals.find(t => t.name=== "Adventures in C#");
	if (terminal !== undefined) {
		terminal.dispose();
	}

	let options = { name: "Adventures in C#", cwd: adventuresPath };
	terminal = vscode.window.createTerminal(options);
	terminal.show();
	terminal.sendText("dotnet run --project SimpleProject/SimpleProject.csproj");
}

function openSimpleProgram() {
	const simpleProjectProgram = getExtensionPath() + "/SimpleProject/Program.cs";
	if(!fs.existsSync(simpleProjectProgram)){
		vscode.window.showInformationMessage("No Program Found.");
		return;
	}

	vscode.workspace.openTextDocument(simpleProjectProgram).then(doc => {
		let options = { preview: true };
		vscode.window.showTextDocument(doc, options);
	});
}

function loadSimpleProgram(programData : string) {
	const simpleProjectProgram = getExtensionPath() + "/SimpleProject/Program.cs";
	fs.writeFileSync(simpleProjectProgram, programData);
	openSimpleProgram();
}

function loadAndRunSimpleProgram(programData : string) {
	loadSimpleProgram(programData);
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

function generateProgramURL() : void {
	const editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		vscode.window.showErrorMessage("No source code editor selected.");
		return;
	}
	const fileUri = vscode.Uri.parse(editor.document.fileName);
	const paths = fileUri.path.split('\\');
	const fileName = paths[paths.length-1];

	if (fileName !== "Program.cs") {
		vscode.window.showErrorMessage("Generating program URLs only works for Program.cs files.");
		return;
	}
	const base64Program = Base64.encode(editor.document.getText());
	const uri = `https://us-central1-introtocsharp-a5eeb.cloudfunctions.net/createLoadProgramURL?programData=${base64Program}`;
	axios.default.get(uri).then(response => {
		const options = { title: "Share URL", value: response.data };
		vscode.window.showInputBox(options);
	})
	.catch(error => {
		vscode.window.showErrorMessage(`Could not generate URL: ${error}`)
	});
}

function getExtensionPath() : string {
	return vscode.extensions.getExtension("captain-coder.adventures-in-c--extension")!.extensionPath;
}

class URIHandler implements vscode.UriHandler {

	handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
		vscode.window.showInformationMessage('Loading Adventures in C# Program...');
		if (uri.path === "/load-simple-project") {
			this.loadSimpleProject(uri.query);
		}
		else if (uri.path === "/load-shared-program") {
			this.loadSharedProject(uri.query);
		}
	}

	private loadSharedProject(query : string) {
		if(!query.startsWith("program.cs=")) {
			vscode.window.showErrorMessage("Unable to load program.");
			return;
		}
		const programData = Base64.decode(query.substring(11));
		loadSimpleProgram(programData);
	}

	private loadSimpleProject(query : string) {
		if(!query.startsWith("program.cs=")) {
			vscode.window.showErrorMessage("Unable to load program.");
			return;
		}
		const programData = Base64.decode(query.substring(11));
		loadAndRunSimpleProgram(programData);
	}
}