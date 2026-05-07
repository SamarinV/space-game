import s from './HUD.module.scss'

type Props = {
	lives: number
	shield: number
	score: number
	playPauseEnemy: () => void
	withEnemy: boolean
}

const HUD = ({ lives, shield, score, playPauseEnemy, withEnemy }: Props) => {
	return (
		<>
			<div className={s.hud}>
				<div className={s.item}>❤️ Жизни: {lives}</div>

				<div className={s.item}>🛡 Щит: {shield}%</div>
			</div>
			<div className={s.rightTopBlock}>
				<div className={s.score}>📊 Счет: {score}</div>
				<button className={s.btn + (!withEnemy ? ' ' + s.disabled : '')} onClick={playPauseEnemy}>
				</button>
			</div>
		</>
	)
}

export default HUD
