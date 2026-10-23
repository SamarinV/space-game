import { useEffect, useRef, useState } from 'react'
import asteroid from '../assets/images/asteroid.webp'
import bossImage from '../assets/images/boss.svg'
import drone from '../assets/images/drone.webp'
import enemy from '../assets/images/enemy1.webp'
import coin from '../assets/images/ruble.webp'
import shield from '../assets/images/shield.webp'
import ship from '../assets/images/ship.webp'
import musicFile from '../assets/sounds/space.mp3'
import { playSound, setSoundEnabled } from '../components/sound/soundManager'
import { preloadImages } from './assets'
import type { Input, Run } from './engine'
import { collect, collectWeapon, cost, createRun, encounterTime, hullRecovery, shieldCapacity, step, storm, upgrade, wave, weaponNames } from './engine'
import s from './game.module.scss'

// Compatibility with the original standalone components.
export type SpawnElementsType = { id: number; x: number; y: number }
export type BulletType = SpawnElementsType
export type SettingsType = { dronesLevel: number; withDrones: boolean; shieldLevel: number; withShield: boolean; score: number; money: number; shield: number; shieldMax: number; lives: number; livesMax: number; speed: number; asteroidsTimer: number; asteroidsLevel: number; withAsteroids: boolean; isPaused: boolean; isStartedGame: boolean }
function readSaved(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback } catch { return fallback } }
const timeLabel = (time: number) => `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`
const gameImages = [ship, enemy, asteroid, coin, drone, shield, bossImage]
const stars = Array.from({ length: 65 }, (_, i) => ({ left: `${(i * 37.71) % 100}%`, top: `${(i * 19.37) % 100}%`, opacity: .2 + i % 5 * .14, width: i % 4 === 0 ? 2 : 1 }))

export default function Game({ initialRun }: { initialRun?: Run } = {}) {
  const arena = useRef<HTMLDivElement>(null)
  const model = useRef(initialRun ?? createRun())
  const input = useRef<Input>({ dx: 0, dy: 0, target: null })
  const keys = useRef(new Set<string>())
  const music = useRef<HTMLAudioElement | null>(null)
  const [run, setRun] = useState<Run>(() => initialRun ?? createRun())
  const [best, setBest] = useState(() => Math.max(0, Number(readSaved('orbit-best', '0')) || 0))
  const [muted, setMuted] = useState(() => readSaved('orbit-muted', 'false') === 'true')
  const [help, setHelp] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [screenNote, setScreenNote] = useState('')
  const [assetsState, setAssetsState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [assetAttempt, setAssetAttempt] = useState(0)
  const active = run.phase === 'playing'
  const isStorm = storm(run)
  const boss = run.entities.find(e => e.kind === 'boss')
  const publish = () => setRun({ ...model.current, entities: [...model.current.entities] })
  useEffect(() => {
    let cancelled = false
    preloadImages(gameImages).then(() => { if (!cancelled) setAssetsState('ready') })
      .catch(() => { if (!cancelled) setAssetsState('error') })
    return () => { cancelled = true }
  }, [assetAttempt])
  const retryAssets = () => { setAssetsState('loading'); setAssetAttempt(value => value + 1) }
  const start = () => {
    if (assetsState !== 'ready') return
    const old = model.current
    model.current = createRun(old.width, old.height, 'playing')
    input.current = { dx: 0, dy: 0, target: null }; keys.current.clear(); setHelp(false); publish()
    // Start playback inside the user gesture, including after a previously muted run.
    setMuted(false)
    setSoundEnabled(true)
    if (music.current) {
      music.current.currentTime = 0
      music.current.play().catch(() => {})
    }
    if (!expanded && !document.fullscreenElement) void toggleFullscreen()
  }
  const pause = () => {
    if (model.current.phase === 'playing') model.current.phase = 'paused'
    else if (model.current.phase === 'paused') model.current.phase = 'playing'
    input.current = { dx: 0, dy: 0, target: null }; keys.current.clear(); publish()
  }
  const collectCoin = (id: number) => {
    const before = model.current.collected
    collect(model.current, id)
    if (model.current.collected > before) { playSound('coin'); publish() }
  }
  const pickWeapon = (id: number) => {
    if (collectWeapon(model.current, id)) { playSound('levelUp'); publish() }
  }
  const buy = (kind: 'shield' | 'drone') => { if (upgrade(model.current, kind)) { playSound('levelUp'); publish() } }
  const toggleFullscreen = async () => {
    if (expanded) { setExpanded(false); return }
    if (document.fullscreenElement) { await document.exitFullscreen(); return }
    try {
      if (!arena.current?.requestFullscreen) throw new Error('Fullscreen unavailable')
      await arena.current.requestFullscreen()
      setScreenNote('')
    } catch {
      setExpanded(true)
      setScreenNote('Браузер ограничил полный экран — поле развёрнуто на всё окно.')
    }
  }

  useEffect(() => {
    const changed = () => {
      setFullscreen(document.fullscreenElement === arena.current)
      input.current = { dx: 0, dy: 0, target: null }; keys.current.clear()
      if (!document.fullscreenElement && model.current.phase === 'playing') {
        model.current.phase = 'paused'; setRun({ ...model.current })
      }
    }
    document.addEventListener('fullscreenchange', changed)
    return () => document.removeEventListener('fullscreenchange', changed)
  }, [])
  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [expanded])

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const r = model.current, { width, height } = entry.contentRect
      r.x *= width / r.width; r.y *= height / r.height
      for (const e of r.entities) { e.x *= width / r.width; e.y *= height / r.height }
      r.width = width; r.height = height
      setRun({ ...r })
    })
    if (arena.current) observer.observe(arena.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let frame = 0, last = 0
    const loop = (now: number) => {
      const r = model.current, wasPlaying = r.phase === 'playing', previousHp = r.hp, previousKills = r.kills, previousCoins = r.collected, previousWeapon = r.weaponLevel
      if (assetsState === 'ready') step(r, last ? (now - last) / 1000 : 0, input.current)
      if (r.hp < previousHp || r.kills > previousKills) playSound('hit')
      if (r.collected > previousCoins) playSound('coin')
      if (r.weaponLevel > previousWeapon) playSound('levelUp')
      if (wasPlaying) setRun({ ...r, entities: [...r.entities] })
      last = now; frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [assetsState])
  useEffect(() => {
    const r = model.current
    if (r.score > best) {
      setBest(r.score)
      try { localStorage.setItem('orbit-best', String(r.score)) } catch { /* Storage may be disabled. */ }
    }
  }, [run.score, best])
  useEffect(() => {
    const audio = music.current
    if (!audio) return
    audio.volume = .16
    return () => { audio.pause() }
  }, [])
  useEffect(() => {
    setSoundEnabled(!muted)
    try { localStorage.setItem('orbit-muted', String(muted)) } catch { /* Optional preference. */ }
    if (active && !muted) music.current?.play().catch(() => {})
    else music.current?.pause()
  }, [muted, active])
  useEffect(() => {
    const resetInput = () => { keys.current.clear(); input.current = { dx: 0, dy: 0, target: null } }
    const autoPause = () => {
      resetInput()
      if (model.current.phase === 'playing') { model.current.phase = 'paused'; setRun({ ...model.current }) }
    }
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(event.target.tagName)) return
      const code = event.code
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(code)) event.preventDefault()
      if (help) { if (code === 'Escape') setHelp(false); return }
      if (code === 'Escape' && expanded) { setExpanded(false); autoPause(); return }
      if (code === 'Escape' && document.fullscreenElement) return
      if (event.type === 'keydown') keys.current.add(code); else keys.current.delete(code)
      if (event.type === 'keydown' && !event.repeat && ['Escape', 'KeyP', 'Space'].includes(code)) {
        if (model.current.phase === 'playing') model.current.phase = 'paused'
        else if (model.current.phase === 'paused') model.current.phase = 'playing'
        resetInput(); setRun({ ...model.current })
      }
      const held = (a: string, b: string) => Number(keys.current.has(a) || keys.current.has(b))
      input.current.dx = held('KeyD', 'ArrowRight') - held('KeyA', 'ArrowLeft')
      input.current.dy = held('KeyS', 'ArrowDown') - held('KeyW', 'ArrowUp')
      if (input.current.dx || input.current.dy) input.current.target = null
    }
    const visibility = () => { if (document.hidden) autoPause() }
    window.addEventListener('keydown', key); window.addEventListener('keyup', key)
    window.addEventListener('blur', autoPause); document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('keyup', key); window.removeEventListener('blur', autoPause); document.removeEventListener('visibilitychange', visibility) }
  }, [help, expanded])
  const pointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || (event.target as HTMLElement).closest('button')) return
    if (event.type === 'pointerdown') event.currentTarget.setPointerCapture(event.pointerId)
    if (event.buttons || event.pointerType === 'touch') {
      const rect = event.currentTarget.getBoundingClientRect()
      input.current.target = { x: event.clientX - rect.left, y: event.clientY - rect.top - (event.pointerType === 'touch' ? 50 : 0) }
    }
  }
  return (
    <main className={s.app}>
      <audio ref={music} src={musicFile} loop preload="none" />
      <header className={s.header}>
        <a className={s.brand} href="./" aria-label="Орбита — главная"><span className={s.logo}>✳</span> ORBIT<span className={s.brandSuffix}> / ОРБИТА</span></a>
        <div className={s.headerRight}><span className={s.record}>РЕКОРД <b>{best.toLocaleString('ru-RU')}</b></span><button className={s.iconButton} onClick={() => setMuted(v => !v)} aria-label={muted ? 'Включить звук' : 'Выключить звук'} title={muted ? 'Включить звук' : 'Выключить звук'}>{muted ? '♪̸' : '♪'}</button><button className={s.iconButton} aria-label="Как играть" onClick={() => { if (active) pause(); setHelp(v => !v) }}>?</button></div>
      </header>
      <section className={s.layout}>
        <div className={s.playColumn}>
          <div className={s.missionBar}><span><i className={s.statusDot} /> {active ? 'МИССИЯ АКТИВНА' : run.phase === 'paused' ? 'МИССИЯ ПРИОСТАНОВЛЕНА' : 'ДАЛЬНИЙ КОСМОС'}</span><span>СЕКТОР {String(wave(run)).padStart(2, '0')} <span className={s.dim}>/ ∞</span></span></div>
          <div ref={arena} className={`${s.arena} ${isStorm ? s.storm : ''} ${boss ? s.bossEncounter : ''} ${expanded ? s.expanded : ''}`} onPointerDown={pointer} onPointerMove={pointer} onPointerUp={() => { input.current.target = null }} onPointerCancel={() => { input.current.target = null }} aria-label="Игровое поле">
            <div className={s.starfield} style={{ animationPlayState: active ? 'running' : 'paused' }}>{stars.map((star, i) => <i key={i} style={star} />)}</div>
            <div className={s.planet} /><div className={s.orbitLine} />
            <div className={s.arenaHud}><div><span>СЧЁТ</span><strong>{String(run.score).padStart(5, '0')}</strong></div><div className={s.flightTime}><span>ВРЕМЯ ПОЛЁТА</span><strong>{timeLabel(run.time)}</strong></div></div>
            {active && !help && <div className={s.vitals}>
              <div className={`${s.vital} ${run.hp <= 30 ? s.critical : ''}`}>
                <div className={s.vitalLabel}><span>♥ КОРПУС</span><b>{Math.ceil(run.hp)} <small>/ 100</small></b></div>
                <div className={s.vitalTrack} role="progressbar" aria-label="Жизни корабля" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.ceil(run.hp)}>
                  <i className={s.hpFill} style={{ width: `${run.hp}%` }} />
                </div>
                <span className={s.vitalNote}>{run.hp <= 30 ? 'Критический урон — уклоняйтесь!' : run.droneLevel ? `Ремонт: ${run.rechargeDelay > 0 ? `через ${Math.ceil(run.rechargeDelay)} с` : `+${hullRecovery(run.droneLevel).toFixed(1)} / с`}` : 'Дроны не установлены'}</span>
              </div>
              <div className={s.vital}>
                <div className={s.vitalLabel}><span>◈ ЩИТ</span><b>{Math.floor(run.shield)} <small>/ {shieldCapacity(run.shieldLevel) || '—'}</small></b></div>
                <div className={s.vitalTrack} role="progressbar" aria-label="Заряд щита" aria-valuemin={0} aria-valuemax={shieldCapacity(run.shieldLevel) || 1} aria-valuenow={Math.floor(run.shield)} aria-valuetext={run.shieldLevel ? `${Math.floor(run.shield)} из ${shieldCapacity(run.shieldLevel)}` : 'Щит не установлен'}>
                  <i className={s.shieldFill} style={{ width: `${run.shieldLevel ? run.shield / shieldCapacity(run.shieldLevel) * 100 : 0}%` }} />
                </div>
                <span className={s.vitalNote}>{run.shieldLevel ? run.rechargeDelay > 0 ? `Зарядка через ${Math.ceil(run.rechargeDelay)} с` : 'Автоматическая зарядка' : 'Щит не установлен'}</span>
              </div>
              <span className={s.vitalMoney}>{run.money} ₽</span>
            </div>}
            {active && !boss && <div className={`${s.stormLabel} ${isStorm ? s.warning : ''}`}>{boss ? 'БОСС · СТРАЖ ОРБИТЫ' : isStorm ? '☄ АСТЕРОИДНОЕ ПОЛЕ · УКЛОНЯЙТЕСЬ' : `ДО АСТЕРОИДОВ ${Math.ceil(35 - encounterTime(run) % 44)} С`}</div>}
            {active && boss && <div className={s.bossHealth}>
              <div><span>СТРАЖ · {run.bossCycle}</span><b>{Math.max(0, boss.hp ?? 0)} / {boss.maxHp}</b></div>
              <div role="progressbar" aria-label="Прочность босса" aria-valuemin={0} aria-valuemax={boss.maxHp} aria-valuenow={Math.max(0, boss.hp ?? 0)}><i style={{ width: `${(boss.hp ?? 0) / (boss.maxHp ?? 1) * 100}%` }} /></div>
            </div>}
            {run.entities.map(e => {
              if (e.kind === 'bullet' || e.kind === 'hostile') return <i key={e.id} className={e.kind === 'bullet' ? `${s.bullet} ${e.power === 2 ? s.plasma : ''}` : s.hostile} style={{ left: e.x, top: e.y }} />
              if (e.kind === 'weapon') return <button key={e.id} className={s.weaponDrop} style={{ left: e.x, top: e.y }} aria-label="Подобрать улучшение оружия" disabled={!active} onPointerDown={event => { event.stopPropagation(); pickWeapon(e.id) }} onClick={event => { if (event.detail === 0) pickWeapon(e.id) }}><b>W</b><span>↑</span></button>
              if (e.kind === 'boss') return <img key={e.id} className={s.boss} src={bossImage} alt="Босс — Страж орбиты" style={{ left: e.x, top: e.y }} draggable={false} />
              if (e.kind === 'coin') return <button key={e.id} className={s.coin} style={{ left: e.x, top: e.y }} aria-label="Собрать 10 рублей" disabled={!active} onPointerDown={event => { event.stopPropagation(); collectCoin(e.id) }} onClick={event => { if (event.detail === 0) collectCoin(e.id) }}><img src={coin} alt="" /></button>
              return <div key={e.id} className={s.target} style={{ left: e.x, top: e.y }}>
                <img className={e.kind === 'enemy' ? s.enemy : s.asteroid} src={e.kind === 'enemy' ? enemy : asteroid} alt={e.kind === 'enemy' ? 'Вражеский корабль' : 'Астероид'} draggable={false} />
                <div className={s.targetHp} aria-label={`Прочность: ${e.hp} из ${e.maxHp}`}><i style={{ width: `${(e.hp ?? 1) / (e.maxHp ?? 1) * 100}%` }} /></div>
              </div>
            })}
            <div className={`${s.ship} ${run.invincible > 0 ? s.hit : ''}`} style={{ left: run.x, top: run.y }}>
              {run.shield > 1 && <div className={s.shieldBubble} style={{ opacity: .3 + run.shield / shieldCapacity(run.shieldLevel) * .7 }} />}
              {run.droneLevel > 0 && <><img className={s.droneLeft} src={drone} alt="" /><img className={s.droneRight} src={drone} alt="" /></>}
              <div className={s.exhaust} style={{ animationPlayState: active ? 'running' : 'paused' }} /><img src={ship} alt="Ваш корабль" draggable={false} />
            </div>
            {run.effects.map(e => <span key={e.id} className={s.effect} style={{ left: e.x, top: e.y, opacity: Math.min(1, e.life * 3) }}>{e.label}</span>)}
            {(run.phase !== 'playing' || help) && <div className={s.overlay}><div className={s.dialog}>
              <span className={s.eyebrow}>{help ? 'БОРТОВОЙ СПРАВОЧНИК' : run.phase === 'over' ? 'СВЯЗЬ ПОТЕРЯНА' : run.phase === 'paused' ? 'МОЖНО ВЫДОХНУТЬ' : 'АРКАДНЫЙ КОСМИЧЕСКИЙ ШУТЕР'}</span>
              <h1>{help ? <>Ваш корабль.<br />Ваши правила.</> : run.phase === 'over' ? 'Хороший полёт.' : run.phase === 'paused' ? 'На паузе.' : <>За пределами<br /><em>знакомых орбит.</em></>}</h1>
              <p>{help ? 'Двигайтесь с помощью WASD или стрелок. На телефоне ведите пальцем по полю. Орудие стреляет раз в 0,55 с. Враги выдерживают 3 попадания и стреляют в вашу позицию. Астероидам нужно 8 попаданий — их проще облететь. Красные снаряды нельзя сбить. Щит и дроны восстанавливаются только после 6 с без урона. Из врагов с шансом 20% выпадает W: двойной выстрел → тройной веер → плазма. Подберите кораблём или нажатием. Урон, даже по щиту, сбрасывает оружие. После астероидов появляется босс с тремя пушками. Покупайте модули кнопками внизу поля. Пробел / P / Esc — пауза.' : run.phase === 'over' ? `Счёт ${run.score} · ${timeLabel(run.time)} в космосе · Сектор ${wave(run)}. Улучшайте защиту, чтобы продержаться дольше.` : run.phase === 'paused' ? 'Купите модули кнопками внизу поля или продолжите полёт.' : 'Пилотируйте. Собирайте. Улучшайте.\nКак далеко вы сможете зайти?'}</p>
              <button className={s.primary} disabled={!help && run.phase !== 'paused' && assetsState === 'loading'} onClick={() => { if (help) setHelp(false); else if (run.phase === 'paused') pause(); else if (assetsState === 'error') retryAssets(); else start() }}>{help ? 'Всё понятно' : run.phase === 'paused' ? 'Продолжить полёт' : assetsState === 'loading' ? 'Загрузка кораблей…' : assetsState === 'error' ? 'Повторить загрузку' : run.phase === 'over' ? 'Ещё один полёт' : 'Начать полёт'} <span>↗</span></button>
              {assetsState === 'error' && <p className={s.assetError} role="alert">Не удалось загрузить игровые изображения. Проверьте соединение и повторите загрузку.</p>}
              {run.phase === 'ready' && !help && <div className={s.introHint}><kbd>W A S D</kbd><span>или стрелки · на телефоне — касание<br />автострельба · уклоняйтесь от красных снарядов</span></div>}
              {run.phase === 'over' && !help && <span className={s.result}>Целей уничтожено: {run.kills} · Монет собрано: {run.collected}</span>}
            </div></div>}
            {active && <div className={s.weaponStatus} aria-label={`Оружие: ${weaponNames[run.weaponLevel]}`}><span>W {run.weaponLevel}/3</span> {weaponNames[run.weaponLevel]}</div>}
            <div className={s.moduleDock} onPointerDown={event => event.stopPropagation()} aria-label="Улучшения корабля">
              {(['shield', 'drone'] as const).map(kind => {
                const level = kind === 'shield' ? run.shieldLevel : run.droneLevel
                const title = kind === 'shield' ? 'Щит' : 'Дроны'
                const available = (active || run.phase === 'paused') && level < 5 && run.money >= cost(level)
                return <button key={kind} className={s.dockButton} disabled={!available} onClick={() => buy(kind)} aria-label={`Улучшить ${title}: ${level >= 5 ? 'максимальный уровень' : cost(level) + ' рублей'}`} title={kind === 'shield' ? 'Ёмкость +15. Регенерация после 6 с без урона.' : 'Ремонт +0,6 ед./с после 6 с без урона.'}>
                  <img src={kind === 'shield' ? shield : drone} alt="" />
                  <span><strong>{title} <small>{level}/5</small></strong><span>{level >= 5 ? 'МАКС.' : `+ ${cost(level)} ₽`}</span></span>
                </button>
              })}
              <div className={s.dockStatus}><b>{run.money} ₽</b><span>{run.rechargeDelay > 0 ? `Ремонт через ${Math.ceil(run.rechargeDelay)} с` : 'Модули готовы'}</span></div>
            </div>
            <div className={s.fieldToolbar}>
              <button className={s.iconButton} onClick={() => void toggleFullscreen()} aria-label={fullscreen || expanded ? 'Выйти из полного экрана' : 'Полный экран'} title={fullscreen || expanded ? 'Выйти из полного экрана' : 'Полный экран'}>{fullscreen || expanded ? '↙' : '⛶'}</button>
              <button className={s.iconButton} onClick={pause} disabled={run.phase === 'ready' || run.phase === 'over' || help} aria-label={active ? 'Пауза' : 'Продолжить'}>{active ? 'Ⅱ' : '▷'}</button>
            </div>
            {screenNote && expanded && <span className={s.screenNote}>{screenNote}</span>}

          </div>
          <footer className={s.controls}><span><kbd>WASD</kbd> / <kbd>↑←↓→</kbd> движение</span><span><kbd>ПРОБЕЛ</kbd> пауза</span><span className={s.mouseHint}>↖ удерживайте мышь для движения</span></footer>
        </div>

      </section>
      <footer className={s.bottom}><span>МАЛЕНЬКИЙ КОРАБЛЬ. БОЛЬШОЙ КОСМОС.</span><span>БЕСКОНЕЧНЫЙ ПОЛЁТ <i>✳</i></span></footer>
    </main>
  )
}
