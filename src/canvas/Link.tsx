/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, type FC } from 'react'
import type { Link } from './types'
import { useMapContext, useSubscriptionToNode } from './Provider'
import { Line } from 'react-konva'

export interface LinkViewProps {
	link: Link
}

export const LinkView: FC<LinkViewProps> = ({ link }) => {
	const { nodeIdToNodeRecord } = useMapContext()

	const lazySource = nodeIdToNodeRecord[link.source]
	const [sourceNode, setSourceNode] = useState(lazySource)
	useEffect(() => setSourceNode(lazySource), [lazySource])
	useSubscriptionToNode(link.source, setSourceNode)

	const lazyTarget = nodeIdToNodeRecord[link.target]
	const [targetNode, setTargetNode] = useState(nodeIdToNodeRecord[link.target])
	useEffect(() => setTargetNode(lazyTarget), [lazyTarget])
	useSubscriptionToNode(link.target, setTargetNode)

	return (
		<>
			<Line
				points={[sourceNode.x, sourceNode.y, targetNode.x, targetNode.y]}
				stroke={link.source === '2' ? 'red' : 'green'}
				strokeWidth={2}
				lineJoin="round"
			/>
		</>
	)
}
