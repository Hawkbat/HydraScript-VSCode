
export interface Library {
	id: string
	funcs: Func[]
	types: Type[]
}

export interface Type {
	id: string
	name: string
	input?: InputOptions
	color?: string
}

export interface Func {
	id: string
	name: string
	inputs: ParamGroup[]
	outputs: ParamGroup[]
}

export interface NumberInputOptions {
	type: 'number'
	min?: number
	max?: number
	step?: number
}

export interface BooleanInputOptions {
	type: 'boolean'
}

export interface StringInputOptions {
	type: 'string'
	pattern?: string
	patternDesc?: string
}

export interface EnumInputOptions {
	type: 'enum'
	options: string[]
}

export type InputOptions =
	| NumberInputOptions
	| BooleanInputOptions
	| StringInputOptions
	| EnumInputOptions

export interface ParamGroup {
	id: string
	name: string
	params: Param[]
}

export interface Param {
	id: string
	name: string
	type: string
}
