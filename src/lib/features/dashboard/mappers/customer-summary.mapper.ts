import type {
	CustomerSummary,
	CustomerSummaryDto
} from '#lib/features/dashboard/models/customer-summary.model.ts';

export function toCustomerSummary(dto: CustomerSummaryDto): CustomerSummary {
	return { total: dto.total, byStatus: dto.by_status };
}
