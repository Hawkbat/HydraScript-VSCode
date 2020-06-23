import type * as hs from '@shared'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './App'

declare global {
	interface VsCodeApi {
		postMessage(msg: hs.Command): void
		setState(newState: hs.Script): hs.Script
		getState(): hs.Script | undefined
	}

	function acquireVsCodeApi(): VsCodeApi
}

function onload(): void {
	const vscode = acquireVsCodeApi()

	ReactDOM.render(<App vscode={vscode} />, document.querySelector('main'))

	vscode.postMessage({ type: 'library-fetch' })
	vscode.postMessage({ type: 'script-fetch' })
}

if (document.readyState === 'complete') {
	onload()
} else {
	window.addEventListener('load', onload)
}
