import type { SettingsType } from '../../game/game'
// import enemy1 from '../../assets/images/enemy1.png'
import ruble from '../../assets/images/ruble.png'
import drone from '../../assets/images/drone.png'
import levelUp from '../../assets/images/levelUp.png'
import shield from '../../assets/images/shield.png'

import s from './HUD.module.scss'

type Props = {
	settings: SettingsType
	onOffDrones: () => void
	onOffShield: () => void
	levelUpDrones: () => void
	levelUpShield: () => void
	playPaused: () => void
	price: { drone: number; shield: number }
	buttonsIsBlock: boolean
}

const HUD = ({
	settings,
	onOffDrones,
	onOffShield,
	levelUpDrones,
	levelUpShield,
	price,
	playPaused,
	buttonsIsBlock,
}: Props) => {
	const livesPercent = (settings.lives / settings.livesMax) * 100
	const shieldPercent = (settings.shield / settings.shieldMax) * 100

	return (
		<div className={s.wrapper}>
			<div className={s.timer}>
				{settings.asteroidsTimer > 0 ? settings.asteroidsTimer + ' сек' : 'АСТЕРОИДЫ ур. ' + settings.asteroidsLevel}
			</div>
			<div className={s.topLeftBlock}>
				{/* <button className={s.btn} onClick={changeSpeed}>
					<span className={s.level}>{settings.speed}</span>
				</button> */}
				<button className={s.btn} onClick={playPaused}>
					<span className={s.level}>{settings.isPaused ? '▶' : '⏸'}</span>
				</button>
			</div>
			<div className={s.hud}>

				{/* HP */}
				<div className={s.barBlock}>
					<div className={s.label}>❤️ Жизни: {settings.lives.toFixed(0)}%</div>
					<div className={s.bar}>
						<div className={s.fillHp} style={{ width: `${livesPercent}%` }} />
					</div>
				</div>

				{/* Shield */}
				<div className={s.barBlock}>
					<div className={s.label}>🛡 Щит: {settings.shield.toFixed(0)}%</div>
					<div className={s.bar}>
						<div className={s.fillShield} style={{ width: `${shieldPercent}%` }} />
					</div>
				</div>
			</div>
			<div className={s.rightTopBlock}>
				<div className={s.money}>
					{settings.money}
					<img className={s.icon} style={{ width: '24px', height: '24px' }} src={ruble} alt="Рубли" />
				</div>
			</div>

			<div className={s.rightBottomBlock}>
				<div className={s.btnsWithLevelUp}>
					<button className={s.btn + ' ' + s.levelUp} onClick={levelUpDrones} disabled={buttonsIsBlock}>
						<img className={s.icon} src={levelUp} alt="+Уровень" />
						<span className={s.level}>{price.drone * 2 * settings.dronesLevel || price.drone}</span>
					</button>
					<button
						className={
							s.btn +
							(settings.dronesLevel === 0 ? ' ' + s.notPurchase : ' ' + s.purchase) +
							(!settings.withDrones ? ' ' + s.disabled : '')
						}
						onClick={onOffDrones}
					>
						<img className={s.icon} src={drone} alt="Дроны" />
						<span className={s.level}>{settings.dronesLevel}</span>
					</button>
				</div>
				<div className={s.btnsWithLevelUp}>
					<button className={s.btn + ' ' + s.levelUp} onClick={levelUpShield} disabled={buttonsIsBlock}>
						<img className={s.icon} src={levelUp} alt="+Уровень" />
						<span className={s.level}>{price.shield * 2 * settings.shieldLevel || price.shield}</span>
					</button>

					<button
						className={
							s.btn +
							(settings.shieldLevel === 0 ? ' ' + s.notPurchase : ' ' + s.purchase) +
							(!settings.withShield ? ' ' + s.disabled : '')
						}
						onClick={onOffShield}
					>
						<img className={s.icon} src={shield} alt="Щит" />
						<span className={s.level}>{settings.shieldLevel}</span>
					</button>
				</div>
			</div>
		</div>
	)
}

export default HUD
