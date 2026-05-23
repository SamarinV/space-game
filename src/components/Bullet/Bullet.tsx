import bulletImg from '../../assets/images/bullet.png'
import s from './bullet.module.scss'

type Props = {
	x: number
	y: number
}

const Bullet = ({ x, y }: Props) => {
	return (
		<img
			src={bulletImg}
			className={s.bullet}
			style={{
				left: x,
				top: y,
			}}
			alt="bullet"
		/>
	)
}

export default Bullet
