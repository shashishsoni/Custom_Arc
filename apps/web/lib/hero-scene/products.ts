import * as THREE from 'three'
import { cssVar } from '@/lib/css-var'

function standard(opts: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(opts)
}

function enableShadow(mesh: THREE.Mesh, cast = true) {
  mesh.castShadow = cast
  mesh.receiveShadow = cast
  return mesh
}

export function createMug(wrap: THREE.Texture): THREE.Group {
  const group = new THREE.Group()
  const ceramic = standard({ color: cssVar('--accent'), roughness: 0.35, metalness: 0.02 })
  const body = standard({ map: wrap, roughness: 0.42, metalness: 0.04 })

  group.add(enableShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.68, 1.55, 64), body)))

  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.62, 1.45, 48, 1, true), ceramic)
  inner.position.y = 0.02
  group.add(inner)

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 12, 48), ceramic)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.78
  group.add(rim)

  const handle = enableShadow(
    new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 16, 48, Math.PI * 1.15), ceramic),
  )
  handle.rotation.y = Math.PI / 2
  handle.position.set(0.78, 0.05, 0)
  group.add(handle)

  group.position.set(-0.55, -0.15, 0.35)
  group.rotation.set(0.18, -0.55, -0.12)
  group.scale.setScalar(1.05)
  return group
}

export function createPhoneCase(wrap: THREE.Texture): THREE.Group {
  const group = new THREE.Group()
  const shell = standard({ color: cssVar('--bg-card'), roughness: 0.55, metalness: 0.05 })
  const print = standard({ map: wrap, roughness: 0.48, metalness: 0.04 })
  const lensMat = standard({ color: cssVar('--accent-2'), roughness: 0.3, metalness: 0.4 })

  group.add(enableShadow(new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.9, 0.12), print)))

  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.08), shell)
  cam.position.set(-0.22, 0.62, 0.1)
  group.add(cam)

  for (const [dx, dy] of [
    [-0.08, 0.08],
    [0.08, 0.08],
    [-0.08, -0.08],
  ] as const) {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 24), lensMat)
    lens.rotation.x = Math.PI / 2
    lens.position.set(-0.22 + dx, 0.62 + dy, 0.14)
    group.add(lens)
  }

  group.position.set(1.05, 0.55, -0.55)
  group.rotation.set(0.35, -0.95, 0.25)
  group.scale.setScalar(0.95)
  return group
}

export function createProductSet(wrap: THREE.Texture): THREE.Group {
  const set = new THREE.Group()
  set.add(createMug(wrap), createPhoneCase(wrap))
  return set
}
