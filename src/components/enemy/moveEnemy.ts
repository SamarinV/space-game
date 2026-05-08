import type { EnemyType } from '../../game/game'

export const moveEnemy = (enemy: EnemyType) => {
	const shipX = window.innerWidth / 2
	const shipY = window.innerHeight - 150

	// направление к кораблю
	const dx = shipX - enemy.x
	const dy = shipY - enemy.y

	const length = Math.sqrt(dx * dx + dy * dy)

	const speed = 2.5

	const updated = {
		...enemy,
		x: enemy.x + (dx / length) * speed,
		y: enemy.y + (dy / length) * speed,
	}

	const distance = Math.sqrt((updated.x - shipX) ** 2 + (updated.y - shipY) ** 2)

	return {
		updated,
		hit: distance < 80,
	}
}
