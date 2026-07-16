import { loadMug } from './products'
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

/** Deep interface: mount once, dispose once. No React props surface. */
export type HeroSceneHandle = {
  dispose: () => void
}

type HeroSceneOptions = {
  onReady?: () => void
  onError?: () => void
}

export function mountHeroScene(
  host: HTMLElement,
  { onReady, onError }: HeroSceneOptions = {},
): HeroSceneHandle {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scene = createScene()
  const camera = createCamera()
  const renderer = createRenderer(host)
  const pmrem = bindEnvironment(renderer, scene)
  addStudioLighting(scene)
  addContactGround(scene)

  let disposed = false
  let mug: Awaited<ReturnType<typeof loadMug>> | null = null
  void loadMug()
    .then((model) => {
      if (disposed) {
        disposeObject3D(model)
        return
      }
      mug = model
      scene.add(model)
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
    if (!reduceMotion && mug) mug.rotation.y += 0.0012
    renderer.render(scene, camera)
  }
  tick()

  return {
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      disposeIdle()
      pmrem.dispose()
      disposeObject3D(scene)
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
