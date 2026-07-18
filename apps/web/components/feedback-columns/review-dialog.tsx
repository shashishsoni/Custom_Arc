'use client'

import { useId, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { Review } from './data'

type ReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (review: Review) => void
}

export function ReviewDialog({ open, onOpenChange, onSubmit }: ReviewDialogProps) {
  const formId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const product = (data.get('product') === 'Case' ? 'Case' : 'Mug') as Review['product']
    const quote = String(data.get('comment') ?? '').trim()
    if (!name || !quote) return
    onSubmit({ name, product, quote })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[460px] gap-0 rounded border border-border bg-card p-6 text-fg ring-0 sm:max-w-[460px]"
        showCloseButton
      >
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle className="font-heading text-[clamp(1.375rem,3vw,1.625rem)] leading-[1.15] font-semibold">
            Add your review
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-fg-muted">
            Posted in-memory to this page only — nothing leaves your browser.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} className="mt-5" noValidate onSubmit={handleSubmit}>
          <div className="mb-4 space-y-1.5">
            <Label htmlFor={`${formId}-name`} className="text-[13px] font-semibold text-fg">
              Name
            </Label>
            <Input
              id={`${formId}-name`}
              name="name"
              maxLength={40}
              required
              autoComplete="name"
              className="min-h-11 rounded border-border-strong bg-bg"
            />
          </div>

          <fieldset className="mb-[18px] border-0 p-0">
            <legend className="mb-2 text-[13px] font-semibold text-fg">Product</legend>
            <div className="flex flex-wrap gap-2.5">
              {(['Mug', 'Case'] as const).map((product) => (
                <label
                  key={product}
                  className={cn(
                    'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded border border-border-strong px-3.5 text-[13.5px] font-semibold transition-colors',
                    'has-[:checked]:border-primary has-[:checked]:bg-[color-mix(in_srgb,var(--primary)_12%,var(--bg))] has-[:checked]:text-primary',
                  )}
                >
                  <input
                    type="radio"
                    name="product"
                    value={product}
                    defaultChecked={product === 'Mug'}
                    className="sr-only"
                  />
                  {product}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mb-4 space-y-1.5">
            <Label htmlFor={`${formId}-comment`} className="text-[13px] font-semibold text-fg">
              Your review
            </Label>
            <textarea
              id={`${formId}-comment`}
              name="comment"
              maxLength={160}
              required
              rows={3}
              placeholder="What did you notice about the wrap, the preview, or the print?"
              className="min-h-[88px] w-full resize-y rounded border border-border-strong bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="mt-1.5 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 rounded"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="min-h-11 rounded">
              Post review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
