import * as vscode from 'vscode';
import * as fs from 'fs';
import { Base64 } from 'js-base64';
import * as axios from 'axios';
import { paths } from "./paths";
import * as auth from "./auth";
import { URIHandler } from './uriHandler';
import * as setup from "./setup";

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

	disposable = vscode.commands.registerCommand('adventures-in-c--extension.authenticate', () => {
		auth.openAuthURL();
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('adventures-in-c--extension.healthCheck', () => {
		setup.setupCheck();
	});
	context.subscriptions.push(disposable);


	disposable = vscode.window.registerUriHandler(new URIHandler());
	context.subscriptions.push(disposable);
	setup.setupExtension();
	console.debug("Adventures in C#: Extension Activated");
}

// this method is called when your extension is deactivated
export function deactivate() {}

function runProgram() {
	openSimpleProgram();

	let terminal = vscode.window.terminals.find(t => t.name=== "Adventures in C#");
	if (terminal !== undefined) {
		terminal.dispose();
	}

	let options = { name: "Adventures in C#" };
	terminal = vscode.window.createTerminal(options);
	terminal.show();
	terminal.sendText(`dotnet run --project '${paths.simpleProject.csproj}'`);
}

function openSimpleProgram() {
	if(!fs.existsSync(paths.simpleProject.program)){
		vscode.window.showInformationMessage("No Program Found.");
		return;
	}

	vscode.workspace.openTextDocument(paths.simpleProject.program).then(doc => {
		let options = { preview: true };
		vscode.window.showTextDocument(doc, options);
	});
}

export function loadSimpleProgram(programData : string) {
	fs.writeFileSync(paths.simpleProject.program, programData);
	openSimpleProgram();
}

export function loadAndRunSimpleProgram(programData : string) {
	loadSimpleProgram(programData);
	runProgram();
}



function generateProgramURL() : void {
	const editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		vscode.window.showErrorMessage("No source code editor selected.");
		return;
	}
	const fileUri = vscode.Uri.parse(editor.document.fileName);
	const condition = fileUri.path.endsWith("Program.cs") || fileUri.fragment.endsWith("Program.cs");
	if (!condition) {
		vscode.window.showErrorMessage("Generating program URLs only works for Program.cs files.");
		console.error(`Failed to generate program URL. URI was: ${fileUri.path}`);
		return;
	}
	const base64Program = Base64.encode(editor.document.getText());
	const uri = `https://us-central1-introtocsharp-a5eeb.cloudfunctions.net/createLoadProgramURL`;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const config = { headers: {"Content-Type": "text/plain"} };
	axios.default.post(uri, base64Program, config).then(response => {
		const options = { title: "Share URL", value: response.data.result };
		vscode.window.showInputBox(options).then(result => {
			if (result) {
				vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(result as string));
			}
		});
	})
	.catch(error => {
		vscode.window.showErrorMessage(`Could not generate URL: ${error}`);
	});
}