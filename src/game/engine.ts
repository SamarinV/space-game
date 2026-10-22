export type Phase = 'ready' | 'playing' | 'paused' | 'over'
export type Entity = {
  id: number
  kind: 'enemy' | 'coin' | 'asteroid' | 'bullet' | 'hostile'
  x: number
  y: number
  speed: number
  hp?: number
  maxHp?: number
  vx?: number
  cooldown?: number
}
export type Effect = { id: number; x: number; y: number; life: number; label: string }
export type Run = {
  phase: Phase; width: number; height: number; x: number; y: number
  hp: number; shield: number; shieldLevel: number; droneLevel: number
  score: number; money: number; kills: number; collected: number; time: number
  entities: Entity[]; effects: Effect[]; nextId: number
  spawn: number; coinSpawn: number; fire: number; invincible: number; rechargeDelay: number
}
export type Input = { dx: number; dy: number; target: { x: number; y: number } | null }
export const wave = (run: Run) => 1 + Math.floor(run.time / 25)
export const storm = (run: Run) => run.time % 44 >= 35
export const cost = (level: number) => 30 + level * 30
export const shieldCapacity = (level: number) => level ? 30 + level * 15 : 0
export const hullRecovery = (level: number) => level * .6
export const shieldRecovery = (level: number) => level ? 1 + level * .5 : 0
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
export function createRun(width = 900, height = 650, phase: Phase = 'ready'): Run {
  return {
    phase, width, height, x: width / 2, y: height - 155, hp: 100, shield: 0,
    shieldLevel: 0, droneLevel: 0, score: 0, money: 0, kills: 0, collected: 0, time: 0,
    entities: [], effects: [], nextId: 1, spawn: 1.6, coinSpawn: 1.5, fire: 0,
    invincible: 0, rechargeDelay: 0,
  }
}
export function damage(run: Run, amount: number) {
  const absorbed = Math.min(run.shield, amount)
  run.shield -= absorbed
  run.hp = Math.max(0, run.hp - (amount - absorbed))
  run.rechargeDelay = 6
}
export function collect(run: Run, id: number) {
  if (run.phase !== 'playing') return
  const coin = run.entities.find(e => e.id === id && e.kind === 'coin')
  if (!coin) return
  run.money += 10; run.score += 10; run.collected++
  run.effects.push({ id: run.nextId++, x: coin.x, y: coin.y, life: .7, label: '+10 ₽' })
  run.entities = run.entities.filter(e => e.id !== id)
}
export function upgrade(run: Run, kind: 'shield' | 'drone') {
  const key = kind === 'shield' ? 'shieldLevel' : 'droneLevel'
  if (!['playing', 'paused'].includes(run.phase) || run[key] >= 5 || run.money < cost(run[key])) return false
  run.money -= cost(run[key]); run[key]++
  // Extra capacity does not refill an exhausted shield for free.
  if (kind === 'shield') run.shield = Math.min(shieldCapacity(run.shieldLevel), run.shield + (run.shieldLevel === 1 ? 30 : 15))
  return true
}
// All timers use game time: pausing freezes movement, attacks and regeneration.
export function step(run: Run, seconds: number, input: Input, random = Math.random) {
  if (run.phase !== 'playing') return
  const dt = Math.min(seconds, .05)
  run.time += dt; run.fire -= dt; run.spawn -= dt; run.coinSpawn -= dt
  run.invincible = Math.max(0, run.invincible - dt)
  const recovering = run.rechargeDelay <= 0
  run.rechargeDelay = Math.max(0, run.rechargeDelay - dt)
  const speed = 360 * dt
  if (input.target) {
    const dx = input.target.x - run.x, dy = input.target.y - run.y
    const distance = Math.hypot(dx, dy)
    const scale = distance ? Math.min(1, speed * 1.8 / distance) : 0
    run.x += dx * scale; run.y += dy * scale
  } else {
    const norm = Math.max(1, Math.hypot(input.dx, input.dy))
    run.x += input.dx / norm * speed; run.y += input.dy / norm * speed
  }
  run.x = clamp(run.x, 28, run.width - 28)
  run.y = clamp(run.y, 110, run.height - 120)
  if (recovering) {
    run.hp = Math.min(100, run.hp + hullRecovery(run.droneLevel) * dt)
    if (run.shieldLevel) run.shield = Math.min(shieldCapacity(run.shieldLevel), run.shield + shieldRecovery(run.shieldLevel) * dt)
  }
  const add = (kind: Entity['kind'], x: number, y: number, velocity: number, extra: Partial<Entity> = {}) =>
    run.entities.push({ id: run.nextId++, kind, x, y, speed: velocity, ...extra })
  if (run.fire <= 0) { add('bullet', run.x, run.y - 32, -620); run.fire = .55 }
  if (run.spawn <= 0) {
    const isStorm = storm(run)
    const hp = isStorm ? 8 : 3 + Math.min(3, Math.floor((wave(run) - 1) / 3))
    add(isStorm ? 'asteroid' : 'enemy', 28 + random() * (run.width - 56), -35,
      (isStorm ? 130 : 65) + Math.min(wave(run), 15) * 8,
      { hp, maxHp: hp, cooldown: .6, vx: random() < .5 ? -28 : 28 })
    run.spawn = isStorm ? .65 : 2 * Math.max(.65, 1.7 - wave(run) * .08)
  }
  if (run.coinSpawn <= 0) {
    add('coin', 30 + random() * (run.width - 60), -24, 85)
    run.coinSpawn = 2.1
  }
  const attacks: Entity[] = []
  for (const e of run.entities) {
    e.y += e.speed * dt
    if (e.kind === 'hostile') e.x += (e.vx ?? 0) * dt
    if (e.kind === 'enemy') {
      e.x += (e.vx ?? 0) * dt
      if (e.x < 28 || e.x > run.width - 28) { e.x = clamp(e.x, 28, run.width - 28); e.vx = -(e.vx ?? 0) }
      e.cooldown = (e.cooldown ?? .6) - dt
      if (e.cooldown <= 0 && e.y > 35 && e.y < run.height - 140 && run.y >= e.y) {
        // Aim at the current position; the shot cannot track a moving player.
        const dx = run.x - e.x, dy = run.y - e.y
        const distance = Math.max(1, Math.hypot(dx, dy))
        const velocity = 220 + Math.min(100, wave(run) * 10)
        attacks.push({ id: run.nextId++, kind: 'hostile', x: e.x, y: e.y + 20,
          speed: dy / distance * velocity, vx: dx / distance * velocity })
        e.cooldown = Math.max(.9, 2 - wave(run) * .06)
      }
    }
  }
  run.entities.push(...attacks)
  const removed = new Set<number>()
  for (const e of run.entities) {
    if (e.kind !== 'enemy' && e.kind !== 'asteroid') continue
    for (const bullet of run.entities) {
      if (bullet.kind !== 'bullet' || removed.has(bullet.id) || Math.abs(bullet.x - e.x) >= 24 || Math.abs(bullet.y - e.y) >= 30) continue
      removed.add(bullet.id)
      e.hp = (e.hp ?? (e.kind === 'enemy' ? 3 : 8)) - 1
      if (e.hp <= 0) {
        removed.add(e.id); run.kills++; run.score += e.kind === 'enemy' ? 25 : 60; run.money += e.kind === 'enemy' ? 5 : 10
        run.effects.push({ id: run.nextId++, x: e.x, y: e.y, life: .45, label: '✦' })
        break
      }
      run.effects.push({ id: run.nextId++, x: e.x, y: e.y, life: .2, label: '−1' })
    }
    if (!removed.has(e.id) && Math.hypot(run.x - e.x, run.y - e.y) < 35) {
      removed.add(e.id)
      if (run.invincible <= 0) { damage(run, e.kind === 'asteroid' ? 35 : 25); run.invincible = .45 }
    }
  }
  for (const e of run.entities) {
    if (e.kind === 'hostile' && Math.hypot(run.x - e.x, run.y - e.y) < 22) {
      removed.add(e.id)
      if (run.invincible <= 0) { damage(run, 18); run.invincible = .45 }
    }
  }
  for (const e of [...run.entities]) {
    if (e.kind === 'coin' && Math.hypot(run.x - e.x, run.y - e.y) < 44) collect(run, e.id)
  }
  run.entities = run.entities.filter(e => !removed.has(e.id) && e.y > -70 && e.y < run.height + 55 && e.x > -60 && e.x < run.width + 60)
  run.effects = run.effects.map(e => ({ ...e, y: e.y - 25 * dt, life: e.life - dt })).filter(e => e.life > 0)
  if (run.hp <= 0) run.phase = 'over'
}
