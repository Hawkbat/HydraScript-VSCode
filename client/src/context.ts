import * as hs from '@shared'
import * as React from 'react'

function dispatch(cmd: hs.Command): void {
	console.log(cmd)
}

export const StoreContext = React.createContext<typeof dispatch>(dispatch)
export const ScriptContext = React.createContext<hs.Script>({ id: '', blocks: [], links: [] })
export const LibraryContext = React.createContext<hs.Library[]>([])
