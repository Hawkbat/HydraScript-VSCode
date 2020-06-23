import * as hs from '@shared'
import * as React from 'react'
import { Param } from './Param'
import { classes } from './utils'

export function ParamGroup(props: { block: hs.Block, group: hs.ParamGroup, output: boolean }): JSX.Element | null {
	return <div className={classes("ParamGroup", { output: props.output, input: !props.output })}>
		{props.group.name ? <label>{props.group.name}</label> : <></>}
		{props.group.params.map(p => <Param key={p.id} block={props.block} group={props.group} param={p} output={props.output} />)}
	</div>
}
