import { describe, expect, it } from 'vitest';
import {
	EMPTY_QUERY,
	hasActiveFilters,
	parseCustomerQuery,
	toSearchParams
} from './customer-query.ts';

describe('parseCustomerQuery (AC-08)', () => {
	it('reads status, search and page from the URL', () => {
		const query = parseCustomerQuery(new URLSearchParams('status=ACTIVE&search=ana&page=3'));

		expect(query).toEqual({ status: 'ACTIVE', search: 'ana', page: 3, size: EMPTY_QUERY.size });
	});

	it.each([
		['status=DELETED', { status: null }],
		['page=0', { page: 1 }],
		['page=-2', { page: 1 }],
		['page=1.5', { page: 1 }],
		['page=abc', { page: 1 }],
		['size=7', { size: 10 }],
		['size=1000', { size: 10 }]
	])('ignores invalid values: %s', (search, expected) => {
		expect(parseCustomerQuery(new URLSearchParams(search))).toMatchObject(expected);
	});

	it('defaults to the first page without filters', () => {
		expect(parseCustomerQuery(new URLSearchParams())).toEqual(EMPTY_QUERY);
	});
});

describe('toSearchParams', () => {
	it('omits default values to keep links short', () => {
		expect(toSearchParams(EMPTY_QUERY).toString()).toBe('');
	});

	it('serializes active filters and the page', () => {
		const params = toSearchParams({ status: 'BLOCKED', search: ' luis ', page: 2, size: 10 });

		expect(params.toString()).toBe('status=BLOCKED&search=luis&page=2');
	});

	it('serializes a non-default page size (AC-24)', () => {
		const params = toSearchParams({ status: null, search: '', page: 1, size: 20 });

		expect(params.toString()).toBe('size=20');
		expect(parseCustomerQuery(params).size).toBe(20);
	});

	it('round-trips through the parser', () => {
		const query = { status: 'PENDING' as const, search: 'corp', page: 4, size: EMPTY_QUERY.size };

		expect(parseCustomerQuery(toSearchParams(query))).toEqual(query);
	});
});

describe('hasActiveFilters', () => {
	it('is true only when a status or a non-blank search is set', () => {
		expect(hasActiveFilters(EMPTY_QUERY)).toBe(false);
		expect(hasActiveFilters({ ...EMPTY_QUERY, search: '   ' })).toBe(false);
		expect(hasActiveFilters({ ...EMPTY_QUERY, page: 3 })).toBe(false);
		expect(hasActiveFilters({ ...EMPTY_QUERY, status: 'ACTIVE' })).toBe(true);
		expect(hasActiveFilters({ ...EMPTY_QUERY, search: 'ana' })).toBe(true);
	});
});
