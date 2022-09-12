import * as vscode from 'vscode';
import { sep } from 'path';

function getExtensionPath() : string {
	return vscode.extensions.getExtension("captain-coder.adventures-in-c--extension")!.extensionPath;
}

function getSimpleProjectPath() : string {
	return getExtensionPath() + `${sep}SimpleProject`;
}

function getAuthPath() : string {
    return getExtensionPath() + sep + ".auth";
}

export const paths = {
    extensionPath: getExtensionPath(),
    simpleProject: {
        path: getSimpleProjectPath(),
        dirName: "SimpleProject",
        csproj: getSimpleProjectPath() + sep + "SimpleProject.csproj",
        program: getSimpleProjectPath() + sep + "Program.cs",
    },
    auth: {
        path: getAuthPath(),
        token: getAuthPath() + sep + "token.json",
    }
};