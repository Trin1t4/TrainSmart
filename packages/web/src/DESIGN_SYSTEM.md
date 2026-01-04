# TrainSmart Design System

## Color Palette

Il design system usa CSS variables HSL per supportare dark mode.

### Semantic Colors

| Token | Usage |
|-------|-------|
| `primary` | Main CTA buttons, active states, links |
| `secondary` | Secondary buttons, less emphasis |
| `destructive` | Delete, errors, warnings |
| `muted` | Disabled states, subtle backgrounds |
| `accent` | Highlights, badges, notifications |
| `card` | Card backgrounds |
| `popover` | Dropdown/modal backgrounds |

### Usage in Tailwind

```tsx
// Backgrounds
className="bg-primary"
className="bg-secondary"
className="bg-card"
className="bg-muted"

// Text
className="text-primary"
className="text-muted-foreground"
className="text-destructive"

// Borders
className="border-border"
className="ring-ring"
```

## Typography

### Font Families

| Family | Usage |
|--------|-------|
| `font-sans` (Inter) | Body text, UI elements |
| `font-display` (Outfit) | Headings, hero text |
| `font-mono` (JetBrains Mono) | Code, numbers, data |

### Text Sizes

```tsx
// Headings
className="text-4xl font-display font-bold"  // H1
className="text-2xl font-display font-semibold"  // H2
className="text-xl font-semibold"  // H3

// Body
className="text-base"  // Default
className="text-sm text-muted-foreground"  // Secondary
className="text-xs"  // Caption
```

## Spacing

Standard spacing scale: `4, 8, 12, 16, 24, 32, 48, 64`

```tsx
className="p-4"  // 16px padding
className="gap-6"  // 24px gap
className="mb-8"  // 32px margin bottom
```

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small elements, chips |
| `rounded-md` | 6px | Inputs, small cards |
| `rounded-lg` | 8px | Cards, modals |
| `rounded-xl` | 12px | Large cards |
| `rounded-full` | 9999px | Avatars, pills |

## Component Patterns

### Buttons

```tsx
// Primary CTA
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90">
  Action
</button>

// Secondary
<button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
  Secondary
</button>

// Ghost
<button className="hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-lg">
  Ghost
</button>

// Destructive
<button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
  Delete
</button>
```

### Cards

```tsx
<div className="bg-card rounded-lg border border-border p-6 shadow-sm">
  <h3 className="font-semibold mb-2">Title</h3>
  <p className="text-muted-foreground">Content</p>
</div>
```

### Inputs

```tsx
<input
  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground
             focus:outline-none focus:ring-2 focus:ring-ring"
  placeholder="Enter value"
/>
```

### Badges

```tsx
// Info
<span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs">
  Info
</span>

// Success
<span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full text-xs">
  Success
</span>

// Warning
<span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full text-xs">
  Warning
</span>
```

## Icons

Usa **Lucide React** per tutte le icone:

```tsx
import { Home, Settings, User, ChevronRight } from 'lucide-react';

<Home className="w-5 h-5" />
<Settings className="w-4 h-4 text-muted-foreground" />
```

### Icon Sizes

| Size | Class | Usage |
|------|-------|-------|
| 16px | `w-4 h-4` | Inline, buttons |
| 20px | `w-5 h-5` | Navigation, default |
| 24px | `w-6 h-6` | Cards, emphasis |
| 32px | `w-8 h-8` | Empty states |

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

## Animation

Usa `transition` per micro-interactions:

```tsx
className="transition-colors duration-200"  // Color changes
className="transition-transform duration-200 hover:scale-105"  // Scale
className="transition-opacity duration-300"  // Fade
```

## Dark Mode

Il dark mode è gestito via classe `.dark` sul root.
I colori semantic (`primary`, `muted`, etc.) si adattano automaticamente.

Per colori custom:

```tsx
className="text-gray-900 dark:text-gray-100"
className="bg-white dark:bg-gray-900"
```

## Do's and Don'ts

✅ **Do:**
- Usa semantic colors (`primary`, `muted`, etc.)
- Usa il font-family appropriato per il contesto
- Mantieni spacing consistente (multipli di 4)
- Testa sempre in dark mode

❌ **Don't:**
- Hardcodare colori hex
- Mixare font-families senza motivo
- Usare spacing arbitrari
- Ignorare stati hover/focus
