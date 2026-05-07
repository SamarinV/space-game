import { useMemo } from 'react'
import s from './stars.module.scss'

function createStars(count: number) {
	return Array.from({ length: count }).map(() => ({
		left: Math.random() * window.innerWidth,
		duration: 2 + Math.random() * 3,
		delay: Math.random() * 5,
	}))
}

const Stars = () => {
	const stars = useMemo(() => createStars(50), [])

	return (
		<div>
			{stars.map((star, i) => (
				<div
					key={i}
					className={s.star}
					style={{
						left: star.left + 'px',
						animationDuration: star.duration + 's',
						animationDelay: star.delay + 's',
					}}
				/>
			))}
		</div>
	)
}

export default Stars
