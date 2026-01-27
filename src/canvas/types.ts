export type Node = {
	id: string
	name: string
	description?: string

	x: number
	y: number
}

export type Link = {
	id: string
	source: string
	target: string
}
export type Zoom = { x: number; y: number; k: number }
