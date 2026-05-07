import s from './enemy.module.scss'
import enemyImg from '../../assets/images/enemy1.png'

type EnemyProps = {
	id: number
	x: number
	y: number
	onClick: (id: number) => void
}

const Enemy = ({ id, x, y, onClick }: EnemyProps) => {
	return (
		<div className={s.hitbox} style={{ left: x + 'px', top: y + 'px' }} onClick={() => onClick(id)} onTouchStart={() => onClick(id)}>
			<img className={s.enemy} src={enemyImg} alt="Enemy" />
		</div>
	)
}

export default Enemy
