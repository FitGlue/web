/**
 * Layout Component Library - Barrel Export
 *
 * Import layout primitives from one place:
 * import { Container, Stack, Grid } from '../components/layout';
 */

// Page structure
export { PageLayout } from './PageLayout';
export { SettingsLayout } from './SettingsLayout';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';
export { Section } from './Section';
export { AppHeader } from './AppHeader';
export { AppHeader as AppBar } from './AppHeader';
export { Footer } from './Footer';

// Navigation chrome — unified system
export { AvatarMenu } from './AvatarMenu';
export { CommandPalette } from './CommandPalette';
export { PageAction } from './PageAction';
export type { PageActionProps, PageActionTone } from './PageAction';
export { SubNavTabs } from './SubNavTabs';
export type { SubNavTab, SubNavTabsProps } from './SubNavTabs';
export { OverflowMenu } from './OverflowMenu';
export type { OverflowMenuItem, OverflowMenuProps } from './OverflowMenu';

// Layout primitives
export { Container } from './Container';
export { Stack } from './Stack';
export { Grid } from './Grid';

// Semantic layout components
export { FieldRow } from './FieldRow';
export { ModalSection } from './ModalSection';
export { SettingsSection } from './SettingsSection';
export { FeatureItem } from './FeatureItem';

// Long-form / legal prose wrapper
export { LegalProse } from './LegalProse';
export type { LegalProseProps } from './LegalProse';

// Dashboard layout primitives
export { DashboardLayout, DashboardBody, DashboardCol } from './DashboardLayout';
