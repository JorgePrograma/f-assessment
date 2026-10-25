import { ApiError, isAbortError } from '#lib/core/http/api-error.ts';
import type { Customer } from '#lib/features/customers/models/customer.model.ts';
import type { CustomerService } from '#lib/features/customers/services/customer.service.ts';

type DetailStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

export class CustomerDetailState {
	customer = $state<Customer | null>(null);
	status = $state<DetailStatus>('idle');
	error = $state<unknown>(null);

	readonly #api: CustomerService;
	#controller: AbortController | null = null;
	#lastId: string | null = null;

	constructor(api: CustomerService) {
		this.#api = api;
	}

	async load(id: string): Promise<void> {
		this.#controller?.abort();
		const controller = new AbortController();
		this.#controller = controller;
		this.#lastId = id;

		this.status = 'loading';
		this.error = null;
		try {
			const customer = await this.#api.getById(id, controller.signal);
			if (controller.signal.aborted) return;
			this.customer = customer;
			this.status = 'success';
		} catch (error) {
			if (isAbortError(error) || controller.signal.aborted) return;
			this.customer = null;
			this.error = error;
			this.status = isNotFound(error) ? 'not-found' : 'error';
		}
	}

	reload(): Promise<void> {
		return this.#lastId ? this.load(this.#lastId) : Promise.resolve();
	}

	replace(customer: Customer): void {
		this.customer = customer;
	}

	dispose(): void {
		this.#controller?.abort();
	}
}

function isNotFound(error: unknown): boolean {
	return (
		error instanceof ApiError &&
		(error.code === 'CUSTOMER_NOT_FOUND' || error.code === 'VALIDATION_ERROR')
	);
}
