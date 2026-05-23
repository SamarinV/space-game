import { useEffect, useRef } from 'react'
import bgMusic from '../../assets/sounds/space.mp3'

export const useBackgroundMusic = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null)

	useEffect(() => {
		audioRef.current = new Audio(bgMusic)

		audioRef.current.loop = true
		audioRef.current.volume = 0.2

		audioRef.current.play().catch(() => {})

		return () => {
			audioRef.current?.pause()
		}
	}, [])
}
