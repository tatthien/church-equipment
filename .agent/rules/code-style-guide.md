---
trigger: always_on
---

## 1. General Formatting (The "Stylistic" Core)

* **Indentation:** Use **2 spaces**. No tabs.
* **Semicolons:** **Do not use semicolons** (`semi: never`), except when necessary to prevent statement ambiguity.
* **Quotes:** Use **single quotes** for strings; use backticks for template literals.
* **Trailing Commas:** Always use **multiline trailing commas**. This reduces git diff noise.
* **Spacing:** * Use one space inside curly braces: `{ object: value }`.
* No spaces inside array brackets: `[item1, item2]`.
* Max **1 consecutive empty line** to keep files compact.


## 2. TypeScript & Type Safety

* **Strict Typing:** Avoid `any`. If a type is unknown, prefer `unknown` and use type guards.
* **Unused Variables:** Prefix unused variables with an underscore (e.g., `_index`) to signal intent.
* **Interfaces vs. Types:** * Use `interface` for public API definitions or objects intended for extension.
* Use `type` for unions, intersections, and internal component props.


* **Inference:** Allow TypeScript to infer types for simple assignments; explicitly type function return values for public-facing utilities or complex logic.

## 3. React & Next.js Best Practices

* **Component Definition:** Use **Arrow Functions** for functional components to maintain consistency with hooks.
```tsx
const HeroSection = ({ title }: HeroProps) => {
  return <section>{title}</section>
}

```

* **Component Structure:**
* One component per file.
* Place helper functions outside the component to prevent re-declaration on every render.


* **Hooks:** * Strictly follow the Rules of Hooks.
* Avoid setting state inside `useEffect` unless absolutely necessary (prefer derived state or event handlers).


* **Next.js Specifics:**
* Use **Server Components** by default. Add `'use client'` only when interactivity (state/hooks) is required.
* Use the metadata API for SEO rather than manual `<head>` tags.


## 4. Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| **Components** | `PascalCase` | `SubmitButton` |
| **Variables/Functions** | `camelCase` | `fetchData` |
| **Types/Interfaces** | `PascalCase` | `UserSession` |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |

## 5. Directory Structure (Next.js Monorepo/Standard)

* `app/`: Routing and layouts (Next.js App Router).
* `components/`: Reusable UI components (Shared).
* `hooks/`: Shared React hooks.
* `lib/`: Core logic, utility functions, and shared clients (Prisma, Redis).
* `types/`: Global TypeScript definitions.

---

### Example Snippet (Antigravity Style)

```tsx
import type { FC } from 'react'

type UserProps = {
  name: string
  isAdmin?: boolean
}

export const UserCard: FC<UserProps> = ({ name, isAdmin = false }) => {
  const label = isAdmin ? 'Admin' : 'Guest'

  return (
    <div className="flex gap-2">
      <p>{name}</p>
      <span>{label}</span>
    </div>
  )
}

```