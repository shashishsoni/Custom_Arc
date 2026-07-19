import * as THREE from 'three'

const NAME_HINT = /print|wrap|band|decal|custom|art|label|surface/i

/** All meshes meant to receive the design texture (body / handle / bottom). */
export function findPrintableMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const named: THREE.Mesh[] = []
  let largest: THREE.Mesh | null = null
  let best = 0

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.geometry?.getAttribute('uv')) return
    if (NAME_HINT.test(obj.name) || obj.name.startsWith('printable')) {
      named.push(obj)
    }
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

  if (named.length) return named
  return largest ? [largest] : []
}

/** Primary wrap surface for raycast drag — prefer exact `printable`. */
export function findPrintableMesh(root: THREE.Object3D): THREE.Mesh | null {
  const all = findPrintableMeshes(root)
  return all.find((m) => m.name === 'printable' || m.name.endsWith('printable')) ?? all[0] ?? null
}

/** Bind CanvasTexture to one printable material; toneMapped off so art stays sRGB-true. */
export function bindPrintableTexture(mesh: THREE.Mesh, map: THREE.Texture) {
  const prev = mesh.material
  const base = Array.isArray(prev) ? prev[0] : prev
  const mat = (base?.clone() ?? new THREE.MeshStandardMaterial()) as THREE.MeshStandardMaterial

  mat.map = map
  mat.toneMapped = false
  mat.side = THREE.DoubleSide
  mat.transparent = true
  mat.needsUpdate = true
  mesh.material = mat

  return () => {
    mat.dispose()
    mesh.material = prev
  }
}

/** Bind the same design texture to every printable zone. */
export function bindPrintableTextures(meshes: THREE.Mesh[], map: THREE.Texture) {
  const unbinds = meshes.map((m) => bindPrintableTexture(m, map))
  return () => unbinds.forEach((u) => u())
}

export function normalizeModel(root: THREE.Object3D, targetHeight = 2.2) {
  const box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  root.position.sub(center)
  if (size.y > 0) root.scale.setScalar(targetHeight / size.y)
}
