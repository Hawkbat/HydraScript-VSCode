import * as hs from '@shared'
import * as React from 'react'
import { useContext } from 'react'
import { LibraryContext, ScriptContext } from './context'

export function Link(props: { link: hs.Link, inX: number, inY: number, outX: number, outY: number }): JSX.Element | null {
	const script = useContext(ScriptContext)
	const libraries = useContext(LibraryContext)

	const inBlock = script.blocks.find(b => b.id === props.link.in.block)
	const inFunc = libraries.flatMap(l => l.funcs).find(f => f.id === inBlock?.func)
	const inGroup = inFunc?.outputs.find(g => g.id === props.link.in.group)
	const inParam = inGroup?.params.find(p => p.id === props.link.in.param)
	const inType = libraries.flatMap(l => l.types).find(f => f.id === inParam?.type)
	const outBlock = script.blocks.find(b => b.id === props.link.out.block)
	const outFunc = libraries.flatMap(l => l.funcs).find(f => f.id === outBlock?.func)
	const outGroup = outFunc?.inputs.find(g => g.id === props.link.out.group)
	const outParam = outGroup?.params.find(p => p.id === props.link.out.param)
	const outType = libraries.flatMap(l => l.types).find(f => f.id === outParam?.type)

	const color = inType?.color ?? outType?.color ?? 'var(--vscode-textLink-foreground)'

	const lineWidth = 3

	let vIn = { x: props.inX, y: props.inY }
	let vOut = { x: props.outX, y: props.outY }
	const vDiff = { x: vOut.x - vIn.x, y: vOut.y - vIn.y }
	const dist = Math.sqrt(vDiff.x * vDiff.x + vDiff.y * vDiff.y)
	const vDir = { x: vDiff.x / dist, y: vDiff.y / dist }
	const radius = 7
	vIn = { x: vIn.x + vDir.x * radius, y: vIn.y + vDir.y * radius }
	vOut = { x: vOut.x - vDir.x * radius, y: vOut.y - vDir.y * radius }

	const minX = Math.min(vIn.x, vOut.x) - lineWidth
	const minY = Math.min(vIn.y, vOut.y) - lineWidth
	const maxX = Math.max(vIn.x, vOut.x) + lineWidth
	const maxY = Math.max(vIn.y, vOut.y) + lineWidth

	return <div className="Link" data-link={props.link.id} style={{
		left: minX + 'px',
		top: minY + 'px',
	}}>
		<svg width={maxX - minX} height={maxY - minY}>
			<line x1={vIn.x - minX} y1={vIn.y - minY} x2={vOut.x - minX} y2={vOut.y - minY} style={{ stroke: color, strokeWidth: lineWidth, strokeLinecap: 'round' }}></line>
		</svg>
	</div>
}
