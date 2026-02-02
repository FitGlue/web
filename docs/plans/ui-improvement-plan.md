# FitGlue UI Improvement Plan

> **Created**: February 2026
> **Goal**: Migrate all pages to use component library, eliminate bare HTML, improve visual consistency

---

## Executive Summary

FitGlue has a well-designed component library in `src/app/components/library/` but several pages still use bare HTML elements. The `W15` lint rule currently flags these as warnings, with a TODO to promote to blocking errors once migration is complete.

**Current State**: 110 bare HTML instances across 6 page files
**Target State**: Zero bare HTML in non-library components, W15 promoted to ERROR

---

## 1. Current Component Library Inventory

### Available Components

| Category | Components | Status |
|----------|------------|--------|
| **Layout** | PageLayout, Stack, Grid, Container, Section, SettingsSection, FieldRow, ModalSection | ✅ Complete |
| **UI** | Button, Card, Badge, Modal, Pill, Heading, Paragraph, EmptyState, Icon, IconButton, List/ListItem, Code/CodeBlock, StatInline, etc. | ✅ Complete |
| **Forms** | Input, Select, Textarea, Checkbox, FormField, Form | ✅ Complete |
| **Navigation** | Link, BackLink | ✅ Complete |
| **Functional** | Wizard, Timeline, ActionMenu, TabbedCard, ConfirmDialog | ✅ Complete |
| **Data Display** | FlowVisualization, BoosterGrid, DashboardSummaryCard, SummaryListItem | ✅ Complete |

### Missing Components (Gaps Identified)

| Pattern in Codebase | Suggested Component | Priority |
|---------------------|---------------------|----------|
| Avatar roundel with gradient | `<Avatar initial="J" size="md" />` | Medium |
| Progress bar with fill | `<ProgressBar value={50} max={100} />` | Medium |
| Support/feature link cards | `<FeatureLink icon="📚" label="FAQ" to="/help" />` | Low |
| Stat card with label | `<StatCard value={10} label="Syncs" sublabel="This Month" />` | Low (StatInline exists) |

---

## 2. Page-by-Page Assessment

### Pages with Bare HTML (W15 Violations)

| Page | Bare HTML Count | Severity | Key Issues |
|------|-----------------|----------|------------|
| **AdminPage.tsx** | ~90 | High | Heavy use of divs, tables - explicitly excluded from W15 |
| **AccountSettingsPage.tsx** | 13 | Medium | Avatar div, stat cards, progress bars, support items |
| **ActivityDetailPage.tsx** | 2 | Low | Minor wrappers |
| **EnricherDataPage.tsx** | 2 | Low | Minor wrappers |
| **SubscriptionPage.tsx** | 2 | Low | Minor wrappers |
| **PipelinesPage.tsx** | 1 | Low | Disabled pipeline opacity wrapper |

### Pages Already Compliant ✅

- DashboardPage.tsx
- ActivitiesListPage.tsx
- ConnectionsPage.tsx
- PipelineWizardPage.tsx (excluded from W4)
- PipelineEditPage.tsx (excluded from W4)
- PendingInputsPage.tsx
- ConnectionSetupPage.tsx
- ConnectionSuccessPage.tsx
- ConnectionErrorPage.tsx
- NotFoundPage.tsx

---

## 3. Implementation Options

### Option A: Component-First Approach
*Create missing components, then migrate pages*

1. Create `Avatar` component
2. Create `ProgressBar` component
3. Migrate AccountSettingsPage
4. Migrate other pages
5. Promote W15 to ERROR

**Pros**: Clean abstractions, reusable components
**Cons**: Takes longer, may create components used only once

### Option B: Page-First Approach
*Migrate pages using existing components + inline solutions*

1. Migrate AccountSettingsPage (use Stack/Card for stat cards)
2. Migrate other pages
3. Identify truly reusable patterns
4. Extract components only if needed
5. Promote W15 to ERROR

**Pros**: Faster, pragmatic
**Cons**: May miss abstraction opportunities

### Option C: Hybrid Approach (Recommended)
*Create high-value components, migrate pages, iterate*

1. Create `Avatar` component (used in profile, likely reused)
2. Create `ProgressBar` component (used in subscription limits)
3. Migrate AccountSettingsPage
4. Migrate remaining 4 pages
5. Promote W15 to ERROR
6. Future: Visual polish pass on all pages

**Pros**: Balanced, creates value while moving fast
**Cons**: Requires judgment calls

---

## 4. Detailed Implementation Tasks

### Phase 1: Component Library Additions

#### 1.1 Avatar Component
```
Location: src/app/components/library/ui/Avatar/
Files: index.tsx, index.css

Props:
- initial: string (single character)
- size: 'sm' | 'md' | 'lg' (default: 'md')
- variant: 'gradient' | 'solid' (default: 'gradient')

Styling:
- Gradient background (primary → secondary)
- Centered white text
- Border radius full
- Size variants: 32px, 48px, 64px
```

#### 1.2 ProgressBar Component
```
Location: src/app/components/library/ui/ProgressBar/
Files: index.tsx, index.css

Props:
- value: number
- max: number (default: 100)
- variant: 'default' | 'gradient' (default: 'default')
- showLabel: boolean (default: false)
- size: 'sm' | 'md' (default: 'md')

Styling:
- Uses design tokens
- Animated fill
- Optional percentage label
```

### Phase 2: Page Migrations

#### 2.1 AccountSettingsPage.tsx

**Current bare HTML patterns:**
```tsx
// Avatar roundel
<div className="profile-avatar">{getInitial()}</div>

// Stat cards
<div className="account-stat-card">...</div>

// Progress bar
<div className="account-progress-bar">
  <div className="account-progress-fill" style={{ width: `${syncsPercentage}%` }} />
</div>

// Support items
<div className="account-support-item">
  <div className="account-support-icon">📚</div>
  <Paragraph size="sm">FAQ & Guides</Paragraph>
</div>
```

**Migration:**
```tsx
// Avatar → use new Avatar component
<Avatar initial={getInitial()} size="lg" />

// Stat cards → use Card + Stack
<Card variant="elevated">
  <Stack gap="xs">
    <Paragraph size="sm" muted>Syncs This Month</Paragraph>
    <Stack direction="horizontal" align="end" gap="xs">
      <Heading level={2}>{syncsUsed}</Heading>
      <Paragraph inline muted>/ {maxSyncs}</Paragraph>
    </Stack>
    <ProgressBar value={syncsUsed} max={maxSyncs} />
  </Stack>
</Card>

// Support items → use existing FeatureItem or Stack
<Link to="/help">
  <Stack direction="horizontal" gap="sm" align="center">
    <Icon>📚</Icon>
    <Paragraph size="sm">FAQ & Guides</Paragraph>
  </Stack>
</Link>
```

#### 2.2 Other Pages (Minor)

| Page | Change |
|------|--------|
| PipelinesPage | Replace `<div style={...}>` wrapper with Card variant or CSS class |
| ActivityDetailPage | Replace bare wrappers with Stack |
| EnricherDataPage | Replace bare wrappers with Stack |
| SubscriptionPage | Replace bare wrappers with Stack/Card |

### Phase 3: W15 Promotion

After all pages migrated:

```typescript
// In server/scripts/lint-codebase.ts
const ERROR_RULES = new Set([
  // ... existing rules ...
  // Web
  'W1', 'W3', 'W4', 'W7', 'W8', 'W9', 'W12', 'W13',
  'W15', // ← ADD THIS
]);
```

Remove the TODO comment:
```typescript
// REMOVE: // TODO: Re-add 'W15' to ERROR_RULES after all pages are migrated to use component library
```

---

## 5. Visual Polish Opportunities (Future)

Beyond W15 compliance, consider these enhancements:

### 5.1 Micro-interactions
- Button hover animations (already in Button.css)
- Card hover lift effect
- Page transition animations
- Loading skeleton shimmer (already exists)

### 5.2 Consistency Improvements
- Standardize card padding across all pages
- Ensure consistent heading hierarchy
- Normalize empty state messaging

### 5.3 Accessibility
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Color contrast verification

### 5.4 Dark Mode Refinements
- Review all semantic colors for contrast
- Ensure glow effects aren't too intense
- Test in both system themes

---

## 6. Recommended Execution Order

```
Week 1: Components + AccountSettingsPage
├── Create Avatar component
├── Create ProgressBar component
├── Migrate AccountSettingsPage
└── Test & review

Week 2: Remaining Pages + W15 Promotion
├── Migrate PipelinesPage (1 fix)
├── Migrate ActivityDetailPage (2 fixes)
├── Migrate EnricherDataPage (2 fixes)
├── Migrate SubscriptionPage (2 fixes)
├── Promote W15 to ERROR
└── Run full lint, verify green

Future: Visual Polish
├── Review micro-interactions
├── Consistency audit
├── Accessibility pass
```

---

## 7. Success Criteria

- [ ] `Avatar` component created and documented
- [ ] `ProgressBar` component created and documented
- [ ] AccountSettingsPage uses only library components
- [ ] All other flagged pages migrated
- [ ] W15 promoted to ERROR_RULES
- [ ] `npm run lint` passes in web directory
- [ ] `npx ts-node scripts/lint-codebase.ts` passes (or only has acceptable warnings)

---

## 8. Questions for Discussion

1. **AdminPage**: Currently excluded from W15. Should it remain excluded or be migrated separately?

2. **Component granularity**: Should we create `StatCard` as a separate component, or is `Card` + `Stack` sufficient?

3. **CSS approach**: Should new components use CSS modules (`.module.css`) or regular CSS with BEM-ish naming (current pattern)?

4. **Testing**: Should we add visual regression tests (e.g., Storybook, Chromatic) for the component library?

5. **Documentation**: Should we add a component showcase page or Storybook for the library?

---

## Appendix: File Locations

```
web/src/app/components/library/
├── ui/
│   ├── Avatar/          ← NEW
│   │   ├── index.tsx
│   │   └── index.css
│   ├── ProgressBar/     ← NEW
│   │   ├── index.tsx
│   │   └── index.css
│   ├── index.ts         ← Update exports
│   └── ...existing...
├── forms/
├── layout/
├── navigation/
└── functional/

server/scripts/lint-codebase.ts  ← Update W15 to ERROR
```
