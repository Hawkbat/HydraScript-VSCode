import * as v from 'vscode'
import { Script, Command, Library } from '../../shared/out'

export function generateGUID(): string {
	let guid = ''
	const possible = '0123456789abcdef'
	for (let i = 0; i < 16; i++) {
		guid += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return guid
}

export function getInitialScript(): Script {
	return { id: generateGUID(), blocks: [], links: [] }
}

export function parseScript(uri: v.Uri, text: string): Script | null {
	if (text.trim().length === 0) {
		return null
	} else {
		try {
			return JSON.parse(text)
		} catch {
			v.window.showErrorMessage('Contents of ' + uri.path + ' is not valid json.')
			return null
		}
	}
}

export function parseLibrary(uri: v.Uri, text: string): Library | null {
	if (text.trim().length === 0) {
		return null
	} else {
		try {
			return JSON.parse(text)
		} catch {
			v.window.showErrorMessage('Contents of ' + uri.path + ' is not valid json.')
			return null
		}
	}
}

export function applyToScript(state: Script, cmd: Command): Script {
	switch (cmd.type) {
		case "block-add": {
			for (const block of cmd.blocks) {
				if (!block.id || state.blocks.some(b => b.id === block.id)) {
					block.id = generateGUID()
				}
				state.blocks.push(block)
			}
		} break
		case "block-remove": {
			state.links = state.links.filter(l => !cmd.ids.includes(l.in.block) && !cmd.ids.includes(l.out.block))
			state.blocks = state.blocks.filter(b => !cmd.ids.includes(b.id))
		} break
		case "block-move": {
			for (const move of cmd.moves) {
				const block = state.blocks.find(b => b.id === move.id)
				if (block) {
					block.x = move.x
					block.y = move.y
				}
			}
		} break
		case "link-add": {
			for (const link of cmd.links) {
				if (!link.id || state.links.some(l => l.id === link.id)) {
					link.id = generateGUID()
				}
				state.links.push(link)
			}
		} break
		case "link-remove": {
			state.links = state.links.filter(l => !cmd.ids.includes(l.id))
		} break
		default: {
			throw new Error('Host does not implement this command: ' + JSON.stringify(cmd))
		}
	}
	return state
}
