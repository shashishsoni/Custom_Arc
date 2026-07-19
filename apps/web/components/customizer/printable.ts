import * as THREE from 'three'
import { cloneMapForMesh } from './uv-bias'

const NAME_HINT = /print|wrap|band|decal|custom|art|label|surface/i

/** Print zones: named printable* / wrap meshes (else largest UV mesh). */
export function findPrintableMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const named: THREE.Mesh[] = []
  let largest: THREE.Mesh | null = null
  let best = 0

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.geometry?.getAttribute('uv')) return
    if (NAME_HINT.test(obj.name) || obj.name.startsWith('printable')) named.push(obj)

    obj.geometry.computeBoundingBox()
    const box = obj.geometry.boundingBox
    if (!box) return
    const s = box.getSize(new THREE.Vector3())
    const area = s.x * s.y + s.y * s.z + s.z * s.x
    if (area > best) {
      best = area
      largest = obj
    }
  })

  return named.length ? named : largest ? [largest] : []
}

/** Ceramic look — solid white, no maps. */
export function paintMugWhite(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    obj.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })
  })
}

/** Bind design map with that mesh’s UV bias (clone so zones don’t fight). */
export function bindPrintableTexture(mesh: THREE.Mesh, source: THREE.Texture) {
  const prev = mesh.material
  const map = cloneMapForMesh(source, mesh.name)
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map,
    transparent: true,
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  mesh.material = mat
  return () => {
    mat.dispose()
    map.dispose()
    mesh.material = prev
  }
}

export function normalizeModel(root: THREE.Object3D, targetHeight = 2.2) {
  const box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  root.position.sub(center)
  if (size.y > 0) root.scale.setScalar(targetHeight / size.y)
}
