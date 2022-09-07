import { paths } from "./paths";
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as config from "./config";
import * as axios from "axios";

interface TokenManager {
    refreshToken: string;
    accessToken: string;
    expirationTime: number;
    userId: string;
}

/**
 * Opens the Authentication URL in an external web browser.
 */
export function openAuthURL() {
    vscode.env.openExternal(vscode.Uri.parse(config.captainCoderConfig.authURL));
}

/**
 * Given an TokenManager, attempts to import the token.
 * @param authInfo 
 */
export function importToken(token: string): void {
    refreshToken(token);
    vscode.window.showInformationMessage("Adventures in C#: Authentication Successful!");
}

/**
 * Attempts to refresh the authentication Token.
 * @returns 
 */
export function refreshToken(token: string | undefined) {
    token = token ?? getToken()?.refreshToken;
    if (token === undefined) {
        vscode.window.showErrorMessage("Cannot authenticate Adventures in C#.");
        return;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const body = { grant_type: "refresh_token", refresh_token: token };
    const params = { key: config.firebaseConfig.webApiKey };
    const options = { params: params, body: body };
    axios.default.post(config.captainCoderConfig.tokenURL, body, options).then(result => {
        const body = result.data;
        const token: TokenManager = { 
            refreshToken: body.refresh_token, 
            accessToken: body.access_token,
            expirationTime: new Date().getTime() + Number(body.expires_in)*1000,
            userId: body.user_id
        };
        saveToken(token);
    }).catch(error => {
        vscode.window.showErrorMessage("Could not authenticate Adventures in C#.");
        console.error("Could not authenticate Adventures in C#:");
        console.error(error);
    });

}

/**
 * Saves the specified TokenManager
 * @param authInfo 
 */
function saveToken(authInfo : TokenManager): void {
    if (!fs.existsSync(paths.auth.path)) {
        fs.mkdirSync(paths.auth.path);
    }
    const data = JSON.stringify(authInfo);
    fs.writeFileSync(paths.auth.token, data);
}

/**
 * 
 * @returns The TokenManager if it exists otherwise undefined.
 */
export function getToken(): TokenManager | undefined {
    if (!fs.existsSync(paths.auth.token)) {
        return undefined;
    }
    const token = JSON.parse(fs.readFileSync(paths.auth.token).toString());
    return token;
}
