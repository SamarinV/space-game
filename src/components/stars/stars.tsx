import { useMemo } from 'react'
import s from './stars.module.scss'

function createStars(count: number) {
	return Array.from({ length: count }).map(() => ({
		left: Math.random() * window.innerWidth,
		duration: 2 + Math.random() * 3,
		delay: Math.random() * 5,
	}))
}

type StarType = {
	asteroids: boolean
}

const Stars = ({asteroids}: StarType) => {
	const stars = useMemo(() => createStars(50), [])

	return (
		<div className={`${asteroids && s.asteroidsIsActive}`}>
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
			{asteroids && (
				<div
					style={{
						top: -100 + 'px',
						left: -300 + 'px',
						// animationDuration: star.duration + 's',
						// animationDelay: star.delay + 's',
					}}
					className={s.asteroid}
				></div>
			)}
			{asteroids && (
				<div
					style={{
						top: -200 + 'px',
						left: -100 + 'px',
					}}
					className={s.asteroid}
				></div>
			)}
			{asteroids && (
				<div
					style={{
						top: -400 + 'px',
						left: -150 + 'px',
					}}
					className={s.asteroid}
				></div>
			)}
			{asteroids && (
				<div
					style={{
						top: -300 + 'px',
						left: -250 + 'px',
					}}
					className={s.asteroid}
				></div>
			)}
			{asteroids && (
				<div
					style={{
						top: -400 + 'px',
						left: -350 + 'px',
					}}
					className={s.asteroid}
				></div>
			)}
			{asteroids && (
				<div
					style={{
						top: -500 + 'px',
						left: -400 + 'px',
					}}
					className={s.asteroid}
				></div>
			)}
			{asteroids && (
				<div
					style={{
						top: -500 + 'px',
						left: -450 + 'px',
					}}
					className={s.asteroid}
				></div>
			)}
		</div>
	)
}

export default Stars
