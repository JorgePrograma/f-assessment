export { default as CustomerDetailScreen } from './screens/CustomerDetailScreen.svelte';
export { default as CustomerListSection } from './components/CustomerListSection.svelte';
export { default as StatusBadge } from './components/StatusBadge.svelte';
export { STATUS_PRESENTATION } from './components/customer-status.ts';
export { CUSTOMER_STATUSES } from './models/customer.model.ts';
export type { Customer, CustomerQuery, CustomerStatus } from './models/customer.model.ts';
export { parseCustomerQuery, toSearchParams } from './utils/customer-query.ts';
