import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { cssVar } from '@/lib/css-var'

const MAX_DPR = 2
const IDLE_RESUME_MS = 2800

export function createRenderer(host: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  host.appendChild(renderer.domElement)
  return renderer
}

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40)
  camera.position.set(0.2, 1.35, 5.2)
  return camera
}

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene()
  const fogColor = new THREE.Color(cssVar('--accent-warm')).lerp(
    new THREE.Color(cssVar('--bg')),
    0.72,
  )
  scene.fog = new THREE.Fog(fogColor, 8, 16)
  return scene
}

export function addStudioLighting(scene: THREE.Scene): void {
  scene.add(new THREE.HemisphereLight('#ffffff', cssVar('--border'), 0.55))

  const key = new THREE.DirectionalLight('#ffffff', 1.15)
  key.position.set(3.5, 6, 4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 20
  scene.add(key)

  const fill = new THREE.DirectionalLight('#ffffff', 0.45)
  fill.position.set(-4, 2, -2)
  scene.add(fill)
}

export function addContactGround(scene: THREE.Scene): THREE.Mesh {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64),
    new THREE.ShadowMaterial({ opacity: 0.18 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.05
  ground.receiveShadow = true
  scene.add(ground)
  return ground
}

export function bindEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): THREE.PMREMGenerator {
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  return pmrem
}

export function createOrbit(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  reduceMotion: boolean,
): { controls: OrbitControls; disposeIdle: () => void } {
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 3.5
  controls.maxDistance = 8
  controls.target.set(0.15, 0.15, 0)
  controls.autoRotate = !reduceMotion
  controls.autoRotateSpeed = 0.55

  let idleTimer = 0
  const onStart = () => {
    controls.autoRotate = false
    window.clearTimeout(idleTimer)
    idleTimer = window.setTimeout(() => {
      if (!reduceMotion) controls.autoRotate = true
    }, IDLE_RESUME_MS)
  }
  controls.addEventListener('start', onStart)

  return {
    controls,
    disposeIdle: () => {
      controls.removeEventListener('start', onStart)
      window.clearTimeout(idleTimer)
      controls.dispose()
    },
  }
}

export function fitRenderer(
  host: HTMLElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
): void {
  const { clientWidth: w, clientHeight: h } = host
  if (w < 1 || h < 1) return
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    obj.geometry.dispose()
    const material = obj.material
    if (Array.isArray(material)) material.forEach((m) => m.dispose())
    else material.dispose()
  })
}
