/* eslint-disable react-refresh/only-export-components */
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FC,
	type ReactNode,
} from 'react'
import type { Node } from './types'

export type NodeSubscribeCb = (node: Node) => void
export type CellSubscribeCb = (isVisible: boolean) => void
type UnsubscribeCb = () => void

type GridCellState = {
	isVisible: boolean
	subscriptions: CellSubscribeCb[]
}

export type MapContext = {
	nodeIdToNodeRecord: Record<string, Node>
	subscribeToNode: (nodeId: string, subscriberCb: NodeSubscribeCb, shouldCallInstantly?: boolean) => UnsubscribeCb
	onNodeChange: (node: Node) => void
	subscribeToGridCell: (cellKey: string, subscriberCb: CellSubscribeCb, shouldCallInstantly?: boolean) => UnsubscribeCb
	onZoomChange: (coords: { x1: number; x2: number; y1: number; y2: number }) => void
	getGridCellByCoordinates: (x: number, y: number) => string
}

const Context = createContext<MapContext>({} as MapContext)

export interface CanvasContextProviderProps {
	nodes: Node[]
	children: ReactNode
	gridCellSize?: number // Размер ячейки grid (оптимально ~100-200px)
}

export const CanvasContextProvider: FC<CanvasContextProviderProps> = ({ children, nodes, gridCellSize = 100 }) => {
	const getGridCellByCoordinates = useCallback(
		(x: number, y: number): string => {
			const gridX = Math.floor(x / gridCellSize)
			const gridY = Math.floor(y / gridCellSize)
			return `${gridX} ${gridY}`
		},
		[gridCellSize],
	)

	// NOTE: ВАЖНО добавлять все коллбеки в зависимости там, где они используются!
	const ctx = useMemo<MapContext>(() => {
		// TODO: попробовать перенести это состояние в другой провайдер
		const nodeIdToNodeRecord: Record<string, Node> = {}
		const nodeIdToSubscriptionsRecord: Record<string, NodeSubscribeCb[]> = {}

		const cellToStateRecord: Record<string, GridCellState> = {}

		// Инициализируем ноды и добавляем их в grid
		for (const node of nodes) {
			nodeIdToNodeRecord[node.id] = node
			nodeIdToSubscriptionsRecord[node.id] = []

			const cellKey = getGridCellByCoordinates(node.x, node.y)
			cellToStateRecord[cellKey] = { isVisible: false, subscriptions: [] }
		}

		return {
			nodeIdToNodeRecord,
			getGridCellByCoordinates,
			subscribeToNode: (nodeId, subscriberCb, shouldCallInstantly = true) => {
				nodeIdToSubscriptionsRecord[nodeId].push(subscriberCb)

				const node = nodeIdToNodeRecord[nodeId]
				if (shouldCallInstantly) {
					subscriberCb(node)
				}

				return () => {
					const subs = nodeIdToSubscriptionsRecord[nodeId]
					const index = subs.indexOf(subscriberCb)
					if (index > -1) {
						subs.splice(index, 1)
					}
				}
			},
			subscribeToGridCell: (cellKey, subscriberCb, shouldCallInstantly = true) => {
				if (!cellToStateRecord[cellKey]) {
					cellToStateRecord[cellKey] = { isVisible: true, subscriptions: [] }
				}
				const state = cellToStateRecord[cellKey]
				state.subscriptions.push(subscriberCb)
				if (shouldCallInstantly) {
					subscriberCb(state.isVisible)
				}

				return () => {
					if (state.subscriptions.length === 1) {
						delete cellToStateRecord[cellKey]
						return
					}
					const index = state.subscriptions.indexOf(subscriberCb)
					if (index !== -1) {
						state.subscriptions.splice(index, 1)
					}
				}
			},
			onNodeChange: (node) => {
				nodeIdToNodeRecord[node.id] = node
				nodeIdToSubscriptionsRecord[node.id]?.forEach((subscription) => {
					subscription(node)
				})
			},
			onZoomChange: ({ x1, x2, y1, y2 }) => {
				const startGridX = Math.floor(x1 / gridCellSize)
				const startGridY = Math.floor(y1 / gridCellSize)
				const endGridX = Math.floor(x2 / gridCellSize)
				const endGridY = Math.floor(y2 / gridCellSize)

				const visibleCellsThisFrame = new Set<string>()

				for (let gridX = startGridX; gridX <= endGridX; gridX++) {
					for (let gridY = startGridY; gridY <= endGridY; gridY++) {
						const cellKey = `${gridX} ${gridY}`
						visibleCellsThisFrame.add(cellKey)
					}
				}

				for (const cellKey in cellToStateRecord) {
					const state = cellToStateRecord[cellKey]
					const isVisible = visibleCellsThisFrame.has(cellKey)
					if (state.isVisible !== isVisible) {
						state.isVisible = isVisible
						state.subscriptions.forEach((sub) => sub(isVisible))
					}
				}
			},
		}
	}, [nodes, gridCellSize, getGridCellByCoordinates])

	return <Context.Provider value={ctx}>{children}</Context.Provider>
}

export const useMapContext = () => useContext(Context)

export const useSubscriptionToNode = (nodeId: string, subscriberCb: NodeSubscribeCb) => {
	const { subscribeToNode } = useMapContext()

	const cbRef = useRef(subscriberCb)
	// Всегда актуальный callback, не включенный в зависимости
	cbRef.current = subscriberCb

	useEffect(() => {
		const stableCb = (node: Node) => cbRef.current(node)
		const unsubscribe = subscribeToNode(nodeId, stableCb)
		return () => {
			unsubscribe()
		}
	}, [nodeId, subscribeToNode])
}

export const useSubscriptionToCellVisibility = (_node: Node) => {
	const [isVisible, setVisible] = useState(false)
	const instantNodeRef = useRef(_node)

	const { getGridCellByCoordinates, subscribeToGridCell } = useMapContext()

	const [patchableCell, setPatchableCell] = useState(getGridCellByCoordinates(_node.x, _node.y))
	useEffect(() => {
		setPatchableCell(getGridCellByCoordinates(_node.x, _node.y))
	}, [_node, getGridCellByCoordinates])

	useSubscriptionToNode(_node.id, (updatedNode) => {
		instantNodeRef.current = updatedNode
		setPatchableCell(getGridCellByCoordinates(updatedNode.x, updatedNode.y))
	})

	useEffect(() => {
		const unsubscribe = subscribeToGridCell(patchableCell, setVisible)
		return () => {
			unsubscribe()
		}
	}, [patchableCell, subscribeToGridCell])

	return { isVisible, instantNodeRef }
}
