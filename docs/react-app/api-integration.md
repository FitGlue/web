# API Integration

The React app communicates with the backend via REST APIs. This document covers the API client, type generation, and error handling.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     React Components                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Hooks      │  │   Services   │  │     useApi        │   │
│  │ useActivities│──│ ActivitiesSvc│──│  (HTTP client)    │   │
│  └──────────────┘  └──────────────┘  └─────────┬─────────┘   │
│                                                  │            │
└──────────────────────────────────────────────────┼────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                    Firebase Auth Token                        │
└──────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                      /api/* Endpoints                         │
│              (via Firebase Hosting Rewrites)                  │
└──────────────────────────────────────────────────────────────┘
```

## useApi Hook

The core HTTP client in `src/app/hooks/useApi.ts`:

```typescript
export const useApi = () => {
  const getAuthHeader = useCallback(async () => {
    const auth = getFirebaseAuth();
    const token = await auth?.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const get = useCallback(async (path: string) => {
    const headers = await getAuthHeader();
    const response = await fetch(`/api${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!response.ok) throw new Error(`GET ${path} failed`);
    return response.json();
  }, [getAuthHeader]);

  const post = useCallback(async (path: string, body?: unknown) => { ... }, []);
  const patch = useCallback(async (path: string, body?: unknown) => { ... }, []);
  const del = useCallback(async (path: string) => { ... }, []);

  return { get, post, patch, delete: del };
};
```

**Features**:
- Automatic Firebase auth token injection
- Memoized to prevent re-renders
- Consistent error handling

## Service Classes

Domain-specific API wrappers in `src/app/services/`:

### ActivitiesService

```typescript
// src/app/services/ActivitiesService.ts
export class ActivitiesService {
  constructor(private api: ReturnType<typeof useApi>) {}

  async list(): Promise<Activity[]> {
    return this.api.get('/activities');
  }

  async get(id: string): Promise<Activity> {
    return this.api.get(`/activities/${id}`);
  }

  async getStats(): Promise<ActivityStats> {
    return this.api.get('/activities/stats');
  }
}
```

### InputsService

```typescript
// src/app/services/InputsService.ts
export class InputsService {
  constructor(private api: ReturnType<typeof useApi>) {}

  async list(): Promise<PendingInput[]> {
    return this.api.get('/inputs');
  }

  async respond(inputId: string, response: InputResponse): Promise<void> {
    return this.api.post(`/inputs/${inputId}/respond`, response);
  }
}
```

## Type Generation

API types are generated from OpenAPI/Swagger:

```bash
npm run gen-api
```

This generates `src/shared/api/schema.ts` from `src/openapi/swagger.json`.

**Usage**:
```typescript
import { paths, components } from '../shared/api/schema';

type Activity = components['schemas']['Activity'];
type Pipeline = components['schemas']['Pipeline'];
```

## Endpoint Reference

| Endpoint | Method | Handler | Purpose |
|----------|--------|---------|---------|
| `/api/users/me` | GET | user-profile-handler | Get profile |
| `/api/users/me` | PATCH | user-profile-handler | Update profile |
| `/api/users/me/integrations` | GET | user-integrations-handler | List integrations |
| `/api/users/me/pipelines` | GET | user-pipelines-handler | List pipelines |
| `/api/users/me/pipelines` | POST | user-pipelines-handler | Create pipeline |
| `/api/activities` | GET | activities-handler | List activities |
| `/api/activities/:id` | GET | activities-handler | Get activity |
| `/api/activities/stats` | GET | activities-handler | Get stats |
| `/api/inputs` | GET | inputs-handler | List pending inputs |
| `/api/inputs/:id/respond` | POST | inputs-handler | Submit response |
| `/api/billing/**` | * | billing-handler | Billing operations |

## Error Handling

### Basic Pattern

```typescript
const fetchData = async () => {
  try {
    const data = await api.get('/activities');
    setActivities(data);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    setError('Could not load activities');
  }
};
```

### With Loading State

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await api.get('/activities');
    setActivities(data);
  } catch (e) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

## Local Development

### Vite Proxy

During development, Vite proxies `/api` requests:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
},
```

This forwards to local Cloud Functions emulator.

### Full Local Testing

```bash
npm run serve  # Build + Firebase emulator
```

API requests go through Firebase Hosting rewrites to Cloud Run.

## Related Documentation

- [State Management](./state-management.md)
- [Routing](./routing.md)
- [Authentication](../architecture/authentication.md)
