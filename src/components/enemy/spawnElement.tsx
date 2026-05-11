import s from './enemy.module.scss'
// import enemyImg from '../../assets/images/enemy1.png'
import ruble from '../../assets/images/ruble.png'
import enemy from '../../assets/images/enemy1.png'

type ElementProps = {
	id: number
	x: number
	y: number
	onClick: (id: number) => void
	isEnemy: boolean
}

const SpawnElement = ({ id, x, y, onClick, isEnemy }: ElementProps) => {

	const onClickHandler = (id: number) => {
		setTimeout(() => onClick(id), 300)
	}
	return (
		<div
			className={s.hitbox}
			style={{ left: x + 'px', top: y + 'px' }}
			onClick={() => onClickHandler(id)}
			onTouchStart={() => onClick(id)}
		>
			{isEnemy ? (
				<img className={s.enemy} src={enemy} alt="Enemy" />
			) : (
				<img className={s.enemy} src={ruble} alt="Enemy" />
			)}
		</div>
	)
}

export default SpawnElement
