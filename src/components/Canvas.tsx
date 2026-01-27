import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Circle } from 'react-konva'
import Konva from 'konva'

export const ColoredRect = () => {
	const [color, setColor] = useState('green')

	const handleClick = () => {
		setColor(Konva.Util.getRandomColor())
	}

	return (
		<Rect
			x={20}
			y={20}
			width={50}
			height={50}
			draggable
			fill={color}
			onClick={handleClick}
			onDragEnd={(e) => {
				console.log(e)
				setColor(Konva.Util.getRandomColor())
			}}
		/>
	)
}

const MyShape = () => {
	const circleRef = useRef(null)

	useEffect(() => {
		// log Konva.Circle instance
		console.log(circleRef.current)
	}, [])

	return <Circle ref={circleRef} radius={50} fill="black" />
}

export const Canvas = () => {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [size, setSize] = useState({ width: 100, height: 100 })
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setSize({
			width: wrapperRef.current?.clientWidth || 100,
			height: wrapperRef.current?.clientHeight || 100,
		})
	}, [])

	return (
		<div ref={wrapperRef} className="canvas-wrapper">
			<Stage draggable {...size}>
				<Layer>
					<Text x={60} text="Try click on rect" />
					<ColoredRect />
					<MyShape />
				</Layer>
			</Stage>
		</div>
	)
}
