import * as vscode from 'vscode';
import * as fs from 'fs';
import { Base64 } from 'js-base64';
import * as axios from 'axios';
import { sep } from 'path';
import * as LZString from "lz-string";

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
	const paths = fileUri.path.split(sep);
	const fileName = paths[paths.length-1];
	if (fileName !== "Program.cs") {
		vscode.window.showErrorMessage("Generating program URLs only works for Program.cs files.");
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
		if(!query.startsWith("id=")) {
			vscode.window.showErrorMessage("Unable to load program, id missing.");
			return;
		}
		const url = "https://us-central1-introtocsharp-a5eeb.cloudfunctions.net/getLoadProgramURL";
		console.log(url);
		axios.default.get(url, {params: {id: query.substring(3), decompress: "false"}}).then(response => {
			if (response.data.result.format === "base64") {
				loadSimpleProgram(Base64.decode(response.data.result.code));
			} else if (response.data.result.format === "lz-string-base64") {
				console.log("Decompressing...");
				loadSimpleProgram(Base64.decode(LZString.decompressFromBase64(response.data.result.code) as string));
			} else {
				vscode.window.showErrorMessage(`Unable to load Program.cs. Invalid format: ${response.data.result.format}`);
			}
		}).catch(error => {
			vscode.window.showErrorMessage(`Unable to load Program.cs: ${error}`);
		});
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