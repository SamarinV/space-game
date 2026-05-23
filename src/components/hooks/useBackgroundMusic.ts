import { useEffect, useRef } from 'react'
import bgMusicFile from '../../assets/sounds/space.mp3'

export const useBackgroundMusic = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null)

	useEffect(() => {
		const audio = new Audio(bgMusicFile)

		audio.loop = true
		audio.volume = 0.2
		audio.preload = 'auto'

		audioRef.current = audio

		const startMusic = async () => {
			try {
				await audio.load()
				await audio.play()

				window.removeEventListener('touchstart', startMusic)
				window.removeEventListener('pointerdown', startMusic)
				window.removeEventListener('click', startMusic)
			} catch (e) {
				console.log('music blocked', e)
			}
		}

		window.addEventListener('touchstart', startMusic, { passive: true })
		window.addEventListener('pointerdown', startMusic)
		window.addEventListener('click', startMusic)

		return () => {
			audio.pause()

			window.removeEventListener('touchstart', startMusic)
			window.removeEventListener('pointerdown', startMusic)
			window.removeEventListener('click', startMusic)
		}
	}, [])
}
