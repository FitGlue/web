# State Management

The React app uses **Jotai** for atomic state management. State files are in `src/app/state/`.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     React Components                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   useAtom    │  │    Hooks     │  │    Context       │  │
│  │ (read/write) │  │  (derived)   │  │  (NerdMode)      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Jotai Atoms                         │  │
│  │  authState · userState · activitiesState · etc.      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## State Files

### authState.ts

Firebase authentication state:

```typescript
// src/app/state/authState.ts
import { atom } from 'jotai';
import { User } from 'firebase/auth';

export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom(true);
```

**Usage**:
```typescript
const [user] = useAtom(userAtom);
const [loading] = useAtom(authLoadingAtom);
```

### userState.ts

User profile data from Firestore:

```typescript
// src/app/state/userState.ts
import { atom } from 'jotai';

export interface UserProfile {
  id: string;
  email: string;
  tier: 'free' | 'pro';
  isAdmin: boolean;
  // ...
}

export const userProfileAtom = atom<UserProfile | null>(null);
```

### activitiesState.ts

Activity list and filters:

```typescript
// src/app/state/activitiesState.ts
export const activitiesAtom = atom<Activity[]>([]);
export const activitiesLoadingAtom = atom(false);
```

### pipelinesState.ts

Pipeline configuration:

```typescript
// src/app/state/pipelinesState.ts
export const pipelinesAtom = atom<Pipeline[]>([]);
```

### integrationsState.ts

Connected services (Strava, Fitbit, etc.):

```typescript
// src/app/state/integrationsState.ts
export const integrationsAtom = atom<Integration[]>([]);
```

### inputsState.ts

Pending user inputs:

```typescript
// src/app/state/inputsState.ts
export const inputsAtom = atom<PendingInput[]>([]);
```

## Context

### NerdModeContext

Toggle for advanced features:

```typescript
// src/app/state/NerdModeContext.tsx
export const NerdModeContext = createContext({
  nerdMode: false,
  toggleNerdMode: () => {},
});

export const NerdModeProvider: React.FC = ({ children }) => {
  const [nerdMode, setNerdMode] = useState(false);
  // ...
};
```

**Usage**:
```typescript
const { nerdMode, toggleNerdMode } = useContext(NerdModeContext);
```

## Related Hooks

State is often accessed via hooks that add derived logic:

| Hook | State Used | Purpose |
|------|------------|---------|
| `useAuth` | `authState` | Sign in/out operations |
| `useUser` | `userState` | Profile data + tier |
| `useActivities` | `activitiesState` | Activity CRUD |
| `usePipelines` | `pipelinesState` | Pipeline management |
| `useIntegrations` | `integrationsState` | Connection status |
| `useInputs` | `inputsState` | Pending inputs |

## Patterns

### Atom Updates

```typescript
// Read only
const [activities] = useAtom(activitiesAtom);

// Read + write
const [activities, setActivities] = useAtom(activitiesAtom);

// Update with callback
setActivities(prev => [...prev, newActivity]);
```

### Derived State

```typescript
// Atom that derives from another
const filteredActivitiesAtom = atom((get) => {
  const activities = get(activitiesAtom);
  return activities.filter(a => !a.archived);
});
```

## Related Documentation

- [Routing](./routing.md)
- [API Integration](./api-integration.md)
- [Authentication](../architecture/authentication.md)
