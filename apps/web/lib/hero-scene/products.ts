import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const DISPLAY_HEIGHT = 2.25

export type HeroProductId = 'mug' | 'mobile'

const URLS: Record<HeroProductId, string> = {
  mug: '/model/mug.glb',
  mobile: '/model/mobile.glb',
}

export const PRODUCTS: HeroProductId[] = ['mug', 'mobile']
export const SWAP_MS = 4500
export const SLIDE_MS = 550
export const SLIDE_X = 4.2

export async function loadProduct(id: HeroProductId): Promise<THREE.Group> {
  const { scene } = await new GLTFLoader().loadAsync(URLS[id])
  const group = new THREE.Group()
  const bounds = new THREE.Box3().setFromObject(scene)
  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())
  if (size.y <= 0) throw new Error(`Hero model "${id}" has no visible geometry`)

  scene.position.sub(center)
  scene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  group.add(scene)
  group.scale.setScalar(DISPLAY_HEIGHT / size.y)
  group.position.y = 0.3
  return group
}

export const loadMug = () => loadProduct('mug')
