import type { SuccessResponse } from '#lib/core/http/api.model.ts';
import type { HttpClient } from '#lib/core/http/http-client.ts';
import { toCustomerSummary } from '#lib/features/dashboard/mappers/customer-summary.mapper.ts';
import type {
	CustomerSummary,
	CustomerSummaryDto
} from '#lib/features/dashboard/models/customer-summary.model.ts';

export class DashboardService {
	readonly #http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	async customerSummary(signal?: AbortSignal): Promise<CustomerSummary> {
		const response = await this.#http.request<SuccessResponse<CustomerSummaryDto>>(
			'/customers/summary',
			{ signal }
		);
		return toCustomerSummary(response.data);
	}
}
