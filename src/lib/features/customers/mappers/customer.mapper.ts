import type {
	CustomerDto,
	CustomerSummaryDto
} from '#lib/features/customers/models/customer.dto.ts';
import type { CustomerSummary } from '#lib/features/customers/models/customer-summary.model.ts';
import type { Customer } from '#lib/features/customers/models/customer.model.ts';

/** Translates the API representation (snake_case, ISO strings) into the UI model. */
export function toCustomer(dto: CustomerDto): Customer {
	return {
		id: dto.id,
		name: dto.name,
		email: dto.email,
		status: dto.status,
		createdAt: new Date(dto.created_at)
	};
}

export function toCustomerSummary(dto: CustomerSummaryDto): CustomerSummary {
	return {
		total: dto.total,
		byStatus: dto.by_status
	};
}
