import { useEffect, useState } from 'react'
import type { BulletType } from '../../game/game'
import { playSound } from '../sound/soundManager'

export const useBullets = () => {
	const [bullets, setBullets] = useState<BulletType[]>([])

	// 🚀 выстрел
	const shoot = (x: number, y: number) => {
		playSound('bullet')
		setBullets((prev) => [
			...prev,
			{
				id: Date.now(),
				x,
				y,
			},
		])
	}

	// 🔄 движение пуль
	useEffect(() => {
		const interval = setInterval(() => {
			setBullets((prev) =>
				prev
					.map((bullet) => ({
						...bullet,
						y: bullet.y - 10,
					}))
					.filter((bullet) => bullet.y > -50),
			)
		}, 16)

		return () => clearInterval(interval)
	}, [])

	return {
		bullets,
		setBullets,
		shoot,
	}
}
