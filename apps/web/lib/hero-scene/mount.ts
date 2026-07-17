import * as THREE from 'three'
import { PRODUCTS, SLIDE_MS, SLIDE_X, SWAP_MS, loadProduct } from './products'
import {
  addContactGround,
  addStudioLighting,
  bindEnvironment,
  createCamera,
  createOrbit,
  createRenderer,
  createScene,
  disposeObject3D,
  fitRenderer,
} from './studio'

export type HeroSceneHandle = { dispose: () => void }

type Opts = { onReady?: () => void; onError?: () => void }

export function mountHeroScene(host: HTMLElement, { onReady, onError }: Opts = {}): HeroSceneHandle {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scene = createScene()
  const camera = createCamera()
  const renderer = createRenderer(host)
  const pmrem = bindEnvironment(renderer, scene)
  addStudioLighting(scene)
  addContactGround(scene)

  let disposed = false
  let i = 0
  let active: THREE.Group | null = null
  let slide: { out: THREE.Group; inn: THREE.Group; t0: number } | null = null
  let timer = 0
  const models: THREE.Group[] = []

  const hardSwap = (next: THREE.Group) => {
    if (active) scene.remove(active)
    next.position.x = 0
    scene.add(next)
    active = next
  }

  const slideTo = (next: THREE.Group) => {
    if (!active || reduceMotion) {
      hardSwap(next)
      return
    }
    next.position.x = SLIDE_X
    scene.add(next)
    slide = { out: active, inn: next, t0: performance.now() }
    active = next
  }

  void Promise.all(PRODUCTS.map(loadProduct))
    .then((loaded) => {
      if (disposed) return loaded.forEach(disposeObject3D)
      models.push(...loaded)
      hardSwap(models[0]!)
      if (!reduceMotion) timer = window.setInterval(() => {
        i = (i + 1) % models.length
        slideTo(models[i]!)
      }, SWAP_MS)
      onReady?.()
    })
    .catch(() => {
      if (!disposed) onError?.()
    })

  const { controls, disposeIdle } = createOrbit(camera, renderer.domElement, reduceMotion)
  const resize = () => fitRenderer(host, camera, renderer)
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()

  let frame = 0
  const tick = () => {
    frame = requestAnimationFrame(tick)
    controls.update()
    if (slide) {
      const t = Math.min(1, (performance.now() - slide.t0) / SLIDE_MS)
      const e = 1 - (1 - t) ** 3
      slide.out.position.x = -SLIDE_X * e
      slide.inn.position.x = SLIDE_X * (1 - e)
      if (t >= 1) {
        scene.remove(slide.out)
        slide.out.position.x = 0
        slide = null
      }
    } else if (!reduceMotion && active) {
      active.rotation.y += 0.0012
    }
    renderer.render(scene, camera)
  }
  tick()

  return {
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      window.clearInterval(timer)
      observer.disconnect()
      disposeIdle()
      pmrem.dispose()
      disposeObject3D(scene)
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
