import type { CustomerStatus } from './customer.model.ts';

export interface CustomerDto {
	id: string;
	name: string;
	email: string;
	status: CustomerStatus;
	created_at: string;
}
