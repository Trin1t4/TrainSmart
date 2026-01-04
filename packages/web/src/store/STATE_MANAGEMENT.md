# State Management Architecture

## Overview

TrainSmart uses a hybrid state management approach optimized for different use cases:

| Layer | Tool | Use Case |
|-------|------|----------|
| **Server State** | React Query | Data from Supabase (programs, workouts, user profiles) |
| **Client State** | Zustand | Persisted client data (userId, preferences, beta overrides) |
| **UI State** | useState | Temporary component state (modals, form inputs) |

## When to Use What

### React Query (`useQuery`, `useMutation`)
Use for data that comes from the server and needs:
- Caching
- Background refetching
- Optimistic updates
- Loading/error states

```typescript
// Good: Server data
const { data: program } = useQuery({
  queryKey: ['program', programId],
  queryFn: () => fetchProgram(programId)
});
```

### Zustand (`useAppStore`)
Use for client-side state that needs:
- Persistence across sessions
- Global access without prop drilling
- Synchronization with localStorage

```typescript
// Good: Client preferences
const { userId, betaOverrides } = useAppStore();
```

### useState
Use for:
- Form inputs
- Modal open/close
- Component-specific temporary state

```typescript
// Good: Temporary UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState({});
```

## Key Hooks

| Hook | Source | Purpose |
|------|--------|---------|
| `useAuth` | Custom | Authentication state (user, isAuthenticated) |
| `useAppStore` | Zustand | Global client state |
| `useProgram` | React Query | Current program data |
| `useDataSync` | Custom | localStorage ↔ Supabase sync |

## Data Flow

```
User Action
    ↓
Component (useState for UI)
    ↓
useAppStore (if client-side preference)
    ↓
React Query mutation (if server data)
    ↓
Supabase
    ↓
useDataSync (keeps localStorage in sync)
```

## Anti-Patterns to Avoid

❌ Storing server data in Zustand (use React Query)
❌ Using useState for data that needs persistence (use Zustand)
❌ Duplicating data between React Query and Zustand
❌ Direct localStorage access (use safeStorage or Zustand persist)
