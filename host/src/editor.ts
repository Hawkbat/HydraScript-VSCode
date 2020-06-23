import * as path from 'path'
import * as v from 'vscode'
import { Command, Library, Script } from '../../shared/out'
import { applyToScript, parseScript, getInitialScript, parseLibrary } from './store'

export class HydraScriptEditorProvider implements v.CustomTextEditorProvider {

	private cachedLibraries: Library[] = []

	constructor(private readonly context: v.ExtensionContext) {
		context.subscriptions.push(v.window.registerCustomEditorProvider('hydraScript.nodeView', this))
		this.initializeLibraries()
	}

	public async resolveCustomTextEditor(document: v.TextDocument, webviewPanel: v.WebviewPanel,
	): Promise<void> {
		const webview = webviewPanel.webview

		webview.options = {
			enableScripts: true,
		}

		const getUri = (folder: string, filename: string): v.Uri => webview.asWebviewUri(v.Uri.file(path.join(this.context.extensionPath, 'client', folder, filename)))

		let nonce = ''
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		for (let i = 0; i < 32; i++) {
			nonce += possible.charAt(Math.floor(Math.random() * possible.length))
		}

		webview.html = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${getUri('static', 'view.css')}" rel="stylesheet" />
				<title>HydraScript Editor</title>
				<script nonce="${nonce}" src="${getUri('static', 'require.js')}"></script>
				<script nonce="${nonce}" src="${getUri('static', 'react.development.js')}"></script>
				<script nonce="${nonce}" src="${getUri('static', 'react-dom.development.js')}"></script>
				<script nonce="${nonce}" src="${getUri('out', 'view.js')}"></script>
				<script nonce="${nonce}">require(['view'], view => { })</script>
			</head>
			<body>
				<main></main>
			</body>
			</html>`

		function getScript(): Script {
			return parseScript(document.uri, document.getText()) ?? getInitialScript()
		}

		function dispatch(cmd: Command): void {
			webview.postMessage(cmd)
		}

		const changeDocumentSubscription = v.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				dispatch({ type: 'script-load', script: getScript() })
			}
		})

		webviewPanel.onDidDispose(() => { changeDocumentSubscription.dispose() })

		webview.onDidReceiveMessage((cmd: Command) => {
			switch (cmd.type) {
				case 'script-fetch': {
					dispatch({ type: 'script-load', script: getScript() })
				} break
				case 'library-fetch': {
					dispatch({ type: 'library-load', libraries: this.cachedLibraries })
				} break
				case 'request-copy': {
					v.env.clipboard.writeText(JSON.stringify({ '$app-key': 'hydra-script', data: cmd.data }))
				} break
				case 'request-paste': {
					v.env.clipboard.readText().then(text => {
						try {
							const obj = JSON.parse(text)
							if (typeof obj === 'object' && obj['$app-key'] && obj['$app-key'] === 'hydra-script' && obj.data) {
								dispatch({ type: 'perform-paste', data: obj.data })
								return
							}
						} catch (e) {
							v.window.showWarningMessage('Could not paste clipboard data due to unexpected format')
						}
					})
				} break
				default: {
					let script = getScript()
					script = applyToScript(script, cmd)
					const json = JSON.stringify(script, null, 2)
					if (json !== document.getText()) {
						const edit = new v.WorkspaceEdit()
						edit.replace(document.uri, new v.Range(0, 0, document.lineCount, 0), json)
						v.workspace.applyEdit(edit)
					}
				}
			}
		})
	}

	private async initializeLibraries(): Promise<void> {
		const pattern = '**/*.hydra-lib.json'
		const fileURIs = await v.workspace.findFiles(pattern)

		await Promise.all(fileURIs.map(uri => this.addLibrary(uri)))

		const watcher = v.workspace.createFileSystemWatcher(pattern)
		this.context.subscriptions.push(watcher.onDidCreate(uri => this.addLibrary(uri)))
		this.context.subscriptions.push(watcher.onDidChange(uri => this.addLibrary(uri)))
		this.context.subscriptions.push(watcher.onDidDelete(uri => this.removeLibrary(uri)))
		this.context.subscriptions.push(watcher)
	}

	private async addLibrary(uri: v.Uri): Promise<void> {
		const lib = parseLibrary(uri, (await v.workspace.openTextDocument(uri)).getText())
		if (lib) {
			this.removeLibrary(uri)
			lib.id = uri.toString()
			this.cachedLibraries.push(lib)
		}
	}
	private removeLibrary(uri: v.Uri): void {
		this.cachedLibraries = this.cachedLibraries.filter(l => l.id !== uri.toString())
	}
}
