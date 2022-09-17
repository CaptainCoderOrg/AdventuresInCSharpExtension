import * as vscode from "vscode";
import * as axios from "axios";
import { Base64 } from "js-base64";
import LZString = require("lz-string");
import * as run from "./run";
import * as auth from "./auth";

export class URIHandler implements vscode.UriHandler {
	handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
		console.log(`Incoming URI: ${uri.path}`);
		if (uri.path === "/auth") {
            const query = uri.query;
            if (!query.startsWith("token=")) {
                vscode.window.showErrorMessage("Invalid authentication URL.");
                console.error(`Invalid authentication URL: ${uri.path}`);
                return;
            }
            vscode.window.showInformationMessage("Authenticating Adventures in C#...");
            auth.importToken(query.substring(6));
            return;
        }

		if (uri.path === "/load-simple-project") {
            vscode.window.showInformationMessage('Loading Adventures in C# Program...');
			this.loadSimpleProject(uri.query);
            return;
		}

		if (uri.path === "/load-shared-program") {
            vscode.window.showInformationMessage('Loading Shared C# Program...');
			this.loadSharedProject(uri.query);
            return;
		}
	}

	private loadSharedProject(query : string) {
		if(!query.startsWith("id=")) {
			vscode.window.showErrorMessage("Unable to load program, id missing.");
			return;
		}
		const url = "https://us-central1-introtocsharp-a5eeb.cloudfunctions.net/getLoadProgramURL";
		axios.default.get(url, {params: {id: query.substring(3), decompress: "false"}}).then(response => {
			if (response.data.result.format === "base64") {
				run.loadSimpleProgram(Base64.decode(response.data.result.code));
			} else if (response.data.result.format === "lz-string-base64") {
				console.info("Decompressing...");
				run.loadSimpleProgram(Base64.decode(LZString.decompressFromBase64(response.data.result.code) as string));
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
		run.loadAndRunSimpleProgram(programData);
	}
}