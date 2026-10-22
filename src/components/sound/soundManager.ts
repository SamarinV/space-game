import hitSound from '../../assets/sounds/boom.mp3'
import coinSound from '../../assets/sounds/coin.mp3'
import levelUpSound from '../../assets/sounds/levelUp.mp3'
import asteroidsSound from '../../assets/sounds/asteroids.mp3'
import bulletSound from '../../assets/sounds/bullet.mp3'

type SoundName = 'hit' | 'coin' | 'levelUp' | 'asteroids' | 'bullet'

const sounds: Record<SoundName, HTMLAudioElement> = {
	hit: new Audio(hitSound),
	coin: new Audio(coinSound),
	levelUp: new Audio(levelUpSound),
	asteroids: new Audio(asteroidsSound),
	bullet: new Audio(bulletSound),
}

// громкость
sounds.hit.volume = 0.4
sounds.coin.volume = 0.5
sounds.levelUp.volume = 0.5
sounds.bullet.volume = 0.3

let enabled = true
export const setSoundEnabled = (value: boolean) => {
	enabled = value
	if (!value) Object.values(sounds).forEach(sound => sound.pause())
}
export const playSound = (name: SoundName) => {
	if (!enabled) return
	const sound = sounds[name]

	sound.currentTime = 0

	sound.play().catch(() => {})
}


export const asteroidsAudio = new Audio(asteroidsSound)

asteroidsAudio.loop = true
asteroidsAudio.volume = 0.3
