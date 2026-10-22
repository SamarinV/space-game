import { useEffect } from 'react'
import type { SettingsType } from '../../game/game'
import { applyDamage } from '../enemy/applyDamage'
import { asteroidsAudio } from '../sound/soundManager'

type PropsType = {
	settings: SettingsType
	setSettings: React.Dispatch<React.SetStateAction<SettingsType>>
	setShipHit: React.Dispatch<React.SetStateAction<boolean>>
}

export const useAsteroids = ({ settings, setSettings, setShipHit }: PropsType) => {
	// =========================
	// ☄️ TIMER
	// =========================
	useEffect(() => {
		if (settings.isPaused) return

		const interval = setInterval(() => {
			setSettings((prev) => {
				// countdown
				if (prev.asteroidsTimer > 0) {
					return {
						...prev,
						asteroidsTimer: prev.asteroidsTimer - 1,
					}
				}

				// start asteroids
				if (!prev.withAsteroids) {
					setSettings((p) => ({
						...p,
						withDrones: false,
					}))
					setTimeout(() => {
						setSettings((p) => ({
							...p,
							withAsteroids: false,
							asteroidsTimer: 40,
							asteroidsLevel: p.asteroidsLevel + 1,
						}))
					}, 10000)

					return {
						...prev,
						withAsteroids: true,
					}
				}

				return prev
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [settings.isPaused, setSettings])

	// =========================
	// 💥 DAMAGE
	// =========================
	useEffect(() => {
		if (settings.isPaused) return
		if (!settings.withAsteroids) return

		const interval = setInterval(() => {
			setShipHit(true)
			setTimeout(() => {
				setShipHit(false)
			}, 300)

			setSettings((prev) => applyDamage(prev, 5 + prev.asteroidsLevel * 2))
		}, 500)

		return () => clearInterval(interval)
	}, [settings.withAsteroids, settings.isPaused, setSettings, setShipHit])

	useEffect(() => {
		if (!settings.withAsteroids) {
			asteroidsAudio.pause()
			asteroidsAudio.currentTime = 0
			return
		}

		asteroidsAudio.play().catch(() => {})

		return () => {
			asteroidsAudio.pause()
			asteroidsAudio.currentTime = 0
		}
	}, [settings.withAsteroids])
}
