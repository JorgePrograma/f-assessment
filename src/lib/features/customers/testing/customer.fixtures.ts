import type { PaginationMeta } from '#lib/core/http/api.model.ts';
import type { CustomerDto } from '#lib/features/customers/models/customer.dto.ts';
import type { Customer } from '#lib/features/customers/models/customer.model.ts';

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
	return {
		id: '3024a60e-c2c1-4cea-a189-955366d55088',
		name: 'Juan Pérez',
		email: 'juan@example.com',
		status: 'PENDING',
		createdAt: new Date('2026-10-25T05:09:26Z'),
		...overrides
	};
}

export function buildCustomerDto(overrides: Partial<CustomerDto> = {}): CustomerDto {
	return {
		id: '3024a60e-c2c1-4cea-a189-955366d55088',
		name: 'Juan Pérez',
		email: 'juan@example.com',
		status: 'PENDING',
		created_at: '2026-10-25T05:09:26.640552Z',
		...overrides
	};
}

export function buildMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
	return { page: 1, size: 10, total: 1, pages: 1, ...overrides };
}
