/**
 * Public API of the customers feature. Other parts of the app import from here,
 * never from the feature's internal folders.
 */
export { default as CustomerDashboardScreen } from './screens/CustomerDashboardScreen.svelte';
export { default as StatusBadge } from './components/StatusBadge.svelte';
export type { Customer, CustomerStatus } from './models/customer.model.ts';
