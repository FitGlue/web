# State Management

The React app uses **Jotai** for atomic state management combined with **real-time Firestore hooks** for live data updates.

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          React Components                                   │
│                                                                             │
│  ┌──────────────┐   ┌──────────────────────┐   ┌──────────────────┐        │
│  │   useAtom    │   │   Real-time Hooks    │   │    useApi        │        │
│  │ (read state) │   │ (Firebase SDK reads) │   │  (REST writes)   │        │
│  └──────┬───────┘   └──────────┬───────────┘   └────────┬─────────┘        │
│         │                      │                        │                   │
│         │         ┌────────────┴────────────┐           │                   │
│         │         │     onSnapshot          │           │                   │
│         │         │  (Firestore listeners)  │           │                   │
│         │         └────────────┬────────────┘           │                   │
│         │                      │                        │                   │
│         ▼                      ▼                        │                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          Jotai Atoms                                  │  │
│  │  pipelinesAtom · activitiesAtom · integrationsAtom · inputsAtom      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Access Pattern

| Operation | Method | When to Use |
|-----------|--------|-------------|
| **Reads** | Firestore SDK (`onSnapshot`) | Real-time data (pipelines, activities, inputs) |
| **Writes** | REST API (`useApi`) | Create, update, delete operations |

**Why this pattern?**
- Firestore SDK provides instant updates without polling
- REST API ensures server-side validation for mutations
- Real-time hooks automatically update atoms

## Real-time Hooks

### useFirestoreListener (Generic)

Base hook for Firestore real-time listeners:

```typescript
// src/app/hooks/useFirestoreListener.ts
interface UseFirestoreListenerOptions<T, R> {
  queryFactory: (firestore: Firestore, userId: string) => Query | DocumentReference;
  mapper: (snapshot: QuerySnapshot | DocumentSnapshot) => R;
  onData: (data: R) => void;
}

function useFirestoreListener<T, R>(options: UseFirestoreListenerOptions<T, R>);
```

**Features:**
- Handles auth state (waits for user)
- Manages loading/error states
- Automatic cleanup on unmount
- Provides `refresh()` function

### Domain-Specific Hooks

| Hook | Collection | Atom Updated |
|------|------------|--------------|
| `useRealtimePipelines` | `users/{userId}/pipelines` | `pipelinesAtom` |
| `useRealtimeActivities` | `users/{userId}/activities` | `activitiesAtom` |
| `useRealtimeInputs` | `users/{userId}/pending_inputs` | `pendingInputsAtom` |
| `useRealtimeIntegrations` | `users/{userId}` (integrations field) | `integrationsAtom` |
| `usePipelineRuns` | `users/{userId}/pipeline_runs` | `pipelineRunsAtom` |

**Example Usage:**

```typescript
// In a page component
const { pipelines, loading, error, refresh } = useRealtimePipelines();

// Atom is automatically updated when Firestore changes
const [pipelines] = useAtom(pipelinesAtom); // Same data, can use in any component
```

## State Files

### authState.ts

Firebase authentication state:

```typescript
export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom(true);
```

### userState.ts

User profile from API:

```typescript
export const userProfileAtom = atom<UserProfile | null>(null);
export const profileLoadingAtom = atom(true);
export const profileErrorAtom = atom<string | null>(null);
```

### pipelinesState.ts

Pipeline configurations (real-time):

```typescript
export const pipelinesAtom = atom<PipelineConfig[]>([]);
export const pipelinesLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingPipelinesAtom = atom(true);
export const isPipelinesLoadedAtom = atom(false);
```

### activitiesState.ts

Activities and execution data (real-time):

```typescript
export const activitiesAtom = atom<SynchronizedActivity[]>([]);
export const pipelineRunsAtom = atom<PipelineRun[]>([]);
export const activityStatsAtom = atom<ActivityStats>({ ... });
export const unsynchronizedAtom = atom<UnsynchronizedEntry[]>([]);
```

### inputsState.ts

Pending user inputs (real-time):

```typescript
export const pendingInputsAtom = atom<PendingInput[]>([]);
export const inputsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingInputsAtom = atom(true);
```

### integrationsState.ts

Connected services (real-time):

```typescript
export const integrationsAtom = atom<IntegrationsSummary | null>(null);
export const integrationsLastUpdatedAtom = atom<Date | null>(null);
```

### pluginRegistryState.ts

Plugin registry from API (cached):

```typescript
export const pluginRegistryAtom = atom<PluginRegistryResponse | null>(null);
export const pluginRegistryLastUpdatedAtom = atom<Date | null>(null);
// Cached for 10 minutes
```

## Context

### NerdModeContext

Toggle for advanced/debug features (persisted in localStorage):

```typescript
export const NerdModeContext = createContext({
  nerdMode: false,
  toggleNerdMode: () => {},
});

// Usage
const { nerdMode, toggleNerdMode } = useContext(NerdModeContext);
```

## Patterns

### Hook Updates Atom Automatically

```typescript
// Real-time hook internally calls setAtom
const useRealtimePipelines = () => {
  const [, setPipelines] = useAtom(pipelinesAtom);
  
  useFirestoreListener({
    queryFactory: (db, userId) => collection(db, 'users', userId, 'pipelines'),
    mapper: (snapshot) => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    onData: setPipelines, // Updates atom on every Firestore change
  });
};
```

### Component Reads from Atom

```typescript
// Any component can read the atom
function PipelinesList() {
  const [pipelines] = useAtom(pipelinesAtom);
  const [loading] = useAtom(isLoadingPipelinesAtom);
  
  if (loading) return <SkeletonLoading />;
  return <ul>{pipelines.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### Mutations via REST API

```typescript
function CreatePipelineButton() {
  const api = useApi();
  const { refresh } = useRealtimePipelines();
  
  const handleCreate = async () => {
    await api.post('/users/me/pipelines', { name, source, destinations });
    // Firestore listener will auto-update, but refresh() ensures immediate sync
    await refresh();
  };
}
```

### Derived State

```typescript
// Atom that derives from another
const activePipelinesAtom = atom((get) => {
  const pipelines = get(pipelinesAtom);
  return pipelines.filter(p => !p.disabled);
});
```

### Skeleton Loading

```typescript
import { SkeletonLoading, CardSkeleton } from '@/components/library';

function ActivityList() {
  const [activities] = useAtom(activitiesAtom);
  const [loading] = useAtom(isLoadingActivitiesAtom);
  
  if (loading) {
    return <SkeletonLoading count={3}><CardSkeleton /></SkeletonLoading>;
  }
  return <ActivityCards activities={activities} />;
}
```

## Pipeline Run Lookup

For activity cards that need pipeline execution details:

```typescript
// Get pipeline run for an activity
const { pipelineRuns } = usePipelineRuns();
const run = pipelineRuns.find(r => r.activityId === activity.id);

// Access booster executions and destination outcomes
const boosters = run?.boosters || [];
const destinations = run?.destinations || [];
```

## Related Documentation

- [API Integration](./api-integration.md) - REST API for mutations
- [Routing](./routing.md) - Page structure
- [Authentication](../architecture/authentication.md) - Auth flow
