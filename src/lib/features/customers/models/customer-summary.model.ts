import type { CustomerStatus } from './customer.model.ts';

export interface CustomerSummary {
	total: number;
	byStatus: Record<CustomerStatus, number>;
}
