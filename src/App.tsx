import { ToastContainer } from 'react-toastify'
import './App.css'
import Game from './game/game'

function App() {
	return (
		<>
			<ToastContainer
				position="top-left"
				autoClose={1000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnHover
				draggable
				theme="dark"
			/>
			<Game />
		</>
	)
}

export default App
