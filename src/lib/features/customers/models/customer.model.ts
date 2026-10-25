export const CUSTOMER_STATUSES = ['ACTIVE', 'PENDING', 'BLOCKED'] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

/** Customer as used across the UI (camelCase, real Date). */
export interface Customer {
	id: string;
	name: string;
	email: string;
	status: CustomerStatus;
	createdAt: Date;
}

/** Data the user provides to register a customer; the API assigns id, status and date. */
export interface CreateCustomerInput {
	name: string;
	email: string;
}

/** Criteria for a customer listing; mirrors the `?status=&search=&page=` URL params. */
export interface CustomerQuery {
	status: CustomerStatus | null;
	search: string;
	page: number;
	size: number;
}

export function isCustomerStatus(value: unknown): value is CustomerStatus {
	return CUSTOMER_STATUSES.includes(value as CustomerStatus);
}
