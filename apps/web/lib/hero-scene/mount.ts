import { createArcWrapTexture } from './arc-wrap-texture'
import { createProductSet } from './products'
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

export function mountHeroScene(host: HTMLElement): HeroSceneHandle {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scene = createScene()
  const camera = createCamera()
  const renderer = createRenderer(host)
  const pmrem = bindEnvironment(renderer, scene)
  addStudioLighting(scene)
  addContactGround(scene)

  const wrap = createArcWrapTexture()
  const products = createProductSet(wrap)
  scene.add(products)

  const { controls, disposeIdle } = createOrbit(camera, renderer.domElement, reduceMotion)

  const resize = () => fitRenderer(host, camera, renderer)
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()

  let frame = 0
  const tick = () => {
    frame = requestAnimationFrame(tick)
    controls.update()
    if (!reduceMotion) products.rotation.y += 0.0012
    renderer.render(scene, camera)
  }
  tick()

  return {
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      disposeIdle()
      wrap.dispose()
      pmrem.dispose()
      disposeObject3D(scene)
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
