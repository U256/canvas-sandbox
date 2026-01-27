import { useCallback, useRef, useState, type FC } from 'react'
import type { Node as NodeT } from './types'
import Konva from 'konva'
import { Rect, type KonvaNodeEvents, Text, Group } from 'react-konva'
import { useMapContext, useSubscriptionToCellVisibility } from './Provider'
import { useThrottledCallback } from '../common/hooks'

export interface NodeViewProps {
	node: NodeT
}

export const NodeView: FC<NodeViewProps> = ({ node, ...props }) => {
	const isVisible = useSubscriptionToCellVisibility(node)
	if (node.id === '1') {
		console.log(isVisible)
	}
	return isVisible ? <Content node={node} {...props} /> : null
}

function Content({ node }: NodeViewProps) {
	const [color, setColor] = useState('green')
	const { onNodeChange } = useMapContext()

	const handleClick = () => {
		setColor(Konva.Util.getRandomColor())
	}

	const nodeRef = useRef(node)
	nodeRef.current = node

	const handleDragMove = useCallback<NonNullable<KonvaNodeEvents['onDragMove']>>(
		(e) => {
			const { x, y } = e.target.attrs
			onNodeChange({ ...nodeRef.current, x, y })
		},
		[onNodeChange],
	)
	const throttledHandleDragMove = useThrottledCallback(handleDragMove, 70)

	return (
		<Group x={node.x} y={node.y} onClick={handleClick} onDragMove={throttledHandleDragMove}>
			<Rect draggable fill={color} width={50} height={50} />
			<Text text={node.name} width={50} />
		</Group>
	)
}
