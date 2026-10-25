import type { CustomerStatus } from './customer.model.ts';

/** Totals of the customer base, shown in the dashboard metric cards. */
export interface CustomerSummary {
	total: number;
	byStatus: Record<CustomerStatus, number>;
}
