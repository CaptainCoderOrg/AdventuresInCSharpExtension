import * as vscode from 'vscode';
import { paths } from "./paths";
import * as fs from 'fs';

export function runProgram() {
	openSimpleProgram();

	let terminal = vscode.window.terminals.find(t => t.name=== "Adventures in C#");
	if (terminal !== undefined) {
		terminal.dispose();
	}

	fs.copyFileSync(paths.simpleProject.csprojTemplate, paths.simpleProject.csproj);	
	let options = { name: "Adventures in C#" };
	terminal = vscode.window.createTerminal(options);
	terminal.show();
	terminal.sendText(`dotnet run --project '${paths.simpleProject.csproj}'`);
}

export function openSimpleProgram() {
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