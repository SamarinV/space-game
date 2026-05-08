import type { SettingsType } from '../../game/game'
import enemy1 from '../../assets/images/enemy1.png'
import drone from '../../assets/images/drone.png'
import shield from '../../assets/images/shield.png'

import s from './HUD.module.scss'

type Props = {
	onOffEnemy: () => void
	settings: SettingsType
	onOffDrones?: () => void
	onOffShield?: () => void
}

const HUD = ({ settings, onOffEnemy, onOffDrones, onOffShield }: Props) => {
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
				<div className={s.score}>📊 Счет: {settings.score}</div>
				<button className={s.btn + (!settings.withEnemy ? ' ' + s.disabled : '')} onClick={onOffEnemy}>
					<img className={s.icon} src={enemy1} alt="Враги" />
				</button>
			</div>
			<div className={s.rightBottomBlock}>
				<button className={s.btn + (!settings.withDrones ? ' ' + s.disabled : '')} onClick={onOffDrones}>
					<img className={s.icon} src={drone} alt="Дроны" />
				</button>
				<button className={s.btn + (!settings.withShield ? ' ' + s.disabled : '')} onClick={onOffShield}>
					<img className={s.icon} src={shield} alt="Щит" />
				</button>
			</div>
		</>
	)
}

export default HUD
