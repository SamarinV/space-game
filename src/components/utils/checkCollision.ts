import type { BulletType, SpawnElementsType } from '../../game/game'

export const checkCollision = (bullet: BulletType, enemy: SpawnElementsType) => {
	return bullet.x < enemy.x + 50 && bullet.x + 20 > enemy.x && bullet.y < enemy.y + 50 && bullet.y + 40 > enemy.y
}
