import * as hs from '@shared'
import * as React from 'react'
import { useContext } from 'react'
import { LibraryContext } from './context'
import { useRect, classes } from './utils'

export function Pin(props: { block: hs.Block, group: hs.ParamGroup, param: hs.Param, output: boolean }): JSX.Element | null {
	const libraries = useContext(LibraryContext)
	const type = libraries.flatMap(l => l.types).find(t => t.id === props.param.type)
	const color = type?.color ?? 'var(--vscode-textLink-foreground)'

	const rectRef = useRect(`${props.block.id}|${props.group.id}|${props.param.id}|${props.output}`)

	return <div className={classes("Pin", { output: props.output, input: !props.output })} ref={rectRef} style={{ color }} data-block={props.block.id} data-group={props.group.id} data-param={props.param.id}></div>
}
