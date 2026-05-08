import type { SettingsType } from "../../game/game"

export const applyDamage = (
	settings: SettingsType,
	damage: number
): SettingsType => {
	if (settings.withShield && settings.shield > 0) {
		const absorbedDamage = Math.min(settings.shield, damage)

		const newShield = settings.shield - absorbedDamage

		const remainingDamage = damage - absorbedDamage

		return {
			...settings,
			shield: newShield,
			lives: Math.max(0, settings.lives - remainingDamage),
		}
	}

	return {
		...settings,
		lives: Math.max(0, settings.lives - damage),
	}
}