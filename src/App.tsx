import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Canvas } from './canvas'
// import { Zoomable as Canvas } from './components/Zoomable'
import './App.css'
import { CanvasContextProvider } from './canvas/Provider'
import { useEffect, useState } from 'react'
import { dataMock } from './canvas/constants'

function App() {
	const [mock, _setMock] = useState<typeof dataMock>({ nodes: [], links: [] })
	useEffect(() => {
		const id = setTimeout(() => {
			_setMock(dataMock)
		}, 1000)
		return () => {
			clearTimeout(id)
		}
	}, [])

	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
				<h1>Canvas</h1>
			</div>
			<CanvasContextProvider nodes={mock.nodes}>
				<Canvas data={mock} />
			</CanvasContextProvider>
		</>
	)
}

export default App
