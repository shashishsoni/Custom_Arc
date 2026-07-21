/** Declarative 3D view framing for the customizer (r3f / drei). Approach B:
 * split `camera` (lens / orbit) from `model` (pose / scale) — never overload FOV as scale.
 */

export type Vec3 = [number, number, number]

export type CustomizerCamera = {
  /** Perspective FOV in degrees — larger = zoomed out. */
  fov?: number
  /** Camera world position. */
  position?: Vec3
  /** Orbit look-at target. */
  target?: Vec3
  minDistance?: number
  maxDistance?: number
}

export type CustomizerModelPose = {
  position?: Vec3
  /** Uniform model scale (not FOV). */
  scale?: number
  /** Euler rotation in radians. */
  rotation?: Vec3
}

export type CustomizerViewConfig = {
  camera: Required<CustomizerCamera>
  model: Required<CustomizerModelPose>
}

export const DEFAULT_VIEW: CustomizerViewConfig = {
  camera: {
    fov: 40,
    position: [-3.4, 0.35, 0],
    target: [0, 0, 0],
    minDistance: 1.6,
    maxDistance: 5,
  },
  model: {
    position: [0, 0, 0],
    scale: 1,
    rotation: [0, 0, 0],
  },
}

/** Per-blank framing presets (extend when phone-case needs different framing). */
export const VIEW_BY_SLUG: Record<string, CustomizerViewConfig> = {
  mug: {
    camera: {
      fov: 40,
      position: [-3.4, 0.35, 0],
      target: [0, 0, 0],
      minDistance: 1.6,
      maxDistance: 5,
    },
    model: {
      position: [0, -0.7, 0],
      scale: 0.7,
      rotation: [0, 0, 0],
    },
  },
  'phone-case': {
    camera: {
      fov: 35,
      position: [0, 0.2, 3.0],
      target: [0, 0, 0],
      minDistance: 1.4,
      maxDistance: 4.5,
    },
    model: {
      position: [0, 0, 0],
      scale: 1,
      rotation: [0, 0, 0],
    },
  },
}

export function viewForSlug(slug: string): CustomizerViewConfig {
  return VIEW_BY_SLUG[slug] ?? DEFAULT_VIEW
}

/** @deprecated use DEFAULT_VIEW.camera — kept for callers mid-rename */
export const DEFAULT_CAMERA = DEFAULT_VIEW.camera
/** @deprecated use DEFAULT_VIEW.model */
export const DEFAULT_MODEL_POSE = DEFAULT_VIEW.model
