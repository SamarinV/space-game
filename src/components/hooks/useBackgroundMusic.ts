import { useEffect, useRef } from 'react'
import bgMusic from '../../assets/sounds/space.mp3'

export const useBackgroundMusic = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null)

	useEffect(() => {
		audioRef.current = new Audio(bgMusic)

		audioRef.current.loop = true
		audioRef.current.volume = 0.2

		const startMusic = () => {
			audioRef.current?.play().catch(() => {})

			window.removeEventListener('click', startMusic)
			window.removeEventListener('touchstart', startMusic)
		}

		window.addEventListener('click', startMusic)
		window.addEventListener('touchstart', startMusic)

		return () => {
			audioRef.current?.pause()

			window.removeEventListener('click', startMusic)
			window.removeEventListener('touchstart', startMusic)
		}
	}, [])
}
