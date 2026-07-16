import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const MUG_MODEL_URL = '/model/mug.glb'
const DISPLAY_HEIGHT = 2.25

/** Load and normalize the supplied mug regardless of its authored unit scale. */
export async function loadMug(): Promise<THREE.Group> {
  const { scene } = await new GLTFLoader().loadAsync(MUG_MODEL_URL)
  const group = new THREE.Group()
  const bounds = new THREE.Box3().setFromObject(scene)
  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())

  if (size.y <= 0) throw new Error('The mug model has no visible geometry')

  scene.position.sub(center)
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.castShadow = true
    object.receiveShadow = true
  })

  group.add(scene)
  group.scale.setScalar(DISPLAY_HEIGHT / size.y)
  group.position.y = 0.3
  group.rotation.set(0, 0, 0)
  return group
}
