import s from './Bullet.module.scss'

type BulletProps = {
	id: number
	x: number
	onRemove: (id: number) => void
}

const Bullet = ({ id, x, onRemove }: BulletProps) => {
	return (
		<div
			className={s.bullet}
			style={{
				left: x + 'px',
			}}
			onAnimationEnd={() => onRemove(id)}
		/>
	)
}

export default Bullet
