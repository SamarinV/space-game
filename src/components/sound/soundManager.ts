import hitSound from '../../assets/sounds/boom.mp3'
import coinSound from '../../assets/sounds/coin.mp3'
import levelUpSound from '../../assets/sounds/levelUp.mp3'

type SoundName = 'hit' | 'coin' | 'levelUp'

const sounds: Record<SoundName, HTMLAudioElement> = {
	hit: new Audio(hitSound),
	coin: new Audio(coinSound),
	levelUp: new Audio(levelUpSound),
}

// громкость
sounds.hit.volume = 0.4
sounds.coin.volume = 0.5
sounds.levelUp.volume = 0.5

export const playSound = (name: SoundName) => {
	const sound = sounds[name]

	sound.currentTime = 0

	sound.play().catch(() => {})
}
