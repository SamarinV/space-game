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
	dronesLevel: number
	shieldLevel: number
}

const HUD = ({ settings, onOffDrones, onOffShield, levelUpDrones, dronesLevel, levelUpShield, shieldLevel }: Props) => {
	const livesPercent = (settings.lives / 100) * 100
	const shieldPercent = (settings.shield / 100) * 100

	return (
		<>
			<div className={s.hud}>
				{/* HP */}
				<div className={s.barBlock}>
					<div className={s.label}>❤️ Жизни: {settings.lives}%</div>
					<div className={s.bar}>
						<div className={s.fillHp} style={{ width: `${livesPercent}%` }} />
					</div>
				</div>

				{/* Shield */}
				<div className={s.barBlock}>
					<div className={s.label}>🛡 Щит: {settings.shield}%</div>
					<div className={s.bar}>
						<div className={s.fillShield} style={{ width: `${shieldPercent}%` }} />
					</div>
				</div>
			</div>
			<div className={s.rightTopBlock}>
				<div className={s.score}>
					{settings.score}
					<img className={s.icon} style={{ width: '24px', height: '24px' }} src={ruble} alt="Рубли" />
				</div>
				{/* <button className={s.btn + (!settings.withRuble ? ' ' + s.disabled : '')} onClick={onOffRuble}>
					<img className={s.icon} src={ruble} alt="Рубли" />
				</button> */}
			</div>
			<div className={s.rightBottomBlock}>
				<div className={s.btnsWithLevelUp}>
					<button className={s.btn + ' ' + s.levelUp} onClick={levelUpDrones}>
						<img className={s.icon} src={levelUp} alt="+Уровень" />
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
						<span className={s.level}>{dronesLevel}</span>
					</button>
				</div>
				<div className={s.btnsWithLevelUp}>
					<button className={s.btn + ' ' + s.levelUp} onClick={levelUpShield}>
						<img className={s.icon} src={levelUp} alt="+Уровень" />
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
						<span className={s.level}>{shieldLevel}</span>
					</button>
				</div>
			</div>
		</>
	)
}

export default HUD
