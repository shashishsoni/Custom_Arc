'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  Coffee,
  Coins,
  Menu,
  Search,
  ShoppingBag,
  Smartphone,
  X,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SiteHeaderProps = {
  credits?: number
  cartCount?: number
}

type AuthMode = 'sign-in' | 'sign-up'

const iconProps = { size: 20, strokeWidth: 1.75, 'aria-hidden': true as const }

const CATALOG = [
  {
    href: '/catalog',
    title: 'Mugs',
    desc: 'Ceramic blanks — wrap art edge to edge in 3D.',
    Icon: Coffee,
  },
  {
    href: '/catalog',
    title: 'Phone cases',
    desc: 'Snap cases — AI texture mapped to your model.',
    Icon: Smartphone,
  },
] as const

const iconBtnClass = cn(
  'relative inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-[var(--radius)] border border-transparent text-muted-foreground transition-colors',
  'hover:border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
)

const creditsClass = cn(
  'inline-flex min-h-10 items-center gap-[7px] rounded-[var(--radius)] border px-3.5 pl-3 text-[0.8125rem] font-semibold tracking-[0.02em] transition-colors',
  'border-[color-mix(in_srgb,var(--accent-2)_20%,var(--border))] bg-[color-mix(in_srgb,var(--accent-2)_7%,rgba(255,255,255,0.78))] text-[var(--accent-2)]',
  'hover:border-[color-mix(in_srgb,var(--accent-2)_36%,var(--border))] hover:bg-[color-mix(in_srgb,var(--accent-2)_12%,#ffffff)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
)

const ctaClass = cn(
  'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius)] border-[1.5px] border-primary bg-primary px-5 text-sm font-semibold tracking-[0.02em] text-primary-foreground transition-colors',
  'hover:bg-transparent hover:text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-offset-3',
)

const navLinkClass = cn(
  'relative inline-flex h-full min-h-11 items-center gap-[5px] px-[18px] text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase transition-colors',
  'after:absolute after:right-[18px] after:bottom-0 after:left-[18px] after:h-0.5 after:bg-transparent after:transition-colors after:content-[""]',
  'hover:text-foreground hover:after:bg-[var(--border-strong)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
  'aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:after:bg-primary',
)

const megaIconClass = cn(
  'grid size-10 place-items-center rounded-[var(--radius)] border text-primary transition-colors',
  'border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_9%,#ffffff)]',
)

const mobileNavLinkClass = cn(
  'flex min-h-12 items-center rounded-[var(--radius)] px-4 text-base font-medium text-foreground transition-colors',
  'hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
)

export function SiteHeader({ credits = 12, cartCount = 2 }: SiteHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('sign-up')
  const lastFocus = useRef<HTMLElement | null>(null)
  const menuId = useId()
  const onCatalog = pathname.startsWith('/catalog') || pathname.startsWith('/customize')

  function openAuth(mode: AuthMode = 'sign-up') {
    setAuthMode(mode)
    setAuthOpen(true)
    closeMenu()
  }

  function closeMenu() {
    setOpen(false)
    lastFocus.current?.focus()
    lastFocus.current = null
  }

  useEffect(() => {
    if (authOpen) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      const first = document.getElementById(menuId)?.querySelector<HTMLElement>('a, button')
      first?.focus()
    }
    return () => {
      if (!authOpen) document.body.style.overflow = ''
    }
  }, [open, menuId, authOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (authOpen) return
      if (open) {
        e.preventDefault()
        setOpen(false)
        lastFocus.current?.focus()
        lastFocus.current = null
        return
      }
      setMegaOpen(false)
    }
    const mq = window.matchMedia('(max-width: 768px)')
    const onMq = () => {
      if (!mq.matches) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [open, authOpen])

  function toggleMenu() {
    if (open) {
      closeMenu()
      return
    }
    lastFocus.current = document.activeElement as HTMLElement
    setOpen(true)
  }

  const creditsLabel = `Credits balance: ${credits} credits remaining`
  const cartLabel = `Cart, ${cartCount} items`

  return (
    <header
      role="banner"
      className={cn(
        'fixed inset-x-0 top-0 z-[100] border-b border-border',
        'bg-[var(--bg-elev)] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]',
        'backdrop-blur-[14px] backdrop-saturate-[1.12]',
      )}
    >
      <div className="mx-auto w-full max-w-[var(--maxw)] px-4 md:px-6">
        <div
          className={cn(
            'relative grid h-[var(--header-marque)] items-center gap-3',
            'grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] md:gap-8',
          )}
        >
          <div className="flex min-w-0 items-center justify-start gap-3">
            <Link
              href="/account/credits"
              aria-label={creditsLabel}
              className={cn(creditsClass, 'hidden md:inline-flex')}
            >
              <Coins {...iconProps} size={15} className="size-[15px] shrink-0 opacity-90" />
              <span>{credits}</span>
            </Link>
            <button
              type="button"
              aria-label="Search catalog"
              className={cn(iconBtnClass, 'hidden md:inline-flex')}
            >
              <Search {...iconProps} />
            </button>
          </div>

          <Link
            href="/"
            aria-label="CustomArc home"
            className={cn(
              'inline-flex min-h-11 items-center justify-center gap-3 justify-self-center rounded-[var(--radius)] px-2 py-1 transition-opacity md:px-2.5 md:py-1.5',
              'hover:opacity-[0.82] active:opacity-70',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'grid size-[34px] shrink-0 place-items-center rounded-[var(--radius)] border md:size-[38px]',
                'border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_12%,#ffffff)]',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[18px] text-primary md:size-[22px]"
              >
                <path d="M4 16c4-8 12-8 16 0" />
                <circle cx="12" cy="8" r="2.25" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="text-[1.2rem] leading-none font-extrabold tracking-[0.02em] text-foreground md:text-[clamp(1.35rem,2.1vw,1.7rem)]">
              CustomArc
            </span>
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => openAuth('sign-up')}
              className={cn(
                'hidden h-11 min-h-11 rounded-[var(--radius)] border border-transparent px-3 text-sm font-medium tracking-[0.01em] text-muted-foreground md:inline-flex',
                'hover:border-border hover:bg-white/60 hover:text-foreground',
              )}
            >
              Sign up
            </Button>
            <Link
              href="/cart"
              aria-label={cartLabel}
              className={cn(iconBtnClass, 'max-[480px]:hidden')}
            >
              <ShoppingBag {...iconProps} />
              {cartCount > 0 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius)] bg-primary px-1 text-[0.625rem] leading-4 font-bold text-primary-foreground"
                >
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <Link href="/catalog" className={cn(ctaClass, 'ml-2 hidden md:inline-flex')}>
              Start customizing
            </Link>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={toggleMenu}
              className={cn(iconBtnClass, 'inline-flex md:hidden')}
            >
              {open ? <X {...iconProps} size={22} /> : <Menu {...iconProps} size={22} />}
            </button>
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="hidden h-[var(--header-nav)] items-center justify-center border-t border-border md:flex"
        >
          <div className="flex h-full items-stretch gap-0">
            <div
              className="group relative flex h-full items-stretch"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              onFocus={() => setMegaOpen(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setMegaOpen(false)
              }}
            >
              <Link
                href="/catalog"
                aria-haspopup="true"
                aria-expanded={megaOpen}
                className={cn(
                  navLinkClass,
                  'group-hover:text-foreground group-hover:after:bg-primary group-focus-within:text-foreground group-focus-within:after:bg-primary',
                )}
              >
                Catalog
                <ChevronDown
                  className={cn(
                    'size-[13px] opacity-55 transition-transform',
                    'group-hover:rotate-180 group-focus-within:rotate-180',
                    megaOpen && 'rotate-180',
                  )}
                  {...iconProps}
                  size={13}
                />
              </Link>
              <div
                role="region"
                aria-label="Catalog products"
                className={cn(
                  'invisible absolute top-full left-1/2 z-[110] w-[min(540px,calc(100vw-40px))] -translate-x-1/2 translate-y-1.5 rounded-[var(--radius)] border border-[var(--border-strong)] p-4 opacity-0 pointer-events-none transition-[opacity,transform,visibility]',
                  'bg-[rgba(255,252,253,0.95)] shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_8px_22px_rgba(196,92,106,0.07)] backdrop-blur-[16px] backdrop-saturate-[1.1]',
                  'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto',
                  'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto',
                  'motion-reduce:translate-y-0',
                  megaOpen && 'visible translate-y-0 opacity-100 pointer-events-auto',
                )}
              >
                <p className="mb-3 px-0.5 text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Shop by product
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {CATALOG.map(({ href, title, desc, Icon }) => (
                    <Link
                      key={title}
                      href={href}
                      className={cn(
                        'group/tile flex min-h-11 flex-col gap-2 rounded-[var(--radius)] border border-border px-4 pt-4 pb-5 transition-colors',
                        'bg-[color-mix(in_srgb,var(--bg)_55%,#ffffff)]',
                        'hover:border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] hover:bg-white',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          megaIconClass,
                          'group-hover/tile:border-primary group-hover/tile:bg-[color-mix(in_srgb,var(--accent)_10%,#ffffff)] group-hover/tile:text-primary',
                        )}
                      >
                        <Icon {...iconProps} />
                      </span>
                      <span className="text-[0.95rem] font-semibold text-foreground">{title}</span>
                      <span className="text-[0.8125rem] font-light leading-normal text-muted-foreground">
                        {desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/catalog"
              aria-current={onCatalog ? 'page' : undefined}
              className={navLinkClass}
            >
              Customize
            </Link>
            <Link href="/#bulk" className={navLinkClass}>
              Bulk orders
            </Link>
          </div>
        </nav>
      </div>

      <div
        id={menuId}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu()
        }}
        className={cn(
          'fixed inset-x-0 top-[var(--header-h)] bottom-0 z-[110] bg-[color-mix(in_srgb,var(--fg)_16%,transparent)] backdrop-blur-sm md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            'flex max-h-[calc(100vh-var(--header-h))] flex-col gap-0.5 overflow-y-auto rounded-b-[var(--radius)] border-b border-[var(--border-strong)] px-6 pt-5 pb-8',
            'bg-[rgba(255,252,253,0.97)] shadow-[0_16px_40px_rgba(196,92,106,0.09)] backdrop-blur-[16px]',
          )}
        >
          <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-border pb-4">
            <Link
              href="/account/credits"
              aria-label={creditsLabel}
              onClick={closeMenu}
              className={creditsClass}
            >
              <Coins {...iconProps} size={15} className="size-[15px] shrink-0 opacity-90" />
              <span>{credits}</span>
            </Link>
            <button type="button" aria-label="Search catalog" className={iconBtnClass}>
              <Search {...iconProps} />
            </button>
            <Link href="/cart" aria-label={cartLabel} onClick={closeMenu} className={iconBtnClass}>
              <ShoppingBag {...iconProps} />
              {cartCount > 0 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius)] bg-primary px-1 text-[0.625rem] leading-4 font-bold text-primary-foreground"
                >
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>

          <Link href="/catalog" onClick={closeMenu} className={mobileNavLinkClass}>
            Catalog
          </Link>
          <div className="mt-3 border-t border-border pt-4">
            <p className="mb-3 px-4 text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Shop by product
            </p>
            {CATALOG.map(({ href, title, desc, Icon }) => (
              <Link
                key={title}
                href={href}
                onClick={closeMenu}
                className={cn(
                  'flex min-h-14 items-start gap-4 rounded-[var(--radius)] border border-transparent p-4 transition-colors',
                  'hover:border-border hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                )}
              >
                <span aria-hidden className={cn(megaIconClass, 'shrink-0')}>
                  <Icon {...iconProps} size={18} className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-semibold text-foreground">{title}</span>
                  <span className="mt-1 block text-[0.8125rem] font-light leading-normal text-muted-foreground">
                    {desc}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <Link href="/catalog" onClick={closeMenu} className={mobileNavLinkClass}>
            Customize
          </Link>
          <Link href="/#bulk" onClick={closeMenu} className={mobileNavLinkClass}>
            Bulk orders
          </Link>
          <div className="my-4 h-px bg-border" />
          <button type="button" className={cn(mobileNavLinkClass, 'w-full text-left')} onClick={() => openAuth('sign-up')}>
            Sign up
          </button>
          <button type="button" className={cn(mobileNavLinkClass, 'w-full text-left')} onClick={() => openAuth('sign-in')}>
            Sign in
          </button>
          <Link href="/catalog" onClick={closeMenu} className={cn(ctaClass, 'mt-2')}>
            Start customizing
          </Link>
        </div>
      </div>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </header>
  )
}
