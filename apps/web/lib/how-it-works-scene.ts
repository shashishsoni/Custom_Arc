import * as THREE from 'three'
import { loadMug } from '@/lib/hero-scene/products'
import {
  addContactGround,
  addStudioLighting,
  bindEnvironment,
  createCamera,
  createRenderer,
  createScene,
  disposeObject3D,
  fitRenderer,
} from '@/lib/hero-scene/studio'

export type HowItWorksSceneHandle = {
  setProgress: (progress: number) => void
  dispose: () => void
}

type SceneOptions = {
  onReady?: () => void
  onError?: () => void
}

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1)

function range(progress: number, start: number, end: number): number {
  return THREE.MathUtils.smoothstep(progress, start, end)
}

function createArtworkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable')

  const gradient = context.createLinearGradient(0, 0, 1024, 1024)
  gradient.addColorStop(0, '#fffaf9')
  gradient.addColorStop(1, '#f3e8eb')
  context.fillStyle = gradient
  context.fillRect(0, 0, 1024, 1024)

  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = '#c45c6a'
  context.lineWidth = 76
  context.beginPath()
  context.moveTo(-80, 760)
  context.bezierCurveTo(210, 410, 470, 900, 1110, 310)
  context.stroke()

  context.strokeStyle = '#4a5568'
  context.lineWidth = 42
  context.beginPath()
  context.moveTo(-60, 870)
  context.bezierCurveTo(320, 520, 580, 760, 1080, 180)
  context.stroke()

  const flowers = [
    [250, 290, 76],
    [510, 410, 96],
    [790, 250, 68],
    [730, 650, 82],
  ] as const

  for (const [x, y, radius] of flowers) {
    context.fillStyle = 'rgba(196, 92, 106, 0.82)'
    for (let petal = 0; petal < 5; petal += 1) {
      const angle = (petal / 5) * Math.PI * 2
      context.beginPath()
      context.arc(
        x + Math.cos(angle) * radius * 0.62,
        y + Math.sin(angle) * radius * 0.62,
        radius * 0.44,
        0,
        Math.PI * 2,
      )
      context.fill()
    }
    context.fillStyle = '#fff4cf'
    context.beginPath()
    context.arc(x, y, radius * 0.28, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 4
  return texture
}

function cloneMaterials(
  root: THREE.Object3D,
  configure?: (material: THREE.Material) => void,
): THREE.Material[] {
  const materials: THREE.Material[] = []

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const source = Array.isArray(object.material) ? object.material : [object.material]
    const cloned = source.map((material) => {
      const next = material.clone()
      next.transparent = true
      configure?.(next)
      materials.push(next)
      return next
    })
    object.material = Array.isArray(object.material) ? cloned : cloned[0]
  })

  return materials
}

function createShippingBox(): {
  group: THREE.Group
  lid: THREE.Group
  materials: THREE.MeshStandardMaterial[]
} {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color: '#b98b63',
    roughness: 0.78,
    metalness: 0,
    transparent: true,
    opacity: 0,
  })
  const materials: THREE.MeshStandardMaterial[] = []

  const addPanel = (
    size: [number, number, number],
    position: [number, number, number],
    target: THREE.Group = group,
  ) => {
    const panelMaterial = material.clone()
    materials.push(panelMaterial)
    const panel = new THREE.Mesh(new THREE.BoxGeometry(...size), panelMaterial)
    panel.position.set(...position)
    panel.castShadow = true
    panel.receiveShadow = true
    target.add(panel)
  }

  addPanel([3.2, 0.12, 3], [0, -1.05, 0])
  addPanel([3.2, 1.55, 0.12], [0, -0.34, 1.44])
  addPanel([3.2, 1.55, 0.12], [0, -0.34, -1.44])
  addPanel([0.12, 1.55, 2.8], [-1.54, -0.34, 0])
  addPanel([0.12, 1.55, 2.8], [1.54, -0.34, 0])

  const lid = new THREE.Group()
  lid.position.set(0, 0.44, -1.44)
  lid.rotation.x = -Math.PI / 2
  addPanel([3.2, 0.12, 2.9], [0, 0, 1.42], lid)
  group.add(lid)

  return { group, lid, materials }
}

function setOpacity(materials: THREE.Material[], opacity: number): void {
  for (const material of materials) {
    material.opacity = clamp01(opacity)
    material.visible = opacity > 0.002
  }
}

export function mountHowItWorksScene(
  host: HTMLElement,
  { onReady, onError }: SceneOptions = {},
): HowItWorksSceneHandle {
  const scene = createScene()
  const camera = createCamera()
  camera.position.set(0.15, 1.2, 5.8)
  const renderer = createRenderer(host)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.75))
  const pmrem = bindEnvironment(renderer, scene)
  addStudioLighting(scene)
  addContactGround(scene)

  const artworkTexture = createArtworkTexture()
  const productRoot = new THREE.Group()
  scene.add(productRoot)

  const { group: box, lid, materials: boxMaterials } = createShippingBox()
  box.position.y = -3
  scene.add(box)

  const artworkCardMaterial = new THREE.MeshBasicMaterial({
    map: artworkTexture,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  })
  const artworkCard = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.42), artworkCardMaterial)
  artworkCard.position.set(-2.1, 0.55, 0.5)
  artworkCard.rotation.set(-0.08, 0.22, -0.08)
  scene.add(artworkCard)

  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: '#c45c6a',
    transparent: true,
    opacity: 0,
  })
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.012, 8, 128), orbitMaterial)
  orbit.rotation.x = Math.PI / 2.35
  orbit.position.y = 0.1
  productRoot.add(orbit)

  let disposed = false
  let progress = 0
  let blankMaterials: THREE.Material[] = []
  let designedMaterials: THREE.Material[] = []

  void loadMug()
    .then((blank) => {
      if (disposed) {
        disposeObject3D(blank)
        return
      }

      blankMaterials = cloneMaterials(blank)
      const designed = blank.clone(true)
      designed.scale.multiplyScalar(1.004)
      designedMaterials = cloneMaterials(designed, (material) => {
        material.depthWrite = false
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          material.map = artworkTexture
          material.color.set('#ffffff')
          material.roughness = 0.48
          material.needsUpdate = true
        }
        material.opacity = 0
      })

      productRoot.add(blank, designed)
      updateScene(progress)
      onReady?.()
    })
    .catch(() => {
      if (!disposed) onError?.()
    })

  function updateScene(nextProgress: number): void {
    progress = clamp01(nextProgress)

    const designReveal = range(progress, 0.2, 0.48)
    const artworkFlight = range(progress, 0.16, 0.43)
    const pack = range(progress, 0.61, 0.81)
    const productHide = range(progress, 0.81, 0.9)
    const lidClose = range(progress, 0.79, 0.92)
    const dispatch = range(progress, 0.91, 1)

    setOpacity(blankMaterials, (1 - designReveal * 0.66) * (1 - productHide))
    setOpacity(designedMaterials, designReveal * (1 - productHide))

    productRoot.rotation.y = -0.38 + progress * 1.55
    productRoot.position.y = -pack * 0.48
    productRoot.position.x = dispatch * 0.4
    const productScale = 1 - pack * 0.25
    productRoot.scale.setScalar(productScale)

    artworkCardMaterial.opacity = Math.sin(artworkFlight * Math.PI) * 0.9
    artworkCard.visible = artworkCardMaterial.opacity > 0.002
    artworkCard.position.x = THREE.MathUtils.lerp(-2.1, -0.3, artworkFlight)
    artworkCard.position.y = THREE.MathUtils.lerp(0.55, 0.12, artworkFlight)
    artworkCard.scale.setScalar(1 - artworkFlight * 0.62)
    artworkCard.rotation.y = THREE.MathUtils.lerp(0.22, -0.5, artworkFlight)

    orbitMaterial.opacity = Math.sin(range(progress, 0.17, 0.58) * Math.PI) * 0.46
    orbit.rotation.z = progress * Math.PI * 1.5

    setOpacity(boxMaterials, range(progress, 0.58, 0.72))
    box.position.y = THREE.MathUtils.lerp(-3, -0.18, range(progress, 0.58, 0.78))
    box.position.x = dispatch * 1.1
    box.rotation.y = dispatch * 0.22
    lid.rotation.x = THREE.MathUtils.lerp(-Math.PI / 2, 0, lidClose)

    camera.position.x = dispatch * 0.45
    camera.lookAt(dispatch * 0.45, 0.05, 0)
  }

  const resize = () => fitRenderer(host, camera, renderer)
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  resize()

  let inView = true
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry) inView = entry.isIntersecting
    },
    { rootMargin: '20%' },
  )
  visibilityObserver.observe(host)

  let frame = 0
  const tick = () => {
    frame = requestAnimationFrame(tick)
    if (!inView) return
    renderer.render(scene, camera)
  }
  tick()

  return {
    setProgress: updateScene,
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      pmrem.dispose()
      artworkTexture.dispose()
      disposeObject3D(scene)
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
