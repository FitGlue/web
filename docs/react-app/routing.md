# Routing

The React app uses **React Router v6** for client-side navigation. Routes are defined in `src/app/App.tsx`.

## Route Structure

| Path | Component | Protection | Purpose |
|------|-----------|------------|---------|
| `/` | `DashboardPage` | Protected | Main dashboard |
| `/inputs` | `PendingInputsPage` | Protected | Pending user inputs |
| `/activities` | `ActivitiesListPage` | Protected | Activity history |
| `/activities/:id` | `ActivityDetailPage` | Protected | Single activity |
| `/activities/unsynchronized/:id` | `UnsynchronizedDetailPage` | Protected | Failed sync detail |
| `/settings` | `SettingsPage` | Protected | Settings hub |
| `/settings/integrations` | `IntegrationsPage` | Protected | Connected services |
| `/settings/pipelines` | `PipelinesPage` | Protected | Pipeline list |
| `/settings/pipelines/new` | `PipelineWizardPage` | Protected | Create pipeline |
| `/settings/pipelines/:id/edit` | `PipelineEditPage` | Protected | Edit pipeline |
| `/settings/account` | `AccountSettingsPage` | Protected | Account settings |
| `/settings/upgrade` | `UpgradePage` | Protected | Pro upgrade |
| `/admin` | `AdminPage` | Admin | Admin console |
| `*` | `NotFoundPage` | None | 404 handler |

## Route Configuration

```typescript
// src/app/App.tsx
<Router basename="/app">
  <Routes>
    {/* Protected routes */}
    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

    {/* Admin-only routes */}
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

  if (loading) return <div>Loading...</div>;

  if (!user) {
    window.location.href = '/auth/login';
    return <div>Redirecting...</div>;
  }

  return <>{children}</>;
};
```

### AdminRoute

Requires admin role:

```typescript
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user?.isAdmin) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
};
```

## 404 Handling

The `NotFoundPage` redirects to dashboard with a toast notification:

```typescript
// src/app/pages/NotFoundPage.tsx
useEffect(() => {
  // Set flash message
  sessionStorage.setItem('404-redirect', 'true');
  navigate('/', { replace: true });
}, [navigate]);
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

```typescript
import { Link } from 'react-router-dom';

<Link to="/activities">View Activities</Link>
```

### Route Parameters

```typescript
import { useParams } from 'react-router-dom';

const ActivityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  // Fetch activity by id
};
```

## Page Components

All page components are in `src/app/pages/`:

```
pages/
├── DashboardPage.tsx        # Main dashboard
├── ActivitiesListPage.tsx   # Activity list
├── ActivityDetailPage.tsx   # Activity detail
├── PendingInputsPage.tsx    # Pending inputs
├── SettingsPage.tsx         # Settings hub
├── IntegrationsPage.tsx     # Connected services
├── PipelinesPage.tsx        # Pipeline list
├── PipelineWizardPage.tsx   # Create pipeline
├── PipelineEditPage.tsx     # Edit pipeline
├── AccountSettingsPage.tsx  # Account settings
├── UpgradePage.tsx          # Pro upgrade
├── AdminPage.tsx            # Admin console
└── NotFoundPage.tsx         # 404 handler
```

## Related Documentation

- [State Management](./state-management.md)
- [API Integration](./api-integration.md)
- [Authentication](../architecture/authentication.md)
