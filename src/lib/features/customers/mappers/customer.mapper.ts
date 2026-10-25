import type { CustomerDto } from '#lib/features/customers/models/customer.dto.ts';
import type { Customer } from '#lib/features/customers/models/customer.model.ts';

export function toCustomer(dto: CustomerDto): Customer {
	return {
		id: dto.id,
		name: dto.name,
		email: dto.email,
		status: dto.status,
		createdAt: new Date(dto.created_at)
	};
}
