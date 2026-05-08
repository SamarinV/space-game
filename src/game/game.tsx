import { useEffect, useState } from 'react'

import Enemy from '../components/enemy/enemy'
import HUD from '../components/HUD/HUD'
import Spaceship from '../components/spaceShip/spaceShip'
import Stars from '../components/stars/stars'
import { moveEnemy } from '../components/enemy/moveEnemy'
import { applyDamage } from '../components/enemy/applyDamage'

export type EnemyType = {
	id: number
	x: number
	y: number
}

export type SettingsType = {
	withEnemy: boolean
	withDrones: boolean
	withShield: boolean
	score: number
	shield: number
	lives: number
}

const Game = () => {
	const [enemy, setEnemy] = useState<EnemyType | null>(null)
	const [shipHit, setShipHit] = useState(false)

	//Settings
	//состояние кнопок верхний правый край
	const [settings, setSettings] = useState<SettingsType>({
		withEnemy: false,
		withDrones: false,
		withShield: false,
		score: 0,
		shield: 80,
		lives: 80,
	})

	const shieldIsHolding = settings.withShield && settings.shield > 0

	//восстановление жизней когда есть дроны каждые 2 секунды
	useEffect(() => {
		if (settings.withDrones) {
			const interval = setInterval(() => {
				setSettings((prev) => ({
					...prev,
					lives: Math.min(100, prev.lives + 1),
				}))
			}, 2000)

			return () => clearInterval(interval)
		}
	}, [settings.withDrones])


	//зарядка щита
	useEffect(() => {
		if (!settings.withShield && settings.shield < 100) {
			const interval = setInterval(() => {
				setSettings((prev) => ({
					...prev,
					shield: ( prev.shield + 1),
				}))
			}, 1000)

			return () => clearInterval(interval)
		}
	}, [settings.withShield, settings.shield])

	//расход щита когда включен каждые 5 секунд
	useEffect(() => {
		if (settings.withShield && settings.shield > 0) {
			const interval = setInterval(() => {
				setSettings((prev) => ({
					...prev,
					shield: Math.max(0, prev.shield - 1),
				}))
			}, 2000)

			return () => clearInterval(interval)
		}
	}, [settings.withShield, settings.shield])


	// 🚀 SPAWN (только если врага нет)
	useEffect(() => {
		const interval = setInterval(() => {
			if (settings.withEnemy) {
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
	}, [settings.withEnemy])

	useEffect(() => {
		const interval = setInterval(() => {
			setEnemy((prev) => {
				if (!prev) return null

				const { updated, hit } = moveEnemy(prev)

				// 💥 враг ушёл вниз или попал
				if (updated.y > window.innerHeight - 500 || hit) {
					setShipHit(true)

					setTimeout(() => {
						setShipHit(false)
					}, 300)

					const damage = 5
					setSettings((prev) => applyDamage(prev, damage))

					// удалить врага
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
		setSettings((prev) => ({ ...prev, score: prev.score + 10 }))
		removeEnemy()
	}

	const onOffEnemy = () => {
		if (settings.withEnemy) {
			setSettings((prev) => ({ ...prev, withEnemy: false }))
			setEnemy(null)
		} else {
			setSettings((prev) => ({ ...prev, withEnemy: true }))
		}
	}
	const onOffDrones = () => {
		if (settings.withDrones) {
			setSettings((prev) => ({ ...prev, withDrones: false }))
		} else {
			setSettings((prev) => ({ ...prev, withDrones: true }))
		}
	}

	const onOffShield = () => {
		if (settings.withShield) {
			setSettings((prev) => ({ ...prev, withShield: false }))
		} else {
			setSettings((prev) => ({ ...prev, withShield: true }))
		}
	}

	return (
		<>
			<Stars />

			<HUD onOffEnemy={onOffEnemy} onOffDrones={onOffDrones} onOffShield={onOffShield} settings={settings} />

			<Spaceship withDrones={settings.withDrones} withShield={settings.withShield} shieldIsHolding={shieldIsHolding} shipHit={shipHit} />

			{enemy && <Enemy id={enemy.id} x={enemy.x} y={enemy.y} onClick={handleEnemyClick} />}
		</>
	)
}

export default Game
