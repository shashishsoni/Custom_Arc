import * as THREE from 'three'
import {
  bodyFinishPreset,
  normalizeBodyFinishPreset,
  type BodyFinishPreset,
} from '@customarc/shared'
import { cloneMapForMesh } from '../interaction/uv-bias'

const NAME_HINT = /print|wrap|band|decal|custom|art|label|surface/i
const DEFAULT_PRINTABLE_PRESET = bodyFinishPreset('ceramic')

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

function disposeMaterial(mat: THREE.Material | THREE.Material[]) {
  const list = Array.isArray(mat) ? mat : [mat]
  for (const m of list) m.dispose()
}

function materialMap(mat: THREE.Material | THREE.Material[]): THREE.Texture | null {
  const m = Array.isArray(mat) ? mat[0] : mat
  if (
    m instanceof THREE.MeshStandardMaterial ||
    m instanceof THREE.MeshPhysicalMaterial
  ) {
    return m.map
  }
  return null
}

/** Body: full PBR including glass transmission. */
function bodyMaterialFromPreset(
  preset: BodyFinishPreset,
  cheapGlass: boolean,
): THREE.MeshPhysicalMaterial {
  const p = normalizeBodyFinishPreset(preset)
  let transmission = p.transmission ?? 0
  if (cheapGlass && transmission > 0) transmission = 0

  return new THREE.MeshPhysicalMaterial({
    color: p.color,
    metalness: p.metalness,
    roughness: p.roughness,
    clearcoat: p.clearcoat ?? 0,
    clearcoatRoughness: p.clearcoatRoughness ?? 0,
    transmission,
    ior: p.ior ?? 1.5,
    thickness: transmission > 0 ? (p.thickness ?? 0.04) : 0,
    envMapIntensity: p.envMapIntensity ?? 1,
    opacity: 1,
    side: THREE.DoubleSide,
  })
}

/**
 * Printable band: same finish look (roughness / metalness / clearcoat / env)
 * but never transmits — wrap art must stay readable. Map keeps toneMapped off.
 */
function printableMaterialFromPreset(
  preset: BodyFinishPreset,
  map: THREE.Texture | null,
): THREE.MeshPhysicalMaterial {
  const p = normalizeBodyFinishPreset(preset)
  return new THREE.MeshPhysicalMaterial({
    color: map ? 0xffffff : p.color,
    map,
    transparent: Boolean(map),
    metalness: p.metalness,
    roughness: p.roughness,
    clearcoat: p.clearcoat ?? 0,
    clearcoatRoughness: p.clearcoatRoughness ?? 0,
    transmission: 0,
    thickness: 0,
    ior: p.ior ?? 1.5,
    envMapIntensity: p.envMapIntensity ?? 1,
    opacity: 1,
    side: THREE.DoubleSide,
    toneMapped: !map,
  })
}

/** Printable bases with finish substrate (wrap map binds later). */
export function paintPrintableBases(root: THREE.Object3D, preset: BodyFinishPreset) {
  for (const mesh of findPrintableMeshes(root)) {
    disposeMaterial(mesh.material)
    mesh.material = printableMaterialFromPreset(preset, null)
  }
}

/**
 * Mug finish on body + printable band.
 * Printable keeps any existing wrap map; transmission never applied to the band.
 * Mug-only — callers must gate on blank.category === 'mug'.
 */
export function applyBodyFinish(
  root: THREE.Object3D,
  preset: BodyFinishPreset,
  opts?: { cheapGlass?: boolean },
) {
  const printables = new Set(findPrintableMeshes(root))
  const bodyMat = bodyMaterialFromPreset(preset, opts?.cheapGlass === true)

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    if (printables.has(obj)) {
      const map = materialMap(obj.material)
      disposeMaterial(obj.material)
      obj.material = printableMaterialFromPreset(preset, map)
      return
    }
    disposeMaterial(obj.material)
    obj.material = bodyMat.clone()
  })
  bodyMat.dispose()
}

/** Phone-case / legacy: flat white on every mesh. */
export function paintMugWhite(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    disposeMaterial(obj.material)
    obj.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  })
}

/** Bind design map with finish substrate + UV bias (clone so zones don’t fight). */
export function bindPrintableTexture(
  mesh: THREE.Mesh,
  source: THREE.Texture,
  preset: BodyFinishPreset = DEFAULT_PRINTABLE_PRESET,
) {
  const prev = mesh.material
  const map = cloneMapForMesh(source, mesh.name)
  const mat = printableMaterialFromPreset(preset, map)
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
