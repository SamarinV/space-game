import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collect, createRun, damage, step, storm, upgrade } from './engine.ts'

const idle = { dx: 0, dy: 0, target: null }

test('enemy spawn interval is doubled while asteroid frequency stays unchanged', () => {
  const run = createRun(800, 600, 'playing')
  assert.equal(run.spawn, 1.6)
  run.spawn = 0
  step(run, .016, idle, () => .2)
  assert.equal(run.spawn, 2 * (1.7 - .08))
  run.time = 35; run.spawn = 0
  step(run, .016, idle, () => .2)
  assert.equal(run.spawn, .65)
})

test('enemy cannot fire at a player above it and resumes when player is below', () => {
  const run = createRun(800, 600, 'playing')
  run.x = 600; run.y = 120; run.fire = 100; run.spawn = 100
  run.entities = [{ id: 10, kind: 'enemy', x: 100, y: 250, speed: 0, hp: 3, cooldown: 0 }]
  step(run, .016, idle)
  assert.equal(run.entities.some(e => e.kind === 'hostile'), false)
  run.y = 400
  step(run, .016, idle)
  assert.equal(run.entities.some(e => e.kind === 'hostile'), true)
})

test('pause freezes simulation and prevents collecting coins', () => {
  const run = createRun(800, 600, 'paused')
  run.entities.push({ id: 3, kind: 'coin', x: 100, y: 200, speed: 100 })
  run.droneLevel = 2; run.hp = 50
  const before = structuredClone(run)
  step(run, 1, { dx: 1, dy: 0, target: null })
  collect(run, 3)
  assert.equal(upgrade(run, 'shield'), false)
  assert.deepEqual(run, before)
})

test('modules can be purchased on pause without advancing time', () => {
  const run = createRun(800, 600, 'paused')
  run.money = 60
  assert.equal(upgrade(run, 'shield'), true)
  assert.equal(upgrade(run, 'drone'), true)
  assert.equal(run.money, 0)
  assert.equal(run.shield, 30)
  assert.equal(run.time, 0)
})

test('regeneration respects hull and shield capacity', () => {
  const run = createRun(800, 600, 'playing')
  run.hp = 99.99; run.droneLevel = 5; run.shieldLevel = 1; run.shield = 44.99
  step(run, .05, idle)
  assert.equal(run.hp, 100)
  assert.equal(run.shield, 45)
})

test('shield absorbs damage and overflow reaches hull', () => {
  const run = createRun()
  run.shield = 5
  damage(run, 20)
  assert.equal(run.shield, 0)
  assert.equal(run.hp, 85)
  damage(run, 1000)
  assert.equal(run.hp, 0)
})

test('coin can only be awarded once, upgrades charge the displayed cost', () => {
  const run = createRun(800, 600, 'playing')
  run.entities.push({ id: 5, kind: 'coin', x: 100, y: 200, speed: 100 })
  collect(run, 5); collect(run, 5)
  assert.equal(run.money, 10)
  assert.equal(run.score, 10)
  assert.equal(run.collected, 1)
  assert.equal(upgrade(run, 'shield'), false)
  run.money = 1000
  for (let i = 0; i < 5; i++) assert.equal(upgrade(run, 'shield'), true)
  assert.equal(run.money, 550)
  assert.equal(run.shield, 90)
  assert.equal(upgrade(run, 'shield'), false)
})

test('bullet destroys one target and awards score once', () => {
  const run = createRun(800, 600, 'playing')
  run.fire = 10
  run.entities = [
    { id: 10, kind: 'bullet', x: 100, y: 200, speed: -620 },
    { id: 11, kind: 'enemy', x: 100, y: 200, speed: 100, hp: 1, maxHp: 3 },
    { id: 12, kind: 'enemy', x: 100, y: 200, speed: 100, hp: 1, maxHp: 3 },
  ]
  step(run, 1 / 60, idle)
  assert.equal(run.kills, 1)
  assert.equal(run.score, 25)
  assert.equal(run.entities.length, 1)
  step(run, 1 / 60, idle)
  assert.equal(run.score, 25)
})

test('collisions end the run, game over freezes and restart clears every entity and upgrade', () => {
  let run = createRun(800, 600, 'playing')
  run.hp = 10; run.fire = 10
  run.entities = [{ id: 10, kind: 'enemy', x: run.x, y: run.y, speed: 0 }]
  step(run, .016, idle)
  assert.equal(run.phase, 'over')
  const before = structuredClone(run)
  step(run, .05, idle)
  assert.deepEqual(run, before)
  run = createRun(run.width, run.height, 'playing')
  assert.equal(run.hp, 100)
  assert.equal(run.time, 0)
  assert.equal(run.shieldLevel, 0)
  assert.equal(run.entities.length, 0)
})

test('storm has avoidable physical asteroids and no automatic damage', () => {
  const run = createRun(800, 600, 'playing')
  run.time = 35; run.spawn = 0
  step(run, .016, idle, () => 0)
  assert.equal(storm(run), true)
  assert.equal(run.entities.some(e => e.kind === 'asteroid'), true)
  assert.equal(run.hp, 100)
})

test('movement stays in bounds and diagonal movement is normalized', () => {
  const straight = createRun(800, 600, 'playing')
  const diagonal = createRun(800, 600, 'playing')
  const { x, y } = straight
  step(straight, .05, { dx: 1, dy: 0, target: null })
  step(diagonal, .05, { dx: 1, dy: -1, target: null })
  assert.ok(Math.abs(Math.hypot(diagonal.x - x, diagonal.y - y) - (straight.x - x)) < .001)
  for (let i = 0; i < 100; i++) step(straight, .05, { dx: -1, dy: -1, target: null })
  assert.ok(straight.x >= 28 && straight.y >= 110)
})


test('fire rate stays below two shots per second', () => {
  const run = createRun(900, 2000, 'playing')
  run.spawn = 100; run.coinSpawn = 100
  for (let i = 0; i < 120; i++) step(run, 1 / 60, idle)
  assert.equal(run.entities.filter(e => e.kind === 'bullet').length, 4)
})

test('enemy and asteroid survive the first player bullet', () => {
  for (const [kind, hp] of [['enemy', 3], ['asteroid', 8]] as const) {
    const run = createRun(800, 600, 'playing')
    run.fire = 10
    run.entities = [
      { id: 10, kind: 'bullet', x: 100, y: 200, speed: -620 },
      { id: 11, kind, x: 100, y: 200, speed: 100, hp, maxHp: hp },
    ]
    step(run, .016, idle)
    assert.equal(run.kills, 0)
    assert.equal(run.entities.find(e => e.id === 11)?.hp, hp - 1)
    assert.equal(run.entities.some(e => e.id === 10), false)
  }
})

test('taking damage locks regeneration for six seconds, then modules recover at the increased rates', () => {
  const run = createRun(800, 600, 'playing')
  run.shieldLevel = 1; run.droneLevel = 5; run.shield = 30; run.hp = 60
  run.spawn = 100; run.coinSpawn = 100
  damage(run, 18)
  for (let i = 0; i < 100; i++) step(run, .05, idle)
  assert.equal(run.shield, 12)
  assert.equal(run.hp, 60)
  for (let i = 0; i < 60; i++) step(run, .05, idle)
  assert.ok(run.shield >= 14.8 && run.shield <= 15.01)
  assert.ok(run.hp >= 65.6 && run.hp <= 66.01)
  damage(run, 1)
  assert.equal(run.rechargeDelay, 6)
})

test('red projectiles pass through player bullets and damage the ship', () => {
  const run = createRun(800, 600, 'playing')
  run.fire = 100
  run.entities = [
    { id: 10, kind: 'bullet', x: run.x, y: run.y, speed: 0 },
    { id: 11, kind: 'hostile', x: run.x, y: run.y, speed: 0, vx: 0 },
  ]
  step(run, .016, idle)
  assert.equal(run.hp, 82)
  assert.equal(run.entities.some(e => e.id === 10), true)
  assert.equal(run.entities.some(e => e.id === 11), false)
})

test('standing still loses even with maximum defensive modules on several field sizes', () => {
  for (const width of [360, 900, 1300]) {
    let seed = 123
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    const run = createRun(width, 650, 'playing')
    run.shieldLevel = 5; run.droneLevel = 5; run.shield = 105
    for (let i = 0; i < 60 * 60 && run.phase === 'playing'; i++) step(run, 1 / 60, idle, random)
    assert.equal(run.phase, 'over', 'Stationary ship must not survive indefinitely')
  }
})

test('moving out of aimed shots survives longer than standing still', () => {
  const simulate = (moving: boolean) => {
    let seed = 123, dx = 1
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    const run = createRun(900, 650, 'playing')
    for (let i = 0; i < 60 * 60 && run.phase === 'playing'; i++) {
      if (run.x > run.width - 55) dx = -1
      if (run.x < 55) dx = 1
      step(run, 1 / 60, { dx: moving ? dx : 0, dy: 0, target: null }, random)
    }
    return run.time
  }
  assert.ok(simulate(true) > simulate(false) * 1.5)
})
