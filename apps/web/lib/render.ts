import type { RenderContext } from '@customarc/design'

/**
 * Narrow a browser Canvas2D context to the isomorphic RenderContext.
 *
 * `@customarc/design` is deliberately DOM-free so the same render runs on the
 * server (print file) and the browser (preview). Its structural RenderContext
 * is narrower than CanvasRenderingContext2D (e.g. fillStyle: string, narrower
 * textAlign/textBaseline unions), so the browser context is a behavioural
 * superset that can't be assigned directly. This isolates that unsafe
 * narrowing to the single DOM boundary instead of leaking a double cast into
 * the customizer.
 */
export function asRenderContext(ctx: CanvasRenderingContext2D): RenderContext {
  return ctx as unknown as RenderContext
}
