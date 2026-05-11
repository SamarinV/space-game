import { useEffect, useState } from 'react'

import { toast } from 'react-toastify'
import HUD from '../components/HUD/HUD'
import Spaceship from '../components/spaceShip/spaceShip'
import Stars from '../components/stars/stars'
import { moveElements } from '../components/enemy/moveElements'
import SpawnElement from '../components/enemy/spawnElement'
import { applyDamage } from '../components/enemy/applyDamage'

export type SpawnElementsType = {
	id: number
	x: number
	y: number
}

export type SettingsType = {
	dronesLevel: number
	withDrones: boolean
	shieldLevel: number
	withShield: boolean
	score: number
	shield: number
	lives: number
	speed: number
	asteroidsTimer: number
	withAsteroids: boolean
}

//цена для покупки дронов и щита
const price = { drone: 10, shield: 10 }

const Game = () => {
	const [ruble, setRuble] = useState<SpawnElementsType | null>(null)
	const [enemy, setEnemy] = useState<SpawnElementsType | null>(null)
	const [shipHit, setShipHit] = useState<boolean>(false)
	const [settings, setSettings] = useState<SettingsType>({
		dronesLevel: 0,
		withDrones: false,
		shieldLevel: 0,
		withShield: false,
		score: 0,
		shield: 80,
		lives: 80,
		speed: 1,
		asteroidsTimer: 60,
		withAsteroids: false,
	})

	const shieldIsHolding = settings.withShield && settings.shield > 0

	//восстановление жизней когда есть дроны каждые 2 секунды
	useEffect(() => {
		if (settings.withDrones) {
			const interval = setInterval(() => {
				setSettings((prev) => ({
					...prev,
					lives: Math.min(100, prev.lives + 1 * settings.dronesLevel),
				}))
			}, 2000)

			return () => clearInterval(interval)
		}
	}, [settings.withDrones, settings.dronesLevel])

	//зарядка щита
	useEffect(() => {
		if (!settings.withShield && settings.shield < 100) {
			const interval = setInterval(() => {
				setSettings((prev) => ({
					...prev,
					shield: prev.shield + 1 * settings.shieldLevel,
				}))
			}, 1000)

			return () => clearInterval(interval)
		}
	}, [settings.withShield, settings.shield, settings.shieldLevel])

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

	//появление астероидов
	useEffect(() => {
		const interval = setInterval(() => {
			setSettings((prev) => {
				// =========================
				// ⏳ ТАЙМЕР ИДЁТ
				// =========================
				if (prev.asteroidsTimer > 0) {
					return {
						...prev,
						asteroidsTimer: prev.asteroidsTimer - 1,
					}
				}

				// =========================
				// ☄️ ВКЛЮЧИТЬ АСТЕРОИДЫ
				// =========================
				if (!prev.withAsteroids) {
					// выключить через 10 сек
					setTimeout(() => {
						setSettings((p) => ({
							...p,
							withAsteroids: false,
							asteroidsTimer: 60,
						}))
					}, 10000)

					return {
						...prev,
						withAsteroids: true,
					}
				}

				return prev
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (!settings.withAsteroids) return
		const interval = setInterval(() => {
			setShipHit(true)

			setTimeout(() => {
				setShipHit(false)
			}, 300)

			setSettings((prev) => applyDamage(prev, 5))
		}, 2500)

		return () => clearInterval(interval)
	}, [settings.withAsteroids])

	// 🚀 SPAWN
	useEffect(() => {
		if (settings.withAsteroids) return
		const interval = setInterval(() => {
			//spawn ruble
			if (enemy || ruble) return
			if (Math.random() < 0.7) {
				setRuble((prev) => {
					if (prev) return prev

					return {
						id: Date.now(),
						x: 10 + Math.random() * (window.innerWidth - 55 * 2),
						y: -60,
					}
				})
			} else {
				//spawn enemy
				setEnemy((prev) => {
					if (prev) return prev

					return {
						id: Date.now(),
						x: window.innerWidth / 2 - 30,
						y: -60,
					}
				})
			}
		}, 2000)

		return () => clearInterval(interval)
	}, [ruble, enemy, settings.withAsteroids])

	useEffect(() => {
		const interval = setInterval(() => {
			// =========================
			// 💰 RUBLE
			// =========================
			setRuble((prev) => {
				if (!prev) return null

				const { updated, missed } = moveElements(prev, settings.speed)

				if (missed) {
					return null
				}

				return updated
			})

			// =========================
			// 👾 ENEMY
			// =========================
			setEnemy((prev) => {
				if (!prev) return null

				const { updated, missed, hit } = moveElements(prev, settings.speed)

				// 💥 попадание
				if (hit) {
					setShipHit(true)

					setTimeout(() => {
						setShipHit(false)
					}, 300)

					setSettings((prev) => applyDamage(prev, 5))

					return null
				}
				if (missed) {
					return null
				}

				return updated
			})
		}, 16)

		return () => clearInterval(interval)
	}, [settings.speed])

	const removeElement = (element: 'enemy' | 'ruble') => {
		if (element === 'enemy') setEnemy(null)
		if (element === 'ruble') setRuble(null)
	}

	const handleRubleClick = () => {
		setSettings((prev) => ({ ...prev, score: prev.score + 10 }))
		removeElement('ruble')
	}
	const handleEnemyClick = () => {
		setSettings((prev) => ({ ...prev, score: prev.score + 10 }))
		removeElement('enemy')
	}

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

	const changeSpeed = () => {
		if (settings.speed === 20) {
			setSettings((prev) => ({ ...prev, speed: 1 }))
		}
		setSettings((prev) => ({ ...prev, speed: prev.speed + 1 }))
	}

	return (
		<>
			<Stars asteroids={settings.withAsteroids} />

			<HUD
				price={price}
				levelUpDrones={levelUpDrones}
				levelUpShield={levelUpShield}
				onOffDrones={onOffDrones}
				onOffShield={onOffShield}
				changeSpeed={changeSpeed}
				settings={settings}
			/>

			<Spaceship
				hit={shipHit}
				withDrones={settings.withDrones}
				withShield={settings.withShield}
				shieldIsHolding={shieldIsHolding}
			/>

			{ruble && <SpawnElement isEnemy={false} id={ruble.id} x={ruble.x} y={ruble.y} onClick={handleRubleClick} />}
			{enemy && <SpawnElement isEnemy={true} id={enemy.id} x={enemy.x} y={enemy.y} onClick={handleEnemyClick} />}
		</>
	)
}

export default Game
