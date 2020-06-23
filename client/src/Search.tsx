import * as hs from '@shared'
import * as React from 'react'
import { useState, useRef, useEffect, useMemo, useContext } from 'react'
import { getFuncFilter, getFuncSort, useGlobalKeyboard, clamped } from './utils'
import { SearchItem } from './SearchItem'
import { LibraryContext } from './context'

export function Search(props: { x: number, y: number, visible: boolean, onSelected: (func: hs.Func | undefined) => void }): JSX.Element | null {
	const [filter, setFilter] = useState('')
	const [selected, setSelected] = useState('')

	const libraries = useContext(LibraryContext)
	
	const filterRef = useRef<HTMLInputElement>(null)

	const funcs = useMemo(() => libraries.flatMap(lib => lib.funcs).filter(f => getFuncFilter(f, filter)).sort((a, b) => getFuncSort(a, b, filter)), [filter, libraries])

	useEffect(() => {
		if (props.visible) {
			filterRef.current?.focus()
			setFilter('')
		}
	}, [props.visible])

	useGlobalKeyboard('keydown', e => {
		if (props.visible) {
			const currentIndex = funcs.findIndex(func => func.id === selected)
			setSelected(clamped(funcs, currentIndex)?.id ?? '')
			if (e.key === 'ArrowDown') {
				setSelected(clamped(funcs, currentIndex + 1)?.id ?? '')
				e.preventDefault()
			}
			if (e.key === 'ArrowUp') {
				setSelected(clamped(funcs, currentIndex - 1)?.id ?? '')
				e.preventDefault()
			}
			if (e.key === 'Enter') {
				if (selected) {
					props.onSelected(funcs.find(f => f.id === selected))
				} else {
					props.onSelected(undefined)
				}
				e.preventDefault()
			}
			if (e.key === 'Escape') {
				props.onSelected(undefined)
				e.preventDefault()
			}
		}
	}, [props.visible, selected, funcs])

	if (!props.visible) {
		return null
	}

	return <div className="Search" style={{ left: props.x + 'px', top: props.y + 'px' }}>
		<input type="text" ref={filterRef} value={filter} onChange={e => setFilter(e.target.value)} />
		{funcs.map(func => <SearchItem key={func.id} selected={func.id === selected} func={func} onSelected={f => props.onSelected(f)} />)}
	</div>
}
