import * as THREE from 'three'

const NAME_HINT = /print|wrap|band|decal|custom|art|label|surface/i

/** Prefer a named printable mesh; else largest UV mesh (marketing GLBs lack a dedicated island yet). */
export function findPrintableMesh(root: THREE.Object3D): THREE.Mesh | null {
  let named: THREE.Mesh | null = null
  let largest: THREE.Mesh | null = null
  let best = 0

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.geometry?.getAttribute('uv')) return
    if (!named && NAME_HINT.test(obj.name)) named = obj

    obj.geometry.computeBoundingBox()
    const box = obj.geometry.boundingBox
    if (!box) return
    const size = box.getSize(new THREE.Vector3())
    const area = size.x * size.y + size.y * size.z + size.z * size.x
    if (area > best) {
      best = area
      largest = obj
    }
  })

  return named ?? largest
}

/** Bind CanvasTexture to the printable material; toneMapped off so art stays sRGB-true. */
export function bindPrintableTexture(mesh: THREE.Mesh, map: THREE.Texture) {
  const prev = mesh.material
  const base = Array.isArray(prev) ? prev[0] : prev
  const mat = (base?.clone() ?? new THREE.MeshStandardMaterial()) as THREE.MeshStandardMaterial

  mat.map = map
  mat.toneMapped = false
  mat.needsUpdate = true
  mesh.material = mat

  return () => {
    mat.dispose()
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
