# CustomArc web UI

## Styling

- **Tailwind-first.** Theme tokens in `app/globals.css` (`:root` + `@theme inline`).
- Custom CSS only when utilities cannot (documented exceptions).
- Follow `.cursor/rules/web-ui.mdc` on every frontend change.

## Primitives

`components/ui/` — shadcn/ui + Base UI (`base-nova`).

```bash
pnpm dlx shadcn@latest add <name> -c apps/web
```

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Brand

Air Blush → `--primary` / `--accent` = `#c45c6a`. Use `bg-primary`, `text-fg`, `text-fg-muted`, `border-border`, `bg-bg`, `max-w-content`.
