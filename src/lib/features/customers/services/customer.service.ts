import { toCustomer, toCustomerSummary } from '#lib/features/customers/mappers/customer.mapper.ts';
import type { Page, PaginatedResponse, SuccessResponse } from '#lib/core/http/api.model.ts';
import type {
	CustomerDto,
	CustomerSummaryDto
} from '#lib/features/customers/models/customer.dto.ts';
import type { CustomerSummary } from '#lib/features/customers/models/customer-summary.model.ts';
import type {
	CreateCustomerInput,
	Customer,
	CustomerQuery,
	CustomerStatus
} from '#lib/features/customers/models/customer.model.ts';
import type { HttpClient } from '#lib/core/http/http-client.ts';

/** Customer endpoints. Components never call `fetch` directly; they go through this service. */
export class CustomerService {
	readonly #http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	async list(query: CustomerQuery, signal?: AbortSignal): Promise<Page<Customer>> {
		const response = await this.#http.request<PaginatedResponse<CustomerDto>>('/customers', {
			query: {
				status: query.status,
				search: query.search.trim(),
				page: query.page,
				size: query.size
			},
			signal
		});
		return { items: response.data.map(toCustomer), meta: response.meta };
	}

	async summary(signal?: AbortSignal): Promise<CustomerSummary> {
		const response = await this.#http.request<SuccessResponse<CustomerSummaryDto>>(
			'/customers/summary',
			{ signal }
		);
		return toCustomerSummary(response.data);
	}

	async create(input: CreateCustomerInput): Promise<Customer> {
		const response = await this.#http.request<SuccessResponse<CustomerDto>>('/customers', {
			method: 'POST',
			body: { name: input.name.trim(), email: input.email.trim() }
		});
		return toCustomer(response.data);
	}

	async updateStatus(id: string, status: CustomerStatus): Promise<Customer> {
		const response = await this.#http.request<SuccessResponse<CustomerDto>>(
			`/customers/${encodeURIComponent(id)}/status`,
			{ method: 'PATCH', body: { status } }
		);
		return toCustomer(response.data);
	}
}
