import { useCallback, useEffect, useState, type FC } from 'react'
import type { Node as NodeT } from './types'
import Konva from 'konva'
import { Rect, type KonvaNodeEvents, Text, Group } from 'react-konva'
import { useMapContext, useSubscriptionToCellVisibility } from './Provider'
import { useThrottledCallback } from '../common/hooks'

export interface NodeViewProps {
	node: NodeT
}

export const NodeView: FC<NodeViewProps> = ({ node: lazyNode, ...props }) => {
	const { isVisible } = useSubscriptionToCellVisibility(lazyNode)
	const [node, setNode] = useState(lazyNode)
	useEffect(() => setNode(lazyNode), [lazyNode])

	return isVisible ? <Content onDragEnd={setNode} node={node} {...props} /> : null
}

function Content({ node, onDragEnd }: NodeViewProps & { onDragEnd: (node: NodeT) => void }) {
	const [color, setColor] = useState('green')
	const { onNodeChange } = useMapContext()

	const handleClick = () => {
		setColor(Konva.Util.getRandomColor())
	}

	const handleDragMove = useCallback<NonNullable<KonvaNodeEvents['onDragMove']>>(
		(e) => {
			const { x, y } = e.target.attrs
			onNodeChange({ ...node, x, y })
		},
		[onNodeChange],
	)
	const throttledHandleDragMove = useThrottledCallback(handleDragMove, 70)


	return (
		<Group
			draggable
			x={node.x}
			y={node.y}
			onClick={handleClick}
			onDragMove={throttledHandleDragMove}
			onDragEnd={(e) => {
				const { x, y } = e.target.attrs
				onDragEnd({ ...node, x, y })
			}}
		>
			<Rect fill={color} width={50} height={50} />
			<Text text={node.name} width={50} />
		</Group>
	)
}
