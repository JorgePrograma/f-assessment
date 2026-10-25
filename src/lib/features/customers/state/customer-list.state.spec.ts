import { describe, expect, it, vi } from 'vitest';
import type { Page } from '#lib/core/http/api.model.ts';
import type { Customer, CustomerQuery } from '#lib/features/customers/models/customer.model.ts';
import { ApiError } from '#lib/core/http/api-error.ts';
import type { CustomerService } from '#lib/features/customers/services/customer.service.ts';
import { buildCustomer, buildMeta } from '#lib/features/customers/testing/customer.fixtures.ts';
import { EMPTY_QUERY } from '#lib/features/customers/utils/customer-query.ts';
import { CustomerListState } from './customer-list.state.svelte.ts';

type ListFn = (query: CustomerQuery, signal?: AbortSignal) => Promise<Page<Customer>>;

function createState(list: ListFn) {
	const service = { list: vi.fn(list) } as unknown as CustomerService;
	return { state: new CustomerListState(service), service };
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => (resolve = r));
	return { promise, resolve };
}

describe('CustomerListState', () => {
	it('starts in initial loading and exposes the data on success (AC-09)', async () => {
		const customers = [buildCustomer()];
		const { state } = createState(async () => ({ items: customers, meta: buildMeta() }));

		expect(state.isInitialLoading).toBe(true);
		await state.load(EMPTY_QUERY);

		expect(state.status).toBe('success');
		expect(state.customers).toEqual(customers);
		expect(state.isInitialLoading).toBe(false);
		expect(state.isEmpty).toBe(false);
	});

	it('keeps the previous data while refreshing (AC-10)', async () => {
		const next = deferred<Page<Customer>>();
		let calls = 0;
		const { state } = createState(() =>
			calls++ === 0
				? Promise.resolve({ items: [buildCustomer()], meta: buildMeta() })
				: next.promise
		);
		await state.load(EMPTY_QUERY);

		const pending = state.load({ ...EMPTY_QUERY, page: 2 });

		expect(state.isRefreshing).toBe(true);
		expect(state.isInitialLoading).toBe(false);
		expect(state.customers).toHaveLength(1);
		next.resolve({ items: [], meta: buildMeta({ total: 0, pages: 0 }) });
		await pending;
		expect(state.isRefreshing).toBe(false);
	});

	it('exposes API errors and recovers with reload (AC-11)', async () => {
		let fail = true;
		const { state, service } = createState(async () => {
			if (fail) throw new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'boom' });
			return { items: [], meta: buildMeta({ total: 0, pages: 0 }) };
		});

		await state.load(EMPTY_QUERY);
		expect(state.status).toBe('error');
		expect(state.error).toBeInstanceOf(ApiError);

		fail = false;
		await state.reload();
		expect(state.status).toBe('success');
		expect(state.error).toBeNull();
		expect(service.list).toHaveBeenLastCalledWith(EMPTY_QUERY, expect.any(AbortSignal));
	});

	it('flags an empty result (AC-12, AC-13)', async () => {
		const { state } = createState(async () => ({
			items: [],
			meta: buildMeta({ total: 0, pages: 0 })
		}));

		await state.load(EMPTY_QUERY);

		expect(state.isEmpty).toBe(true);
	});

	it('only applies the response of the latest request (AC-14)', async () => {
		const slow = deferred<Page<Customer>>();
		const fast = deferred<Page<Customer>>();
		const signals: AbortSignal[] = [];
		const { state } = createState((query, signal) => {
			signals.push(signal!);
			return query.search === 'a' ? slow.promise : fast.promise;
		});

		const first = state.load({ ...EMPTY_QUERY, search: 'a' });
		const second = state.load({ ...EMPTY_QUERY, search: 'ab' });
		fast.resolve({ items: [buildCustomer({ name: 'Latest' })], meta: buildMeta() });
		await second;
		slow.resolve({ items: [buildCustomer({ name: 'Stale' })], meta: buildMeta() });
		await first;

		expect(signals[0].aborted).toBe(true);
		expect(state.customers.map((customer) => customer.name)).toEqual(['Latest']);
	});
});
