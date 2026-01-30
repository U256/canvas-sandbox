import type { Link, Node } from './types'

export const SCALE_STEP = 1.2
export const MIN_SCALE = 0.5
export const MAX_SCALE = 3

export const dataMock: { nodes: Node[]; links: Link[] } = {
	nodes: [
		{ x: 0, y: 0, id: '1', name: 'first' },
		{ x: -80, y: -160, id: '2', name: 'second' },
		{ x: 20, y: 118, id: '3', name: 'long named node' },
		{ x: 55, y: 200, id: '4', name: 'long named node2', description: 'with description' },
		{ x: 120, y: 300, id: '5', name: 'side node', description: 'with description' },
		{ x: 450, y: 500, id: '6', name: '6', description: 'with description' },
		{ x: 490, y: 560, id: '7', name: '7', description: 'with description' },
		{ x: 530, y: 510, id: '8', name: '8', description: 'with description' },
	],
	links: [
		{ id: '1', source: '1', target: '2' },
		{ id: '2', source: '1', target: '3' },
		{ id: '3', source: '2', target: '3' },
		{ id: '4', source: '4', target: '5' },
		{ id: '5', source: '6', target: '7' },
		{ id: '6', source: '8', target: '7' },
		{ id: '7', source: '7', target: '1' },
	],
}
