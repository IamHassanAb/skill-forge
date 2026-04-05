# Tailwind CSS v3 — Situo Class Reference

## Surface classes
```
bg-[var(--bg)]          Page background
bg-[var(--s1)]          Cards, sidebar
bg-[var(--s2)]          Inputs, nested surfaces
border-[var(--border)]  Primary borders
border-[var(--border2)] Secondary / accent borders
```

## Text classes
```
text-[var(--t1)]   Primary text (headings, body)
text-[var(--t2)]   Secondary text (descriptions)
text-[var(--t3)]   Muted text (labels, hints)
text-[var(--t4)]   Subtle text (timestamps, metadata)
```

## Accent classes (fixed — same in light and dark)
```
bg-terracotta         #C2624A filled
text-terracotta       #C2624A text
border-terracotta     #C2624A border
bg-terracotta/10      10% opacity fill (hover states)
bg-terracotta/5       5% opacity fill (subtle backgrounds)
shadow-terracotta/20  terracotta glow shadow
```

## Typography classes
```
font-serif    Lora — prompts, headings, italic accents
font-sans     DM Sans — UI chrome, labels, body
font-mono     Code, session counters, timestamps
```

## Spacing system (use Tailwind defaults)
```
Card padding:     p-6 md:p-8 (inner), p-10 (large cards)
Gap between cards: gap-4 (tight), gap-6 (normal), gap-8 (loose)
Section spacing:  space-y-4 (tight), space-y-6 (normal), space-y-12 (sections)
```

## Border radius
```
rounded-full    Chips, badges, circle buttons
rounded-2xl     Cards (normal)
rounded-3xl     Onboarding cards, large sections
rounded-xl      Metric cards, input areas
rounded-lg      Small elements
```

## Common component patterns

### Terracotta primary button
```
px-6 py-3 rounded-full bg-terracotta text-white font-sans
font-semibold hover:opacity-90 active:scale-[0.98]
transition-all disabled:opacity-40 disabled:cursor-not-allowed
```

### Ghost / secondary button
```
px-6 py-3 rounded-full border border-[var(--border2)]
text-[var(--t3)] hover:text-[var(--t1)] hover:border-terracotta
transition-all font-sans font-medium
```

### Input / textarea
```
w-full bg-[var(--s2)] border-none rounded-xl
text-[var(--t1)] placeholder:text-[var(--t4)]
focus:ring-1 focus:ring-terracotta/20 transition-all
p-4 text-base leading-relaxed resize-none
```

### Pill badge
```
inline-flex items-center gap-2 px-3 py-1.5 rounded-full
border text-xs font-medium font-sans
```

### Section label
```
text-[10px] font-bold tracking-[0.13em] uppercase
text-[var(--t4)] font-sans
```

### Score pip (feedback grid)
```
Active:   w-1 h-1 rounded-full bg-terracotta
Inactive: w-1 h-1 rounded-full bg-[var(--border2)]
```

## Transitions
```
transition-all duration-200   Quick (buttons, hovers)
transition-all duration-300   Normal (theme switch, badge)
transition-all duration-500   Slow (reader panel slide-in)
```

## Loading / skeleton pattern
```jsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-[var(--s2)] rounded w-3/4" />
  <div className="h-4 bg-[var(--s2)] rounded w-1/2" />
</div>
```

## Do not use
```
Arbitrary colors not in the design system
Hard-coded #hex for surface/text colors (use CSS vars)
Mobile breakpoints (Chrome desktop MVP)
text-white / text-black (use text-[var(--t1)] instead)
bg-white / bg-gray-* / bg-stone-* (use bg-[var(--s1)] etc.)
```