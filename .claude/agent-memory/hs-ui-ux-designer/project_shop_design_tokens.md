---
name: project-shop-design-tokens
description: Shop UI theming decisions — graphite oklch theme, added sale/success/warning tokens, why destructive is not used for text in dark mode
metadata:
  type: project
---

Shop (src/routes/_shop) uses the graphite oklch theme in src/index.css (.dark class toggle). On 2026-10-21 tokens `--sale`, `--sale-foreground`, `--success`, `--warning` were added (both themes, all >= 4.5:1 on background/card) for price-discount, favourite heart, stock and rating stars.

**Why:** dark `--destructive` is oklch(0.396 …) — fine as a button bg but ~2:1 as text on dark bg, so discount/heart text must use `text-sale`, not `text-destructive`. Pre-existing shop components hard-coded neutral-*/red-*/bg-white and broke dark mode.

**How to apply:** for new shop UI use semantic tokens only; allowed exceptions are on-photo overlays (hero text/CTA white) and the PayOS QR tile (bg-white for scanner contrast). `muted-foreground` on `bg-muted` is only ~4.3:1 — avoid small text there. Inter is declared in --font-sans but never loaded (falls back to Arial); Cormorant Garamond (display) has a Vietnamese subset.

Baseline `tsc -b` has 8 pre-existing errors (search/wishlist `active` param, crm columns, admin-sidebar, attachment), so `pnpm build` fails before vite runs; verify with `pnpm exec vite build` and compare error count against HEAD.
