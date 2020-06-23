import * as hs from '@shared'
import * as React from 'react'
import { classes } from './utils'

export function SearchItem(props: { selected: boolean, func: hs.Func, onSelected: (func: hs.Func) => void }): JSX.Element | null {
	return <div className={classes("SearchItem", { 'selected': props.selected })} key={props.func.id} onMouseDown={() => props.onSelected(props.func)}>{props.func.name}</div>
}
