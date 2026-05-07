import ship from '../../assets/images/ship.png'
import explosion from '../../assets/images/explosion.png'
import s from './Spaceship.module.scss'

type Props = {
	isActiveShield: boolean
	shipHit: boolean
}

const Spaceship = ({ isActiveShield, shipHit }: Props) => {
	return (
		<div className={`${s.container} ${shipHit ? s.hit : ''}`}>

			<div className={`${isActiveShield ? s.activeShield : s.disabledShield}	`}></div>
			<img src={ship} alt="spaceship" className={s.ship} />
			{shipHit && <img src={explosion} alt="explosion" className={s.explosion} />}
		</div>
	)
}

export default Spaceship
