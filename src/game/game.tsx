import { useEffect, useState } from 'react'

import HUD from '../components/HUD/HUD'
import Stars from '../components/stars/stars'
import Spaceship from '../components/spaceShip/spaceShip'
import Enemy from '../components/enemy/enemy'

type EnemyType = {
	id: number
	x: number
	y: number
}

const Game = () => {
	const [enemy, setEnemy] = useState<EnemyType | null>(null)
	const [lives, setLives] = useState(100)
	const [shield, setShield] = useState(100)
	const [isActiveShield, setIsActiveShield] = useState(true)
	const [shipHit, setShipHit] = useState(false)
	const [score, setScore] = useState(0)
	const [withEnemy, setWithEnemy] = useState(true)

	// 🚀 SPAWN (только если врага нет)
	useEffect(() => {
		console.log('withEnemy', withEnemy)
		const interval = setInterval(() => {
			if (withEnemy) {
				setEnemy((prev) => {
					if (prev) return prev

					return {
						id: Date.now(),
						x: 400 + Math.random() * (window.innerWidth - 400 * 2),
						y: -80,
					}
				})
			}
		}, 2000)

		return () => clearInterval(interval)
	}, [withEnemy])

	// 🚀 GAME LOOP (движение + коллизия)
	useEffect(() => {
		const interval = setInterval(() => {
			setEnemy((prev) => {
				if (!prev) return null

				const shipX = window.innerWidth / 2
				const shipY = window.innerHeight - 150

				// направление к кораблю
				const dx = shipX - prev.x
				const dy = shipY - prev.y

				const length = Math.sqrt(dx * dx + dy * dy)
				const speed = 2.5

				const updated = {
					...prev,
					x: prev.x + (dx / length) * speed,
					y: prev.y + (dy / length) * speed,
				}

				// 💥 расстояние до корабля
				const distance = Math.sqrt((updated.x - shipX) ** 2 + (updated.y - shipY) ** 2)

				let hit = false

				// 💥 попадание
				if (distance < 80) {
					hit = true
				}

				// 💥 враг ушёл вниз или попал
				if (updated.y > window.innerHeight - 500 || hit) {
					setShipHit(true)

					setTimeout(() => {
						setShipHit(false)
					}, 300)

					const damage = 5

					setShield((currentShield) => {
						if (currentShield >= damage) {
							return currentShield - damage
						}

						setIsActiveShield(false)

						const remainingDamage = damage - currentShield

						setLives((l) => Math.max(0, l - remainingDamage))

						return 0
					})

					// 💥 убираем врага → новый появится сам
					return null
				}

				return updated
			})
		}, 16)

		return () => clearInterval(interval)
	}, [])

	const removeEnemy = () => {
		setEnemy(null)
	}

	const handleEnemyClick = () => {
		setScore((s) => s + 10)
		removeEnemy()
	}

	const playPauseEnemy = () => {
		if (withEnemy) {
			setWithEnemy((prev) => !prev)
			setEnemy(null)
		} else {
			setWithEnemy((prev) => !prev)
		}
	}

	return (
		<>
			<Stars />

			<HUD lives={lives} shield={shield} score={score} playPauseEnemy={playPauseEnemy} withEnemy={withEnemy} />

			<Spaceship isActiveShield={isActiveShield} shipHit={shipHit} />

			{enemy && <Enemy id={enemy.id} x={enemy.x} y={enemy.y} onClick={handleEnemyClick} />}
		</>
	)
}

export default Game
