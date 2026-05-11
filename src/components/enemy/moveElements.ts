import type { SpawnElementsType } from '../../game/game'

const ELEMENT_SIZE = 50

export const moveElements = (enemy: SpawnElementsType, speed: number) => {
	const currentSpeed = speed

	const updated = {
		...enemy,
		y: enemy.y + currentSpeed,
	}

	// центр enemy
	const enemyCenterX = updated.x + ELEMENT_SIZE / 2
	const enemyCenterY = updated.y + ELEMENT_SIZE / 2

	// центр корабля
	const shipX = window.innerWidth / 2
	const shipY = window.innerHeight - 150

	// дистанция между центрами
	const distance = Math.sqrt((enemyCenterX - shipX) ** 2 + (enemyCenterY - shipY) ** 2)

	// попадание
	const hit = distance < 80

	// улетел за экран
	const missed = updated.y > window.innerHeight + ELEMENT_SIZE

	return {
		updated,
		hit,
		missed,
	}
}

// логика движения к кораблю (сложная, можно юзать для будущих врагов)
// export const moveEnemy = (enemy: EnemyType) => {
// 	const shipX = window.innerWidth / 2
// 	const shipY = window.innerHeight - 150

// 	// направление к кораблю
// 	const dx = shipX - enemy.x
// 	const dy = shipY - enemy.y

// 	const length = Math.sqrt(dx * dx + dy * dy)

// 	const speed = 2.5

// 	const updated = {
// 		...enemy,
// 		x: enemy.x + (dx / length) * speed,
// 		y: enemy.y + (dy / length) * speed,
// 	}

// 	const distance = Math.sqrt((updated.x - shipX) ** 2 + (updated.y - shipY) ** 2)

// 	return {
// 		updated,
// 		hit: distance < 80,
// 	}
// }
