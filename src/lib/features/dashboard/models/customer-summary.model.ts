import type { CustomerStatus } from '#lib/features/customers/index.ts';

export interface CustomerSummary {
	total: number;
	byStatus: Record<CustomerStatus, number>;
}

export interface CustomerSummaryDto {
	total: number;
	by_status: Record<CustomerStatus, number>;
}
