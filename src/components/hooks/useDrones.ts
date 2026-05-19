import { useEffect } from "react"
import type { SettingsType } from "../../game/game"

type PropsType = {
	settings: SettingsType
	setSettings: React.Dispatch<React.SetStateAction<SettingsType>>
}
export const useDrones = ({settings, setSettings}: PropsType) => {
	useEffect(() => {
		if (settings.isPaused || !settings.isStartedGame) return
		if (!settings.withDrones) return

		const interval = setInterval(() => {
			setSettings((prev) => ({
				...prev,
				lives: Math.min(prev.livesMax, prev.lives + settings.dronesLevel*4),
			}))
		}, 6000)

		return () => clearInterval(interval)
	}, [settings.withDrones, settings.dronesLevel, settings.isPaused, settings.isStartedGame])
}
