import { useEffect, useState } from 'react'

import { toast } from 'react-toastify'
import Enemy from '../components/enemy/enemy'
import { moveEnemy } from '../components/enemy/moveEnemy'
import HUD from '../components/HUD/HUD'
import Spaceship from '../components/spaceShip/spaceShip'
import Stars from '../components/stars/stars'

export type EnemyType = {
	id: number
	x: number
	y: number
}

export type SettingsType = {
	withRuble: boolean
	dronesLevel: number
	withDrones: boolean
	shieldLevel: number
	withShield: boolean
	score: number
	shield: number
	lives: number
}

//цена для покупки дронов и щита
const price = { drone: 10, shield: 10 }

const Game = () => {
	const [enemy, setEnemy] = useState<EnemyType | null>(null)
	const [settings, setSettings] = useState<SettingsType>({
		withRuble: true,
		dronesLevel: 0,
		withDrones: false,
		shieldLevel: 0,
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
					shield: prev.shield + 1,
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

	// 🚀 SPAWN
	useEffect(() => {
		const interval = setInterval(() => {
			if (settings.withRuble) {
				setEnemy((prev) => {
					if (prev) return prev

					return {
						id: Date.now(),
						x: 10 + Math.random() * (window.innerWidth - 55 * 2),
						y: -60,
					}
				})
			}
		}, 2000)

		return () => clearInterval(interval)
	}, [settings.withRuble])

	useEffect(() => {
		const interval = setInterval(() => {
			setEnemy((prev) => {
				if (!prev) return null

				const { updated, missed } = moveEnemy(prev)

				// =========================
				// 💥 ПОПАЛ В КОРАБЛЬ
				// =========================
				// if (hit) {
				// 	setShipHit(true)

				// 	setTimeout(() => {
				// 		setShipHit(false)
				// 	}, 300)

				// 	setSettings((prev) => applyDamage(prev, 5))

				// 	return null
				// }

				// =========================
				// 🚀 ПРОЛЕТЕЛ МИМО
				// =========================
				if (missed) {
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

	// const onOffRuble = () => {
	// 	if (settings.withRuble) {
	// 		setSettings((prev) => ({ ...prev, withRuble: false }))
	// 		setEnemy(null)
	// 	} else {
	// 		setSettings((prev) => ({ ...prev, withRuble: true }))
	// 	}
	// }

	const levelUpDrones = () => {
		const currentLevel = settings.dronesLevel
		const cost = currentLevel === 0 ? price.drone : price.drone * currentLevel * 2
		if (settings.score < cost) {
			toast.error(`Нужно ${cost} ₽`)
			return
		}
		toast.success(`Дроны улучшены! -${cost} ₽`)

		setSettings((prev) => ({
			...prev,
			score: prev.score - cost,
			dronesLevel: prev.dronesLevel + 1,
		}))
	}
	const onOffDrones = () => {
		if (settings.dronesLevel > 0) {
			if (settings.withDrones) {
				setSettings((prev) => ({ ...prev, withDrones: false }))
			} else {
				setSettings((prev) => ({ ...prev, withDrones: true }))
			}
		}
	}

	const levelUpShield = () => {
		const currentLevel = settings.shieldLevel
		const cost = currentLevel === 0 ? price.shield : price.shield * currentLevel * 2
		if (settings.score < cost) {
			toast.error(`Нужно ${cost} ₽`)
			return
		}
		toast.success(`Щит улучшен! -${cost} ₽`)
		setSettings((prev) => ({
			...prev,
			score: prev.score - cost,
			shieldLevel: prev.shieldLevel + 1,
		}))
	}

	const onOffShield = () => {
		// console.log(settings.shieldIsBuying)
		// if (!settings.shieldIsBuying && settings.score >= price.shield) {
		// 	toast.success(`Покупка щита! -${price.shield} рублей!`)
		// 	setSettings((prev) => ({ ...prev, score: prev.score - price.shield, shieldIsBuying: true }))
		// }
		// if (!settings.shieldIsBuying && settings.score < price.drone) {
		// 	toast.error(`Нужно ${price.shield} рублей!`)
		// }
		if (settings.shieldLevel > 0) {
			if (settings.withShield) {
				setSettings((prev) => ({ ...prev, withShield: false }))
			} else {
				setSettings((prev) => ({ ...prev, withShield: true }))
			}
		}
	}

	return (
		<>
			<Stars />

			<HUD
				price={price}
				dronesLevel={settings.dronesLevel}
				shieldLevel={settings.shieldLevel}
				levelUpDrones={levelUpDrones}
				levelUpShield={levelUpShield}
				onOffDrones={onOffDrones}
				onOffShield={onOffShield}
				settings={settings}
			/>

			<Spaceship withDrones={settings.withDrones} withShield={settings.withShield} shieldIsHolding={shieldIsHolding} />

			{enemy && <Enemy id={enemy.id} x={enemy.x} y={enemy.y} onClick={handleEnemyClick} />}
		</>
	)
}

export default Game
