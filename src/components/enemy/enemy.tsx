import s from './enemy.module.scss'
// import enemyImg from '../../assets/images/enemy1.png'
import ruble from '../../assets/images/ruble.png'

type EnemyProps = {
	id: number
	x: number
	y: number
	onClick: (id: number) => void
}

const Enemy = ({ id, x, y, onClick }: EnemyProps) => {

	const onClickHandler = (id: number) => {
		setTimeout(() => onClick(id), 300)
	}
	return (
		<div className={s.hitbox} style={{ left: x + 'px', top: y + 'px' }} onClick={() => onClickHandler(id)} onTouchStart={() => onClick(id)}>
			<img className={s.enemy} src={ruble} alt="Enemy" />
		</div>
	)
}

export default Enemy
