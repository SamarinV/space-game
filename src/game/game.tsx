import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import SpawnElement from '../components/enemy/spawnElement'
import { useAsteroids } from '../components/hooks/useAsteroids'
import { useDrones } from '../components/hooks/useDrones'
import { useMovement } from '../components/hooks/useMovement'
import { useShield } from '../components/hooks/useShield'
import { useSpawn } from '../components/hooks/useSpawn'
import HUD from '../components/HUD/HUD'
import Spaceship from '../components/spaceShip/spaceShip'
import Stars from '../components/stars/stars'
import s from './game.module.scss'

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
	money: number
	shield: number
	lives: number
	speed: number
	asteroidsTimer: number
	withAsteroids: boolean
	isPaused: boolean
}

//цена для покупки дронов и щита
const price = { drone: 10, shield: 10 }

const Game = () => {
	const [ruble, setRuble] = useState<SpawnElementsType | null>(null)
	const [enemy, setEnemy] = useState<SpawnElementsType | null>(null)
	const [shipHit, setShipHit] = useState<boolean>(false)
	const [buttonsIsBlock, setButtonsIsBlock] = useState(false)
	const [settings, setSettings] = useState<SettingsType>({
		dronesLevel: 0,
		withDrones: false,
		shieldLevel: 0,
		withShield: false,
		score: 0,
		money: 0,
		shield: 80,
		lives: 80,
		speed: 1,
		asteroidsTimer: 60,
		withAsteroids: false,
		isPaused: false,
	})
	useDrones({ settings, setSettings })
	useShield({ settings, setSettings })
	useAsteroids({ setSettings, settings, setShipHit })
	useSpawn({ settings, enemy, ruble, setEnemy, setRuble })
	useMovement({ settings, setSettings, setEnemy, setRuble, setShipHit })

	const shieldIsHolding = settings.withShield && settings.shield > 0

	//состояние во время паузы
	useEffect(() => {
		console.log(settings.isPaused)
	}, [settings.isPaused])

	const playPausedHandler = () => {
		setSettings((prev) => ({ ...prev, isPaused: !prev.isPaused }))
	}

	const removeElement = (element: 'enemy' | 'ruble') => {
		if (element === 'enemy') setEnemy(null)
		if (element === 'ruble') setRuble(null)
	}

	const handleRubleClick = () => {
		setSettings((prev) => ({ ...prev, money: prev.money + 10 }))
		setSettings((prev) => ({ ...prev, score: prev.score + 10 }))

		removeElement('ruble')
	}
	const handleEnemyClick = () => {
		setSettings((prev) => ({ ...prev, money: prev.money + 10 }))
		setSettings((prev) => ({ ...prev, score: prev.score + 10 }))
		removeElement('enemy')
	}

	const levelUpDrones = () => {
		if (buttonsIsBlock) return
		setButtonsIsBlock(true)
		const currentLevel = settings.dronesLevel
		const cost = currentLevel === 0 ? price.drone : price.drone * currentLevel * 2
		if (settings.score < cost) {
			toast.error(`Нужно ${cost} ₽`)
			setButtonsIsBlock(false)
			return
		}
		toast.success(`Дроны улучшены! -${cost} ₽`)

		setSettings((prev) => ({
			...prev,
			money: prev.money - cost,
			dronesLevel: prev.dronesLevel + 1,
		}))
		setButtonsIsBlock(false)
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
		if(buttonsIsBlock) return
		setButtonsIsBlock(true)
		const currentLevel = settings.shieldLevel
		const cost = currentLevel === 0 ? price.shield : price.shield * currentLevel * 2
		if (settings.money < cost) {
			toast.error(`Нужно ${cost} ₽`)
			setButtonsIsBlock(false)
			return
		}
		toast.success(`Щит улучшен! -${cost} ₽`)
		setSettings((prev) => ({
			...prev,
			money: prev.money - cost,
			shieldLevel: prev.shieldLevel + 1,
		}))
		setButtonsIsBlock(false)
	}

	const onOffShield = () => {
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

	const restartGame = () => {
		setSettings((prev) => ({
			...prev,
			dronesLevel: 0,
			withDrones: false,
			shieldLevel: 0,
			withShield: false,
			score: 0,
			money: 0,
			shield: 80,
			lives: 80,
			speed: 1,
			asteroidsTimer: 60,
			withAsteroids: false,
			isPaused: false,
		}))
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
				playPaused={playPausedHandler}
				settings={settings}
				buttonsIsBlock={buttonsIsBlock}
			/>

			<Spaceship
				hit={shipHit}
				withDrones={settings.withDrones}
				withShield={settings.withShield}
				shieldIsHolding={shieldIsHolding}
			/>

			{ruble && <SpawnElement isEnemy={false} id={ruble.id} x={ruble.x} y={ruble.y} onClick={handleRubleClick} />}
			{enemy && <SpawnElement isEnemy={true} id={enemy.id} x={enemy.x} y={enemy.y} onClick={handleEnemyClick} />}
			{settings.isPaused && (
				<div className={s.paused}>
					{' '}
					<span>-- ПАУЗА -- </span>
					<span>Ваш счет: {settings.score}</span>
				</div>
			)}
			{settings.lives === 0 && (
				<div className={s.paused}>
					<span>-- ИГРА ОКОНЧЕНА -- </span>
					<span>Ваш счет: {settings.score}</span>
					<button className={s.btn} onClick={restartGame}>
						Начать заново
					</button>
				</div>
			)}
		</>
	)
}

export default Game
