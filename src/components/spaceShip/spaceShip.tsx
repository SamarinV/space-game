import { useEffect, useState } from 'react'
import drone from '../../assets/images/drone.png'
import ship from '../../assets/images/ship.png'
import explosion from '../../assets/images/explosion.png'
import renewableEnergy from '../../assets/images/renewableEnergy.png'
import s from './spaceShip.module.scss'
import { playSound } from '../sound/soundManager'

type Props = {
	shieldIsHolding: boolean
	withShield: boolean
	withDrones: boolean
	hit: boolean
	shieldLevel: number
	dronesLevel: number
	onShoot: (x: number, y: number) => void
}

const Spaceship = ({ shieldIsHolding, withShield, withDrones, hit, shieldLevel, dronesLevel, onShoot }: Props) => {
	const [droneActive, setDroneActive] = useState([false, false, false, false])
	const [shieldPulse, setShieldPulse] = useState(false)
	const [healPulse, setHealPulse] = useState([false, false, false, false])

	const triggerHeal = () => {
		setHealPulse([true, true, true, true])

		setTimeout(() => {
			setHealPulse([false, false, false, false])
		}, 500)
	}
	const triggerShield = () => {
		setShieldPulse(true)

		setTimeout(() => {
			setShieldPulse(false)
		}, 500)
	}
	const sequence = (on: boolean, delay = 300) => {
		return Array.from({ length: 4 }).map((_, i) =>
			setTimeout(() => {
				setDroneActive((prev) => prev.map((_, idx) => (on ? idx <= i : idx > i)))
			}, i * delay),
		)
	}

	useEffect(() => {
		if (!withDrones) return

		const interval = setInterval(() => {
			triggerHeal()
		}, 2000)

		return () => clearInterval(interval)
	}, [withDrones])

	useEffect(() => {
		if (withShield) return
		const interval = setInterval(() => {
			triggerShield()
		}, 2000)

		return () => clearInterval(interval)
	}, [withShield])

	useEffect(() => {
		let timers: ReturnType<typeof setTimeout>[] = []
		if (withDrones) {
			timers = sequence(true, 300)
		} else {
			timers = sequence(false, 300)
		}

		return () => timers.forEach(clearTimeout)
	}, [withDrones])

	useEffect(() => {
		if (!hit) return
		playSound('hit')
	}, [hit])

	return (
		<div className={s.container}>
			{withShield ? (
				<div className={`${shieldIsHolding ? s.activeShield : s.shieldIsOver}	`}></div>
			) : (
				shieldLevel > 0 && (
					<div className={s.renewableEnergy}>
						<img src={renewableEnergy} alt="renewableEnergy"></img>{' '}
						{shieldPulse && <div className={s.shield}>+{shieldLevel}</div>}
					</div>
				)
			)}
			<img
				src={ship}
				alt="spaceship"
				className={s.ship}
				onClick={(e) => {
					const rect = e.currentTarget.getBoundingClientRect()

					onShoot(rect.left + rect.width / 2 - 10, rect.top)
				}}
				onTouchStart={(e) => {
					const rect = e.currentTarget.getBoundingClientRect()

					onShoot(rect.left + rect.width / 2 - 10, rect.top)
				}}
			/>
			{hit && <img src={explosion} alt="explosion" className={s.explosion} />}

			<div className={s.drones}>
				<div className={`${s.drone} ${s.drone1} ${!droneActive[0] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[0] && <div className={s.heal}>+{dronesLevel}</div>}
				</div>

				<div className={`${s.drone} ${s.drone2} ${!droneActive[1] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[1] && <div className={s.heal}>+{dronesLevel}</div>}
				</div>

				<div className={`${s.drone} ${s.drone3} ${!droneActive[2] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[2] && <div className={s.heal}>+{dronesLevel}</div>}
				</div>

				<div className={`${s.drone} ${s.drone4} ${!droneActive[3] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[3] && <div className={s.heal}>+{dronesLevel}</div>}
				</div>
			</div>
		</div>
	)
}

export default Spaceship
