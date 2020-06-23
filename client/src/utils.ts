import type * as hs from '@shared'
import * as React from 'react'
import { useEffect, useContext, useRef } from 'react'
import { StoreContext } from './context'

export function useGlobalMouse(evt: 'click' | 'dblclick' | 'mousedown' | 'mouseup' | 'mousemove', handler: (e: MouseEvent) => void, deps?: React.DependencyList | undefined): void {
	useEffect(() => {
		window.addEventListener(evt, handler)
		return () => window.removeEventListener(evt, handler)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)
}

export function useGlobalKeyboard(evt: 'keydown' | 'keyup' | 'keypress', handler: (e: KeyboardEvent) => void, deps?: React.DependencyList | undefined): void {
	useEffect(() => {
		window.addEventListener(evt, handler)
		return () => window.removeEventListener(evt, handler)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)
}

export function useRect(id: string): React.MutableRefObject<HTMLDivElement | null> {
	const dispatch = useContext(StoreContext)
	const ref = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (ref && ref.current) {
			const rect = ref.current.getBoundingClientRect()
			const appRoot = ref.current.closest('.App')
			rect.x += appRoot?.scrollLeft ?? 0
			rect.y += appRoot?.scrollTop ?? 0
			dispatch({ type: 'rect-set', id, rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) } })
		}
	})
	return ref
}

export function classes(primary: string, conditionals: { [key: string]: boolean }): string {
	let str = primary
	for (const key in conditionals) {
		if (conditionals[key]) {
			str += ' ' + key
		}
	}
	return str
}

export function clamped<T>(arr: T[], index: number): T {
	return arr[Math.min(arr.length - 1, Math.max(0, index))]
}

export function fuzzyIncludes(a: string, b: string): boolean {
	return a.toLowerCase().includes(b.toLowerCase())
}

export function getFuncFilter(f: hs.Func, filter: string): boolean {
	return filter === '' || fuzzyIncludes(f.id, filter) || fuzzyIncludes(f.name, filter)
}

export function getFuncSort(a: hs.Func, b: hs.Func, filter: string): number {
	if (fuzzyIncludes(a.name, filter) && !fuzzyIncludes(b.name, filter)) {
		return -1
	}
	if (!fuzzyIncludes(a.name, filter) && fuzzyIncludes(b.name, filter)) {
		return 1
	}
	if (fuzzyIncludes(a.id, filter) && !fuzzyIncludes(b.id, filter)) {
		return -1
	}
	if (!fuzzyIncludes(a.id, filter) && fuzzyIncludes(b.id, filter)) {
		return 1
	}
	return a.name.localeCompare(b.name)
}