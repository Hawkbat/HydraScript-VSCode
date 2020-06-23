import * as React from 'react'

export function BoxSelection(props: { visible: boolean, x0: number, y0: number, x1: number, y1: number }): JSX.Element | null {
	if (!props.visible) {
		return null
	}
	return <div className={"BoxSelection"} style={{
		left: Math.min(props.x0, props.x1) + 'px',
		top: Math.min(props.y0, props.y1) + 'px',
		width: Math.abs(props.x1 - props.x0) + 'px',
		height: Math.abs(props.y1 - props.y0) + 'px',
	}}></div>
}
