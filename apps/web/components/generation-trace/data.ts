export type StageMeta = {
  id: string
  number: string
  label: string
  kicker: string
  index: string
  title: string
  copy: string
}

export const STAGES: StageMeta[] = [
  {
    id: 'describe',
    number: '01',
    label: 'Describe',
    kicker: 'Write the surface',
    index: 'Stage 01 · Prompt input',
    title: 'Describe the surface',
    copy: 'Start with words for the printable surface. One prompt creates one image Generation; it does not change the product geometry.',
  },
  {
    id: 'generate',
    number: '02',
    label: 'Generate',
    kicker: 'Prompt to image',
    index: 'Stage 02 · Image output',
    title: 'Generate a wrap',
    copy: 'The prompt produces an image for the printable area. A Generation spends Credits, and the output remains an image—not a new 3D model.',
  },
  {
    id: 'preview',
    number: '03',
    label: 'Preview in 3D',
    kicker: 'Inspect the wrap',
    index: 'Stage 03 · Product mapping',
    title: 'See the wrap in 3D',
    copy: 'The generated image is mapped around the selected mug or phone case so you can inspect how the flat surface meets the physical Blank.',
  },
  {
    id: 'finish',
    number: '04',
    label: 'Finish manually',
    kicker: 'Keep control',
    index: 'Stage 04 · Manual finish',
    title: 'Make the final adjustments',
    copy: 'Generation hands the design back to you. Use the Customizer’s manual controls to refine composition before moving toward print.',
  },
]

export const STEP_POS = [
  'top-12 left-0 max-md:static',
  'top-0.5 left-[28%] max-md:static max-lg:left-1/4',
  'top-[92px] left-[60%] max-md:static max-lg:left-[52%]',
  'top-[22px] right-0 left-auto max-md:static',
] as const
