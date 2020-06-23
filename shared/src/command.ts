import { Library, Block, Link, Script } from '.'

export interface Rect {
	x: number
	y: number
	w: number
	h: number
}

export interface ClipboardData {
	offset?: { x: number, y: number }
	blocks?: Block[]
	links?: Link[]
}

type CommandBase<T extends string, U extends object> = { type: T } & U
type CommandBlockAdd = CommandBase<'block-add', { blocks: Block[] }>
type CommandBlockRemove = CommandBase<'block-remove', { ids: string[] }>
type CommandBlockMove = CommandBase<'block-move', { moves: { id: string, x: number, y: number }[] }>
type CommandLinkAdd = CommandBase<'link-add', { links: Link[] }>
type CommandLinkRemove = CommandBase<'link-remove', { ids: string[] }>
type CommandScriptLoad = CommandBase<'script-load', { script: Script }>
type CommandScriptFetch = CommandBase<'script-fetch', {}>
type CommandLibraryLoad = CommandBase<'library-load', { libraries: Library[] }>
type CommandLibraryFetch = CommandBase<'library-fetch', {}>
type CommandRequestCopy = CommandBase<'request-copy', { data: ClipboardData }>
type CommandRequestPaste = CommandBase<'request-paste', {}>
type CommandPerformPaste = CommandBase<'perform-paste', { data: ClipboardData }>

type CommandRectSet = CommandBase<'rect-set', { id: string, rect: Rect }>

export type Command =
	| CommandBlockAdd
	| CommandBlockRemove
	| CommandBlockMove
	| CommandLinkAdd
	| CommandLinkRemove
	| CommandScriptLoad
	| CommandScriptFetch
	| CommandLibraryLoad
	| CommandLibraryFetch
	| CommandRectSet
	| CommandRequestCopy
	| CommandRequestPaste
	| CommandPerformPaste
