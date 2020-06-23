import * as hs from '@shared'
import * as React from 'react'
import { classes, useRect } from './utils'
import { ParamGroup } from './ParamGroup'
import { LibraryContext } from './context'
import { useContext } from 'react'

export function Block(props: { block: hs.Block, selected: boolean, ghosting: boolean, ghostX: number, ghostY: number }): JSX.Element | null {
	const libraries = useContext(LibraryContext)
	const func = libraries.flatMap(l => l.funcs).find(f => f.id === props.block.func)

	const rectRef = useRect(props.block.id)

	let x = props.block.x
	let y = props.block.y
	if (props.ghosting) {
		x += props.ghostX
		y += props.ghostY
	}

	return <div className={classes("Block", { selected: props.selected, ghosting: props.ghosting })} ref={rectRef} data-id={props.block.id} style={{ left: x + 'px', top: y + 'px' }}>
		<label className={classes('', { error: func === undefined })}>{func?.name ?? props.block.func}</label>
		<div>{func?.inputs.map(g => <ParamGroup key={g.id} block={props.block} group={g} output={false} />)}</div>
		<span />
		<div>{func?.outputs.map(g => <ParamGroup key={g.id} block={props.block} group={g} output={true} />)}</div>
	</div>
}
