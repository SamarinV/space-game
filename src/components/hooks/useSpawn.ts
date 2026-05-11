import { useEffect } from "react"
import type { SettingsType, SpawnElementsType } from "../../game/game"

type PropsType = {
	settings: SettingsType
	enemy: SpawnElementsType | null
	ruble: SpawnElementsType | null
	setEnemy: React.Dispatch<React.SetStateAction<SpawnElementsType | null>>
	setRuble: React.Dispatch<React.SetStateAction<SpawnElementsType | null>>
}
export const useSpawn = ({settings, enemy, ruble, setEnemy, setRuble}: PropsType) => {
useEffect(() => {
	if (settings.isPaused) return
	if (settings.withAsteroids) return
	const interval = setInterval(() => {
		//spawn ruble
		if (enemy || ruble) return
		if (Math.random() < 0.7) {
			setRuble((prev) => {
				if (prev) return prev

				return {
					id: Date.now(),
					x: 10 + Math.random() * (window.innerWidth - 55 * 2),
					y: -60,
				}
			})
		} else {
			//spawn enemy
			setEnemy((prev) => {
				if (prev) return prev

				return {
					id: Date.now(),
					x: window.innerWidth / 2 - 30,
					y: -60,
				}
			})
		}
	}, 2000)

	return () => clearInterval(interval)
}, [ruble, enemy, settings.withAsteroids])


}
