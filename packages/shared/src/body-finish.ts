import { z } from 'zod'

/**
 * Mug body PBR finishes (MorphLens Material layer).
 * Not artwork wrap. Phone-case finishes are deferred (P2-00).
 * Khronos: metallicFactor=1 ⇒ transmission ignored — glass cannot be metal.
 */

const colorHex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

export const bodyFinishIdSchema = z.enum(['ceramic', 'bamboo', 'glass', 'metal'])
export type BodyFinishId = z.infer<typeof bodyFinishIdSchema>

/** Choice stored on the Design document. */
export const bodyFinishChoiceSchema = z.object({
  id: bodyFinishIdSchema,
})
export type BodyFinishChoice = z.infer<typeof bodyFinishChoiceSchema>

export const DEFAULT_BODY_FINISH: BodyFinishChoice = { id: 'ceramic' }

/** Scalar PBR applied to body meshes only (MeshPhysicalMaterial fields). */
export const bodyFinishPresetSchema = z.object({
  id: bodyFinishIdSchema,
  label: z.string().min(1),
  color: colorHex,
  metalness: z.number().min(0).max(1),
  roughness: z.number().min(0).max(1),
  clearcoat: z.number().min(0).max(1).optional(),
  clearcoatRoughness: z.number().min(0).max(1).optional(),
  transmission: z.number().min(0).max(1).optional(),
  ior: z.number().positive().optional(),
  thickness: z.number().nonnegative().optional(),
  envMapIntensity: z.number().nonnegative().optional(),
  /** Partner SKU exists for wrap POD today — ceramic only for P2-00. */
  orderable: z.boolean(),
})
export type BodyFinishPreset = z.infer<typeof bodyFinishPresetSchema>

const RAW_PRESETS: BodyFinishPreset[] = [
  {
    id: 'ceramic',
    label: 'Ceramic',
    color: '#F7F7F5',
    metalness: 0,
    roughness: 0.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.5,
    orderable: true,
  },
  {
    id: 'bamboo',
    label: 'Bamboo',
    color: '#C4A574',
    metalness: 0,
    roughness: 0.68,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.45,
    orderable: false,
  },
  {
    id: 'glass',
    label: 'Glass',
    color: '#FFFFFF',
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    ior: 1.5,
    thickness: 0.04,
    envMapIntensity: 1,
    orderable: false,
  },
  {
    id: 'metal',
    label: 'Metal',
    color: '#C8CBCF',
    metalness: 1,
    roughness: 0.28,
    transmission: 0,
    envMapIntensity: 1.1,
    orderable: false,
  },
]

/** Enforce Khronos: metal never transmits; glass never metallic. */
export function normalizeBodyFinishPreset(preset: BodyFinishPreset): BodyFinishPreset {
  if (preset.metalness >= 1) {
    return { ...preset, metalness: 1, transmission: 0 }
  }
  if ((preset.transmission ?? 0) > 0) {
    return { ...preset, metalness: 0 }
  }
  return preset
}

export const BODY_FINISH_PRESETS: Record<BodyFinishId, BodyFinishPreset> = Object.fromEntries(
  RAW_PRESETS.map((p) => {
    const n = normalizeBodyFinishPreset(bodyFinishPresetSchema.parse(p))
    return [n.id, n] as const
  }),
) as Record<BodyFinishId, BodyFinishPreset>

export function bodyFinishPreset(id: BodyFinishId): BodyFinishPreset {
  return BODY_FINISH_PRESETS[id]
}

export function parseBodyFinishChoice(input: unknown): BodyFinishChoice {
  if (input == null) return DEFAULT_BODY_FINISH
  const parsed = bodyFinishChoiceSchema.safeParse(input)
  return parsed.success ? parsed.data : DEFAULT_BODY_FINISH
}
