import { memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { Ref, RefObject } from 'react'
import asteroid from '../assets/images/asteroid.webp'
import bossImage from '../assets/images/boss.svg'
import coin from '../assets/images/ruble.webp'
import drone from '../assets/images/drone.webp'
import enemy from '../assets/images/enemy1.webp'
import ship from '../assets/images/ship.webp'
import type { Effect, Entity, Run } from './engine'
import { shieldCapacity } from './engine'
import s from './game.module.scss'

export type GameSceneHandle = { paint: (run: Run) => void }
type EntityView = Pick<Entity, 'id' | 'kind' | 'power'>
type EffectView = Pick<Effect, 'id' | 'label'>
type Contents = { entities: EntityView[]; effects: EffectView[] }
type Props = {
  ref: Ref<GameSceneHandle>
  model: RefObject<Run>
  onCollectCoin: (id: number) => void
  onCollectWeapon: (id: number) => void
}

function position(node: HTMLElement, x: number, y: number) {
  const transform = `translate(${Math.round(x * 100) / 100}px, ${Math.round(y * 100) / 100}px) translate(-50%, -50%)`
  if (node.style.transform !== transform) node.style.transform = transform
  node.style.visibility = 'visible'
}

const GameScene = memo(function GameScene({ ref, model, onCollectCoin, onCollectWeapon }: Props) {
  const entityNodes = useRef(new Map<number, HTMLElement>())
  const healthNodes = useRef(new Map<number, HTMLElement>())
  const effectNodes = useRef(new Map<number, HTMLSpanElement>())
  const shipNode = useRef<HTMLDivElement>(null)
  const shieldNode = useRef<HTMLDivElement>(null)
  const droneNode = useRef<HTMLDivElement>(null)
  const exhaustNode = useRef<HTMLDivElement>(null)
  const known = useRef<Contents>({ entities: [], effects: [] })
  const [contents, setContents] = useState<Contents>({ entities: [], effects: [] })

  const updatePositions = useCallback((run: Run) => {
    for (const e of run.entities) {
      const node = entityNodes.current.get(e.id)
      if (!node) continue
      position(node, e.x, e.y)
      if (node instanceof HTMLButtonElement) node.disabled = run.phase !== 'playing'
      const health = healthNodes.current.get(e.id)
      if (health && health.dataset.hp !== String(e.hp)) {
        health.dataset.hp = String(e.hp)
        health.setAttribute('aria-label', `Прочность: ${e.hp} из ${e.maxHp}`)
        health.style.setProperty('--health', String(Math.max(0, (e.hp ?? 1) / (e.maxHp ?? 1))))
      }
    }
    for (const effect of run.effects) {
      const node = effectNodes.current.get(effect.id)
      if (!node) continue
      position(node, effect.x, effect.y)
      node.style.opacity = String(Math.min(1, effect.life * 3))
    }
    if (shipNode.current) {
      position(shipNode.current, run.x, run.y)
      shipNode.current.classList.toggle(s.hit, run.invincible > 0)
      shipNode.current.style.animationPlayState = run.phase === 'playing' ? 'running' : 'paused'
    }
    if (shieldNode.current) {
      shieldNode.current.hidden = run.shield <= 1
      shieldNode.current.style.opacity = String(.3 + run.shield / (shieldCapacity(run.shieldLevel) || 1) * .7)
    }
    if (droneNode.current) droneNode.current.hidden = run.droneLevel === 0
    if (exhaustNode.current) exhaustNode.current.style.animationPlayState = run.phase === 'playing' ? 'running' : 'paused'
  }, [])

  const paint = useCallback((run: Run) => {
    // React owns membership; animation only updates the existing DOM nodes.
    const previous = known.current
    const entitiesChanged = previous.entities.length !== run.entities.length || run.entities.some((e, i) => {
      const old = previous.entities[i]
      return old.id !== e.id || old.kind !== e.kind || old.power !== e.power
    })
    const effectsChanged = previous.effects.length !== run.effects.length || run.effects.some((e, i) => previous.effects[i].id !== e.id)
    if (entitiesChanged || effectsChanged) {
      const next = {
        entities: entitiesChanged ? run.entities.map(({ id, kind, power }) => ({ id, kind, power })) : previous.entities,
        effects: effectsChanged ? run.effects.map(({ id, label }) => ({ id, label })) : previous.effects,
      }
      known.current = next
      setContents(next)
    }
    updatePositions(run)
  }, [updatePositions])

  useImperativeHandle(ref, () => ({ paint }), [paint])
  useLayoutEffect(() => { updatePositions(model.current) }, [contents, model, updatePositions])
  useEffect(() => {
    const frame = requestAnimationFrame(() => paint(model.current))
    return () => cancelAnimationFrame(frame)
  }, [model, paint])

  const bindEntity = (id: number, node: HTMLElement | null) => {
    if (node) entityNodes.current.set(id, node)
    else entityNodes.current.delete(id)
  }
  return <>
    {contents.entities.map(e => {
      const bind = (node: HTMLElement | null) => bindEntity(e.id, node)
      if (e.kind === 'bullet' || e.kind === 'hostile') {
        return <i key={e.id} ref={bind} className={`${s.sceneSprite} ${e.kind === 'bullet' ? `${s.bullet} ${e.power === 2 ? s.plasma : ''}` : s.hostile}`} />
      }
      if (e.kind === 'coin' || e.kind === 'weapon') {
        const collect = e.kind === 'coin' ? onCollectCoin : onCollectWeapon
        return <button key={e.id} ref={bind} className={`${s.sceneSprite} ${e.kind === 'coin' ? s.coin : s.weaponDrop}`} aria-label={e.kind === 'coin' ? 'Собрать 10 рублей' : 'Подобрать улучшение оружия'}
          onPointerDown={event => { event.stopPropagation(); collect(e.id) }}
          onClick={event => { if (event.detail === 0) collect(e.id) }}>
          {e.kind === 'coin' ? <img src={coin} alt="" draggable={false} /> : <><b>W</b><span>↑</span></>}
        </button>
      }
      if (e.kind === 'boss') return <img key={e.id} ref={bind} className={`${s.sceneSprite} ${s.boss}`} src={bossImage} alt="Босс — Страж орбиты" draggable={false} />
      return <div key={e.id} ref={bind} className={`${s.sceneSprite} ${s.target}`}>
        <img className={e.kind === 'enemy' ? s.enemy : s.asteroid} src={e.kind === 'enemy' ? enemy : asteroid} alt={e.kind === 'enemy' ? 'Вражеский корабль' : 'Астероид'} draggable={false} />
        <div className={s.targetHp} ref={node => { if (node) healthNodes.current.set(e.id, node); else healthNodes.current.delete(e.id) }}><i /></div>
      </div>
    })}
    <div ref={shipNode} className={`${s.sceneSprite} ${s.ship}`}>
      <div ref={shieldNode} className={s.shieldBubble} hidden />
      <div ref={droneNode} hidden><img className={s.droneLeft} src={drone} alt="" draggable={false} /><img className={s.droneRight} src={drone} alt="" draggable={false} /></div>
      <div ref={exhaustNode} className={s.exhaust} /><img src={ship} alt="Ваш корабль" draggable={false} />
    </div>
    {contents.effects.map(e => <span key={e.id} ref={node => { if (node) effectNodes.current.set(e.id, node); else effectNodes.current.delete(e.id) }} className={`${s.sceneSprite} ${s.effect}`}>{e.label}</span>)}
  </>
})

export default GameScene
