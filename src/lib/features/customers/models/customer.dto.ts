import type { CustomerStatus } from './customer.model.ts';

/** Customer exactly as the API sends it (snake_case, ISO date string). Only services and mappers see it. */
export interface CustomerDto {
	id: string;
	name: string;
	email: string;
	status: CustomerStatus;
	created_at: string;
}

/** `GET /customers/summary` payload (only the fields the UI uses). */
export interface CustomerSummaryDto {
	total: number;
	by_status: Record<CustomerStatus, number>;
}
