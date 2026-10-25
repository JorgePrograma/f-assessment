import {
	isCustomerStatus,
	type CustomerQuery
} from '#lib/features/customers/models/customer.model.ts';

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
const MAX_SEARCH_LENGTH = 100;

export const EMPTY_QUERY: CustomerQuery = {
	status: null,
	search: '',
	page: 1,
	size: DEFAULT_PAGE_SIZE
};

/** Reads the query from the URL, silently discarding anything invalid (AC-08). */
export function parseCustomerQuery(params: Pick<URLSearchParams, 'get'>): CustomerQuery {
	const status = params.get('status');
	const page = Number(params.get('page'));
	const size = Number(params.get('size'));

	return {
		status: isCustomerStatus(status) ? status : null,
		search: (params.get('search') ?? '').slice(0, MAX_SEARCH_LENGTH),
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		size: (PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE
	};
}

/** Serializes the query for the URL, omitting default values to keep links short. */
export function toSearchParams(query: CustomerQuery): URLSearchParams {
	const params = new URLSearchParams();
	if (query.status) params.set('status', query.status);
	if (query.search.trim()) params.set('search', query.search.trim());
	if (query.page > 1) params.set('page', String(query.page));
	if (query.size !== DEFAULT_PAGE_SIZE) params.set('size', String(query.size));
	return params;
}

export function hasActiveFilters(query: CustomerQuery): boolean {
	return query.status !== null || query.search.trim() !== '';
}
