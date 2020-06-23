import * as hs from '@shared'
import * as React from 'react'
import { Pin } from './Pin'
import { classes } from './utils'

export function Param(props: { block: hs.Block, group: hs.ParamGroup, param: hs.Param, output: boolean }): JSX.Element | null {
	return <div className={classes("Param", { input: !props.output, output: props.output })}>
		<Pin block={props.block} group={props.group} param={props.param} output={props.output} />
		{props.param.name ? <label>{props.param.name}</label> : <></>}
	</div>
}
