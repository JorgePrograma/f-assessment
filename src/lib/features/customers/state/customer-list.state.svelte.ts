import { isAbortError } from '#lib/core/http/api-error.ts';
import type { CustomerService } from '#lib/features/customers/services/customer.service.ts';
import type { PaginationMeta } from '#lib/core/http/api.model.ts';
import type { Customer, CustomerQuery } from '#lib/features/customers/models/customer.model.ts';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export class CustomerListState {
	customers = $state<Customer[]>([]);
	meta = $state<PaginationMeta | null>(null);
	status = $state<LoadStatus>('idle');
	error = $state<unknown>(null);

	isInitialLoading = $derived(
		this.meta === null && (this.status === 'idle' || this.status === 'loading')
	);
	isRefreshing = $derived(this.meta !== null && this.status === 'loading');
	isEmpty = $derived(this.status === 'success' && this.customers.length === 0);

	readonly #api: CustomerService;
	#controller: AbortController | null = null;
	#lastQuery: CustomerQuery | null = null;

	constructor(api: CustomerService) {
		this.#api = api;
	}

	async load(query: CustomerQuery): Promise<void> {
		this.#controller?.abort();
		const controller = new AbortController();
		this.#controller = controller;
		this.#lastQuery = query;

		this.status = 'loading';
		this.error = null;
		try {
			const page = await this.#api.list(query, controller.signal);
			if (controller.signal.aborted) return;
			this.customers = page.items;
			this.meta = page.meta;
			this.status = 'success';
		} catch (error) {
			if (isAbortError(error) || controller.signal.aborted) return;
			this.error = error;
			this.status = 'error';
		}
	}

	reload(): Promise<void> {
		return this.#lastQuery ? this.load(this.#lastQuery) : Promise.resolve();
	}

	dispose(): void {
		this.#controller?.abort();
	}
}
