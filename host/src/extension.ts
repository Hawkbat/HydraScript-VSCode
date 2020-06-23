import * as vscode from 'vscode'
import { HydraScriptEditorProvider } from './editor'

export function activate(context: vscode.ExtensionContext): void {
	new HydraScriptEditorProvider(context)
}
