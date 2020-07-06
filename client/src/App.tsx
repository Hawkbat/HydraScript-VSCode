import * as hs from '@shared'
import { useGlobalMouse, useGlobalKeyboard } from './utils'
import { StoreContext, LibraryContext, ScriptContext } from './context'
import { useState, useMemo, useEffect, useRef } from 'react'
import * as React from 'react'
import { Block } from './Block'
import { Search } from './Search'
import { Link } from './Link'
import { BoxSelection } from './BoxSelection'

export function App(props: { vscode: VsCodeApi }): JSX.Element {
	const [script, setScript] = useState<hs.Script>(props.vscode.getState() ?? { id: '', blocks: [], links: [] })
	const [libraries, setLibraries] = useState<hs.Library[]>([])
	const [mouseX, setMouseX] = useState(0)
	const [mouseY, setMouseY] = useState(0)
	const [searching, setSearching] = useState(false)
	const [searchX, setSearchX] = useState(0)
	const [searchY, setSearchY] = useState(0)
	const [dragging, setDragging] = useState(false)
	const [dragX, setDragX] = useState(0)
	const [dragY, setDragY] = useState(0)
	const [blockMoving, setBlockMoving] = useState(false)
	const [boxSelecting, setBoxSelecting] = useState(false)
	const [linking, setLinking] = useState(false)
	const [linkPin, setLinkPin] = useState({ block: '', group: '', param: '', output: false })
	const [selected, setSelected] = useState<string[]>([])
	const [rects, setRects] = useState<{ [key: string]: hs.Rect }>({})
	const ref = useRef<HTMLDivElement | null>(null)

	const scrollX = ref.current?.scrollLeft ?? 0
	const scrollY = ref.current?.scrollTop ?? 0

	useEffect(() => {
		props.vscode.setState(script)
	}, [props, script])

	const dispatch = useMemo(() => (cmd: hs.Command): void => {
		switch (cmd.type) {
			case 'rect-set': {
				setRects(rects => (!rects[cmd.id] || rects[cmd.id].x !== cmd.rect.x || rects[cmd.id].y !== cmd.rect.y || rects[cmd.id].w !== cmd.rect.w || rects[cmd.id].h !== cmd.rect.h) ? { ...rects, [cmd.id]: cmd.rect } : rects)
			} break
			default: {
				props.vscode.postMessage(cmd)
			} break
		}
	}, [props])

	useEffect(() => {
		const handler = (e: MessageEvent): void => {
			const cmd = e.data as hs.Command
			switch (cmd.type) {
				case 'script-load': {
					setBlockMoving(false) // this should be on mouseup, but the multi-frame delay introduced by postmessage causes movement to appear jittery, so we clear it here instead
					setScript(cmd.script)
				} break
				case 'library-load': {
					setLibraries(cmd.libraries)
				} break
				case 'perform-paste': {
					if (cmd.data.blocks) {
						dispatch({ type: 'block-add', blocks: cmd.data.blocks })
					}
					if (cmd.data.links) {
						dispatch({ type: 'link-add', links: cmd.data.links })
					}
				} break
				default: {
					throw new Error('Client does not implement this command: ' + JSON.stringify(cmd))
				}
			}
		}
		window.addEventListener('message', handler)
		return () => window.removeEventListener('message', handler)
	})

	useGlobalMouse('mousemove', e => {
		setMouseX(e.clientX + scrollX)
		setMouseY(e.clientY + scrollY)
	}, [scrollX, scrollY])

	useGlobalMouse('mousedown', e => {
		const target = e.target as HTMLElement
		const pin = target.closest('.Pin')
		const block = target.closest('.Block')
		if (searching) {
			setSearching(false)
		} else if (pin) {
			setLinking(true)
			const blockID = pin.getAttribute('data-block') ?? ''
			const groupID = pin.getAttribute('data-group') ?? ''
			const paramID = pin.getAttribute('data-param') ?? ''
			const output = pin.classList.contains('output')
			setLinkPin({ block: blockID, group: groupID, param: paramID, output })
		} else if (block) {
			const id = block.getAttribute('data-id') ?? ''
			if (!e.shiftKey && !e.ctrlKey) {
				if (!selected.includes(id)) {
					setSelected([id])
				}
			} else {
				if (!selected.includes(id)) {
					setSelected([id, ...selected])
				} else {
					setSelected(selected.filter(i => i !== id))
				}
			}
			setBlockMoving(true)
		} else {
			setBoxSelecting(true)
			setSelected([])
		}
		if (!dragging) {
			setDragging(true)
			setDragX(mouseX)
			setDragY(mouseY)
		}
	}, [dragging, searching, selected, mouseX, mouseY])

	useGlobalMouse('mouseup', e => {
		const target = e.target as HTMLElement
		const pin = target.closest('.Pin')
		const link = target.closest('.Link')

		if (!searching) {
			setMouseX(e.clientX + scrollX)
			setMouseY(e.clientY + scrollY)
		}
		if (blockMoving) {
			if (selected.length) {
				dispatch({
					type: 'block-move',
					moves: selected.map(id => {
						const block = script.blocks.find(b => b.id === id)
						return { id, x: Math.round((block?.x ?? 0) + (mouseX - dragX)), y: Math.round((block?.y ?? 0) + (mouseY - dragY)) }
					}),
				})
			}
		}
		if (link) {
			const id = link.getAttribute('data-link') ?? ''
			if (e.button === 2) {
				dispatch({
					type: 'link-remove',
					ids: [id],
				})
			}
		}
		if (linking) {
			setLinking(false)
			if (pin) {
				const blockID = pin.getAttribute('data-block') ?? ''
				const groupID = pin.getAttribute('data-group') ?? ''
				const paramID = pin.getAttribute('data-param') ?? ''
				const output = pin.classList.contains('output')
				if (e.button === 2) {
					if (linkPin.block === blockID && linkPin.group === groupID && linkPin.param === paramID && linkPin.output === output) {
						dispatch({
							type: 'link-remove',
							ids: script.links.filter(l => output ? (l.in.block === blockID && l.in.group === groupID && l.in.param === paramID) : (l.out.block === blockID && l.out.group === groupID && l.out.param === paramID)).map(l => l.id),
						})
					}
				} else if (output !== linkPin.output) {
					dispatch({
						type: 'link-add',
						links: [{
							id: '',
							in: {
								block: output ? blockID : linkPin.block,
								group: output ? groupID : linkPin.group,
								param: output ? paramID : linkPin.param,
							},
							out: {
								block: output ? linkPin.block : blockID,
								group: output ? linkPin.group : groupID,
								param: output ? linkPin.param : paramID,
							},
						}],
					})
				}
			}
		}
		if (boxSelecting) {
			setBoxSelecting(false)
			const minX = Math.min(mouseX, dragX)
			const minY = Math.min(mouseY, dragY)
			const maxX = Math.max(mouseX, dragX)
			const maxY = Math.max(mouseY, dragY)
			setSelected(script.blocks.filter(b => {
				const rect = rects[b.id]
				return rect && minX <= rect.x + rect.w && minY <= rect.y + rect.h && maxX >= rect.x && maxY >= rect.y
			}).map(b => b.id))
		}
		if (dragging) {
			setDragging(false)
		}
	}, [searching, dragging, blockMoving, boxSelecting, linking, linkPin, selected, mouseX, mouseY, dragX, dragY, scrollX, scrollY, dispatch])

	useGlobalMouse('dblclick', e => {
		const target = e.target as HTMLElement
		const block = target.closest('.Block')
		const pin = target.closest('.Pin')
		if (!block && !pin) {
			setSearchX(mouseX)
			setSearchY(mouseY)
			setSearching(true)
		}
	}, [mouseX, mouseY])

	useGlobalKeyboard('keydown', e => {
		if (!searching) {
			if (e.key === ' ') {
				setSearchX(mouseX)
				setSearchY(mouseY)
				setSearching(true)
				e.preventDefault()
			}
			if (selected.length && (e.key === 'Delete' || e.key === 'Backspace')) {
				dispatch({ type: 'block-remove', ids: selected })
				setSelected([])
			}
			if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
				dispatch({
					type: 'request-copy',
					data: {
						offset: { x: mouseX, y: mouseY },
						blocks: script.blocks.filter(b => selected.includes(b.id)),
						links: script.links.filter(l => selected.includes(l.in.block) && selected.includes(l.out.block)),
					},
				})
				if (e.key === 'x') {
					dispatch({ type: 'block-remove', ids: selected })
					setSelected([])
				}
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
				dispatch({ type: 'request-paste' })
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
				setSelected(selected.length === script.blocks.length ? [] : script.blocks.map(b => b.id))
			}
		}
	}, [searching, mouseX, mouseY, selected, dispatch, script])

	const onSearchSelected = useMemo(() => (func: hs.Func | undefined): void => {
		if (func) {
			dispatch({ type: 'block-add', blocks: [{ id: '', func: func.id, x: searchX, y: searchY, values: [] }] })
		}
		setSearching(false)
	}, [dispatch, searchX, searchY])

	let placeholderLink = <></>

	if (linking) {
		const rect = rects[`${linkPin.block}|${linkPin.group}|${linkPin.param}|${linkPin.output}`]
		placeholderLink = rect ? <Link link={{ id: '', in: linkPin.output ? linkPin : { block: '', group: '', param: '' }, out: linkPin.output ? { block: '', group: '', param: '' } : linkPin }} inX={rect.x + rect.w / 2} inY={rect.y + rect.h / 2} outX={mouseX} outY={mouseY} /> : <></>
	}

	return <div className="App" ref={ref}>
		<StoreContext.Provider value={dispatch}>
			<LibraryContext.Provider value={libraries}>
				<ScriptContext.Provider value={script}>
					{script.blocks.map(b => <Block key={b.id} block={b} selected={selected.includes(b.id)} ghosting={selected.includes(b.id) && blockMoving} ghostX={mouseX - dragX} ghostY={mouseY - dragY} />)}
					{script.links.map(l => {
						const inRect = rects[`${l.in.block}|${l.in.group}|${l.in.param}|${true}`]
						const outRect = rects[`${l.out.block}|${l.out.group}|${l.out.param}|${false}`]
						return inRect && outRect ? <Link key={l.id} link={l} inX={inRect.x + inRect.w / 2} inY={inRect.y + inRect.h / 2} outX={outRect.x + outRect.w / 2} outY={outRect.y + outRect.h / 2} /> : <React.Fragment key={l.id} />
					})}
					{placeholderLink}
					<BoxSelection visible={boxSelecting} x0={dragX} y0={dragY} x1={mouseX} y1={mouseY} />
					<Search x={searchX} y={searchY} visible={searching} onSelected={onSearchSelected} />
				</ScriptContext.Provider>
			</LibraryContext.Provider>
		</StoreContext.Provider>
	</div>
}
