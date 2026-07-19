import { cn } from '@/lib/utils'

export function DepthLines({ mirror }: { mirror?: boolean }) {
  const side = mirror ? 'left-[9%]' : 'right-[9%]'
  return (
    <>
      <span
        className={cn(
          'absolute z-0 h-px w-[76%] bg-primary opacity-50',
          side,
          'top-[15%]',
          mirror ? 'origin-left -rotate-[18deg]' : 'origin-right rotate-[18deg]',
        )}
      />
      <span className={cn('absolute top-1/2 z-0 h-px w-[84%] bg-primary opacity-50', side)} />
      <span
        className={cn(
          'absolute z-0 h-px w-[76%] bg-primary opacity-50',
          side,
          'bottom-[15%]',
          mirror ? 'origin-left rotate-[18deg]' : 'origin-right -rotate-[18deg]',
        )}
      />
    </>
  )
}
