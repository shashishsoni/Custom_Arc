import * as THREE from 'three'

/** Per-zone UV correction — body wrap is mirrored from outside; handle is upside-down. */
export type UvBias = { flipU: boolean; flipV: boolean }

export function uvBiasForMesh(name: string): UvBias {
  const n = name.toLowerCase()
  if (/handle/.test(n)) return { flipU: true, flipV: true }
  const isBody =
    n === 'printable' || (n.startsWith('printable') && !/bottom|base|lid/.test(n))
  return { flipU: isBody, flipV: false }
}

/** Clone map transforms so each printable can diverge without sharing offset/repeat. */
export function cloneMapForMesh(source: THREE.Texture, meshName: string): THREE.Texture {
  const map = source.clone()
  const { flipU, flipV } = uvBiasForMesh(meshName)
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.repeat.set(flipU ? -1 : 1, flipV ? -1 : 1)
  map.offset.set(flipU ? 1 : 0, flipV ? 1 : 0)
  map.needsUpdate = true
  return map
}
