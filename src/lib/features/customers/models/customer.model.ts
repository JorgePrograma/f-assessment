export const CUSTOMER_STATUSES = ['ACTIVE', 'PENDING', 'BLOCKED'] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface Customer {
	id: string;
	name: string;
	email: string;
	status: CustomerStatus;
	createdAt: Date;
}

export interface CreateCustomerInput {
	name: string;
	email: string;
}

export interface CustomerQuery {
	status: CustomerStatus | null;
	search: string;
	page: number;
	size: number;
}

export function isCustomerStatus(value: unknown): value is CustomerStatus {
	return CUSTOMER_STATUSES.includes(value as CustomerStatus);
}
