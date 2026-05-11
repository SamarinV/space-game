import { useEffect } from "react"
import type { SettingsType } from "../../game/game"

type PropsType = {
	settings: SettingsType
	setSettings: React.Dispatch<React.SetStateAction<SettingsType>>
}
export const useShield = ({settings, setSettings}: PropsType) => {
	useEffect(() => {
		if (settings.isPaused) return
		if (!settings.withShield && settings.shield < 100) {
			const interval = setInterval(() => {
				setSettings((prev) => ({
					...prev,
					shield: prev.shield + 1 * settings.shieldLevel,
				}))
			}, 1000)

			return () => clearInterval(interval)
		}
	}, [settings.withShield, settings.shield, settings.shieldLevel])
}
