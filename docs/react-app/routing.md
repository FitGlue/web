# Routing

The React app uses **React Router v6** for client-side navigation. Routes are defined in `src/app/App.tsx`.

## URL Structure

The React app is mounted at `/app`, so all routes are prefixed:

| Full URL | React Route | Component |
|----------|-------------|-----------|
| `/app` | `/` | DashboardPage |
| `/app/activities` | `/activities` | ActivitiesListPage |
| `/app/settings/pipelines` | `/settings/pipelines` | PipelinesPage |

## Route Table

| Path | Component | Protection | Purpose |
|------|-----------|------------|---------|
| `/` | `DashboardPage` | Protected | Main dashboard |
| `/inputs` | `PendingInputsPage` | Protected | Pending user inputs |
| `/activities` | `ActivitiesListPage` | Protected | Activity history |
| `/activities/:id` | `ActivityDetailPage` | Protected | Single activity detail |
| `/activities/unsynchronized/:id` | `UnsynchronizedDetailPage` | Protected | Failed sync detail |
| `/connections` | `ConnectionsPage` | Protected | Connected services (primary nav) |
| `/connections/:id` | `ConnectionDetailPage` | Protected | Integration detail |
| `/connections/:id/setup` | `ConnectionSetupPage` | Protected | OAuth setup flow |
| `/connections/:id/success` | `ConnectionSuccessPage` | Protected | OAuth success landing |
| `/connections/:id/error` | `ConnectionErrorPage` | Protected | OAuth error landing |
| `/settings/pipelines` | `PipelinesPage` | Protected | Pipeline list |
| `/settings/pipelines/new` | `PipelineWizardPage` | Protected | Create pipeline |
| `/settings/pipelines/:id/edit` | `PipelineEditPage` | Protected | Edit pipeline |
| `/settings/account` | `AccountSettingsPage` | Protected | Account settings |
| `/settings/subscription` | `SubscriptionPage` | Protected | Subscription management |
| `/settings/upgrade` | `SubscriptionPage` | Protected | Subscription management (alias) |
| `/settings/enricher-data` | `EnricherDataPage` | Protected | Enricher data (PRs, etc.) |
| `/settings/showcase` | `ShowcaseManagementPage` | Protected | Showcase management |
| `/settings/integrations` | `ConnectionsPage` | Protected | Legacy redirect (prefer `/connections`) |
| `/recipes` | `RecipesPage` | Protected | Recipe browser |
| `/admin` | `AdminPage` | Admin | Admin console |
| `*` | `NotFoundPage` | None | 404 handler |

## Route Configuration

```typescript
// src/app/App.tsx
<Router basename="/app">
  <Routes>
    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/inputs" element={<ProtectedRoute><PendingInputsPage /></ProtectedRoute>} />

    {/* Activities */}
    <Route path="/activities" element={<ProtectedRoute><ActivitiesListPage /></ProtectedRoute>} />
    <Route path="/activities/unsynchronized/:pipelineExecutionId" element={<ProtectedRoute><UnsynchronizedDetailPage /></ProtectedRoute>} />
    <Route path="/activities/:id" element={<ProtectedRoute><ActivityDetailPage /></ProtectedRoute>} />

    {/* Connections (primary nav) */}
    <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
    <Route path="/connections/:id/setup" element={<ProtectedRoute><ConnectionSetupPage /></ProtectedRoute>} />
    <Route path="/connections/:id/success" element={<ProtectedRoute><ConnectionSuccessPage /></ProtectedRoute>} />
    <Route path="/connections/:id/error" element={<ProtectedRoute><ConnectionErrorPage /></ProtectedRoute>} />
    <Route path="/connections/:id" element={<ProtectedRoute><ConnectionDetailPage /></ProtectedRoute>} />

    {/* Settings */}
    <Route path="/settings/integrations" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
    <Route path="/settings/pipelines" element={<ProtectedRoute><PipelinesPage /></ProtectedRoute>} />
    <Route path="/settings/pipelines/new" element={<ProtectedRoute><PipelineWizardPage /></ProtectedRoute>} />
    <Route path="/settings/pipelines/:pipelineId/edit" element={<ProtectedRoute><PipelineEditPage /></ProtectedRoute>} />
    <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
    <Route path="/settings/enricher-data" element={<ProtectedRoute><EnricherDataPage /></ProtectedRoute>} />
    <Route path="/settings/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
    <Route path="/settings/upgrade" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
    <Route path="/settings/showcase" element={<ProtectedRoute><ShowcaseManagementPage /></ProtectedRoute>} />
    <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />

    {/* Admin-only */}
    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</Router>
```

## Route Protection

### ProtectedRoute

Requires authentication:

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);

  if (loading) return <SkeletonLoading />;

  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  return <>{children}</>;
};
```

### AdminRoute

Requires admin role:

```typescript
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <SkeletonLoading />;

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

## Page Layout

All protected pages use `PageLayout` from the component library:

```typescript
// src/app/pages/ActivitiesListPage.tsx
export const ActivitiesListPage: React.FC = () => {
  return (
    <PageLayout title="Activities" breadcrumbs={['Dashboard', 'Activities']}>
      {/* Page content */}
    </PageLayout>
  );
};
```

## Navigation Patterns

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/settings/pipelines');
  };
};
```

### Link Component

Use the library `Link` component for internal navigation:

```typescript
import { Link } from '@/components/library';

<Link to="/activities">View Activities</Link>
```

### BackLink

For pages with clear parent relationships:

```typescript
import { BackLink } from '@/components/library';

<BackLink to="/settings/pipelines">Back to Pipelines</BackLink>
```

### Route Parameters

```typescript
import { useParams } from 'react-router-dom';

const ActivityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  // Use real-time hooks with the ID
  const { pipelineRuns } = useRealtimePipelineRuns();
  const run = pipelineRuns.find(r => r.activityId === id);
};
```

## Page Components

All page components are in `src/app/pages/`:

```
pages/
├── DashboardPage.tsx              # Main dashboard with panels
├── ActivitiesListPage.tsx         # Activity gallery
├── ActivityDetailPage.tsx         # Activity detail + trace
├── UnsynchronizedDetailPage.tsx   # Failed activity detail
├── PendingInputsPage.tsx          # Pending inputs list
├── ConnectionsPage.tsx            # Connected services
├── ConnectionDetailPage.tsx       # Integration detail
├── ConnectionSetupPage.tsx        # OAuth setup flow
├── ConnectionSuccessPage.tsx      # OAuth success landing
├── ConnectionErrorPage.tsx        # OAuth error landing
├── PipelinesPage.tsx              # Pipeline list
├── PipelineWizardPage.tsx         # Create pipeline wizard
├── PipelineEditPage.tsx           # Edit pipeline
├── AccountSettingsPage.tsx        # Profile, password, delete
├── SubscriptionPage.tsx           # Subscription management
├── ShowcaseManagementPage.tsx     # Showcase management
├── EnricherDataPage.tsx           # Personal records, etc.
├── RecipesPage.tsx                # Recipe browser
├── AdminPage.tsx                  # Admin console
└── NotFoundPage.tsx               # 404 handler
```

## Adding a New Route

1. Create page component in `src/app/pages/`
2. Add route to `src/app/App.tsx`
3. Update this documentation (`web/docs/react-app/routing.md`)
4. Add navigation from relevant pages

## Related Documentation

- [State Management](./state-management.md) - Data loading in pages
- [API Integration](./api-integration.md) - Mutations from pages
- [Authentication](../architecture/authentication.md) - Auth flow
