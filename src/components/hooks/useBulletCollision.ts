import { useEffect } from 'react'
import type { BulletType, SpawnElementsType, SettingsType } from '../../game/game'
import { checkCollision } from '../utils/checkCollision'
import { playSound } from '../sound/soundManager'

type Props = {
	bullets: BulletType[]
	setBullets: React.Dispatch<React.SetStateAction<BulletType[]>>

	enemy: SpawnElementsType | null
	setEnemy: React.Dispatch<React.SetStateAction<SpawnElementsType | null>>

	setSettings: React.Dispatch<React.SetStateAction<SettingsType>>
}

export const useBulletCollision = ({ bullets, setBullets, enemy, setEnemy, setSettings }: Props) => {
	useEffect(() => {
		if (!enemy) return

		const hitBullet = bullets.find((bullet) => checkCollision(bullet, enemy))

		if (!hitBullet) return

		// 💥 удалить врага
		playSound('hit')
		setEnemy(null)

		// 💰 очки
		setSettings((prev) => ({
			...prev,
			score: prev.score + 20,
			money: prev.money + 20,
		}))

		// 🚀 удалить пулю
		setBullets((prev) => prev.filter((b) => b.id !== hitBullet.id))
	}, [bullets, enemy, setBullets, setEnemy, setSettings])
}
