import type { SettingsType } from "../../game/game"

export const applyDamage = (
	settings: SettingsType,
	damage: number
): SettingsType => {
	if (settings.withShield && settings.shield > 0) {
		return {
			...settings,
			shield: Math.max(0, settings.shield - damage / 2 / settings.shieldLevel),
		}
	}

	return {
		...settings,
		lives: Math.max(0, settings.lives - damage),
	}
}