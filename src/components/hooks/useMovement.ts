import { useEffect } from 'react'
import type { SettingsType, SpawnElementsType } from '../../game/game'
import { applyDamage } from '../enemy/applyDamage'
import { moveElements } from '../enemy/moveElements'

type PropsType = {
	settings: SettingsType
	setSettings: React.Dispatch<React.SetStateAction<SettingsType>>
	setEnemy: React.Dispatch<React.SetStateAction<SpawnElementsType | null>>
	setRuble: React.Dispatch<React.SetStateAction<SpawnElementsType | null>>
	setShipHit: React.Dispatch<React.SetStateAction<boolean>>
}
export const useMovement = ({ settings, setSettings, setEnemy, setRuble, setShipHit }: PropsType) => {
	useEffect(() => {
		const interval = setInterval(() => {
			// ⏸ Пауза
			if (settings.isPaused) return

			// =========================
			// 💰 RUBLE
			// =========================
			setRuble((prev) => {
				if (!prev) return null

				const { updated, missed } = moveElements(prev, settings.speed)

				if (missed) {
					return null
				}

				return updated
			})

			// =========================
			// 👾 ENEMY
			// =========================
			setEnemy((prev) => {
				if (!prev) return null

				const { updated, missed, hit } = moveElements(prev, settings.speed)

				// 💥 HIT
				if (hit) {
					setShipHit(true)

					setTimeout(() => {
						setShipHit(false)
					}, 300)

					setSettings((prev) => applyDamage(prev, 5))

					return null
				}

				// 🚀 MISSED
				if (missed) {
					return null
				}

				return updated
			})
		}, 16)

		return () => clearInterval(interval)
	}, [settings.speed, settings.isPaused])
}
