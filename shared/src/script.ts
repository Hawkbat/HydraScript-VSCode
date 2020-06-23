
export interface Script {
	id: string
	blocks: Block[]
	links: Link[]
}

export interface Block {
	id: string
	func: string
	values: string[]
	x: number
	y: number
}

export interface Link {
	id: string
	in: LinkSide
	out: LinkSide
}

export interface LinkSide {
	block: string
	group: string
	param: string
}
