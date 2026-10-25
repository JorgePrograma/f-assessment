import { isAbortError } from '#lib/core/http/api-error.ts';
import type { CustomerSummary } from '#lib/features/customers/models/customer-summary.model.ts';
import type { CustomerService } from '#lib/features/customers/services/customer.service.ts';

export class CustomerSummaryState {
	summary = $state<CustomerSummary | null>(null);
	status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

	readonly #api: CustomerService;
	#controller: AbortController | null = null;

	constructor(api: CustomerService) {
		this.#api = api;
	}

	async load(): Promise<void> {
		this.#controller?.abort();
		const controller = new AbortController();
		this.#controller = controller;
		this.status = 'loading';
		try {
			const summary = await this.#api.summary(controller.signal);
			if (controller.signal.aborted) return;
			this.summary = summary;
			this.status = 'success';
		} catch (error) {
			if (isAbortError(error) || controller.signal.aborted) return;
			this.status = 'error';
		}
	}

	dispose(): void {
		this.#controller?.abort();
	}
}
