import { useEffect, useState } from 'react'
import drone from '../../assets/images/drone.png'
import ship from '../../assets/images/ship.png'
import explosion from '../../assets/images/explosion.png'
import s from './spaceShip.module.scss'

type Props = {
	shieldIsHolding: boolean
	withShield: boolean
	withDrones: boolean
	hit: boolean
}

const Spaceship = ({ shieldIsHolding, withShield, withDrones, hit }: Props) => {
	const [droneActive, setDroneActive] = useState([false, false, false, false])
	const [healPulse, setHealPulse] = useState([false, false, false, false])

	const triggerHeal = () => {
		setHealPulse([true, true, true, true])

		setTimeout(() => {
			setHealPulse([false, false, false, false])
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
		let timers: ReturnType<typeof setTimeout>[] = []
		if (withDrones) {
			timers = sequence(true, 300)
		} else {
			timers = sequence(false, 300)
		}

		return () => timers.forEach(clearTimeout)
	}, [withDrones])

	return (
		<div className={s.container}>
			{withShield && <div className={`${shieldIsHolding ? s.activeShield : s.shieldIsOver}	`}></div>}
			<img src={ship} alt="spaceship" className={s.ship} />
			{hit && <img src={explosion} alt="explosion" className={s.explosion} />}

			<div className={s.drones}>
				<div className={`${s.drone} ${s.drone1} ${!droneActive[0] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[0] && <div className={s.heal}>+</div>}
				</div>

				<div className={`${s.drone} ${s.drone2} ${!droneActive[1] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[1] && <div className={s.heal}>+</div>}
				</div>

				<div className={`${s.drone} ${s.drone3} ${!droneActive[2] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[2] && <div className={s.heal}>+</div>}
				</div>

				<div className={`${s.drone} ${s.drone4} ${!droneActive[3] ? s.droneDisabled : ''}`}>
					<img className={s.droneIcon} src={drone} alt="drone" />
					{healPulse[3] && <div className={s.heal}>+</div>}
				</div>
			</div>
		</div>
	)
}

export default Spaceship
