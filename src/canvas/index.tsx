import { Fragment, useEffect, useMemo, useRef, useState, type FC } from 'react'
import { Stage, Layer, type KonvaNodeEvents, Line, Text } from 'react-konva'
import { dataMock, MAX_SCALE, MIN_SCALE, SCALE_STEP } from './constants'
import { NodeView } from './Node'
import { LinkView } from './Link'
import { useMapContext } from './Provider'
import type { Zoom } from './types'
import { throttle } from '../common/hooks'
import type Konva from 'konva'

export interface Properties {
	data: typeof dataMock
	initialZoom?: Zoom
}

const baseZoom = { x: 0, y: 0, k: 3 }

const gridValues = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const Canvas: FC<Properties> = ({ data, initialZoom = baseZoom }) => {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [size, setSize] = useState({ width: 1, height: 1 })
	useEffect(() => {
		setSize({
			width: wrapperRef.current?.clientWidth || 1,
			height: wrapperRef.current?.clientHeight || 1,
		})
	}, [])

	const [zoom, setZoom] = useState(initialZoom)
	const zoomRef = useRef(initialZoom)
	zoomRef.current = zoom

	const { onZoomChange } = useMapContext()
	useEffect(() => {
		// set initially
		if (size.width !== 1) {
			const k = zoomRef.current.k
			onZoomChange({
				x1: (zoomRef.current.x) / k,
				x2: (zoomRef.current.x + size.width) / k,
				y1: (zoomRef.current.y) / k,
				y2: (zoomRef.current.y + size.height) / k,
			})
		}
	}, [data, size, onZoomChange])

	const handlers = useMemo<KonvaNodeEvents>(() => {
		const getViewportByEvent = (event: Konva.KonvaEventObject<MouseEvent>) => {
			const { x, y, width, height } = event.currentTarget.attrs
			const k = zoomRef.current.k
			const xPos = x * -1
			const xPosByZoom = xPos / k
			const yPos = y * -1
			const yPosByZoom = yPos / k

			return {
				x1: xPosByZoom,
				x2: xPosByZoom + width / k,
				y1: yPosByZoom,
				y2: yPosByZoom + height / k,
			}
		}
		return {
			onWheel: throttle((event) => {
				event.evt.preventDefault()

				const stage = event.target.getStage()
				if (!stage) {
					return
				}
				setZoom((prev) => {
					const oldScale = prev.k
					const actionX = stage.getPointerPosition()?.x || 0
					const actionY = stage.getPointerPosition()?.y || 0
					const mousePointTo = {
						x: actionX / oldScale - stage.x() / oldScale,
						y: actionY / oldScale - stage.y() / oldScale,
					}
					const isOut = event.evt.deltaY > 0
					const _newScaleNotClamped = isOut ? oldScale / SCALE_STEP : oldScale * SCALE_STEP
					const newScale = Math.max(MIN_SCALE, Math.min(_newScaleNotClamped, MAX_SCALE))

					const newZoom = {
						k: newScale,
						x: -(mousePointTo.x - actionX / newScale) * newScale,
						y: -(mousePointTo.y - actionY / newScale) * newScale,
					}

					zoomRef.current = newZoom // upd here - getViewportByEvent uses zoomRef.current
					onZoomChange(getViewportByEvent(event))
					return newZoom
				})
			}, 50),
			onDragMove: throttle((event) => {
				// Только если перемещаем область видимости
				if (event.currentTarget._id === event.target._id) {
					onZoomChange(getViewportByEvent(event))
				}
			}, 100), // NOTE: большой период троттла, достаточно для отображения нод и не лагает
			// onDragEnd: (e) => {
			// 	const isStageDrag = e.target._id === e.currentTarget._id
			// 	if (isStageDrag) {
			// 		setForceZoom((prev) => ({ ...prev, x: e.target.attrs.x, y: e.target.attrs.y }))
			// 	}
			// },
		}
	}, [onZoomChange])

	return (
		<div ref={wrapperRef} className="canvas-wrapper">
			<Stage draggable {...handlers} {...size} x={zoom.x} y={zoom.y} scaleX={zoom.k} scaleY={zoom.k}>
				<Layer>
					{gridValues.map((xLine) => (
						<Fragment key={xLine}>
							<Line stroke="rgba(0,0,0, 0.07)" points={[0, -10000, 0, 10000]} x={xLine * 100} y={0} />

							{gridValues.map((yLine) => (
								<Text
									fill={xLine === 0 && yLine === 0 ? 'blue' : 'rgba(0,0,0, 0.4)'}
									fontSize={xLine === 0 && yLine === 0 ? 16 : 11}
									x={xLine * 100 + 40}
									y={yLine * 100 + 40}
									text={`x${xLine} y${yLine}`}
								/>
							))}
						</Fragment>
					))}
					{gridValues.map((yLine) => (
						<Line key={yLine} stroke="rgba(0,0,0, 0.07)" points={[-10000, 0, 10000, 0]} x={0} y={yLine * 100} />
					))}
				</Layer>
				<Layer>
					{data.nodes.map((node) => (
						<NodeView key={node.id} node={node} />
					))}

					{data.links.map((link) => (
						<LinkView key={link.id} link={link} />
					))}
				</Layer>
			</Stage>

			<div className="actions">
				<button type="button" onClick={() => setZoom(initialZoom)}>
					reset
				</button>
				<button type="button" onClick={() => setZoom((prev) => ({ ...prev, k: prev.k * SCALE_STEP }))}>
					+
				</button>
				<button type="button" onClick={() => setZoom((prev) => ({ ...prev, k: prev.k / SCALE_STEP }))}>
					-
				</button>
			</div>
		</div>
	)
}
