import type { CustomerStatus } from './customer.model.ts';

export interface CustomerDto {
	id: string;
	name: string;
	email: string;
	status: CustomerStatus;
	created_at: string;
}

export interface CustomerSummaryDto {
	total: number;
	by_status: Record<CustomerStatus, number>;
}
