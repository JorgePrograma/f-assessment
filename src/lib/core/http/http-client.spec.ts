import { describe, expect, it, vi } from 'vitest';
import { jsonResponse } from '#lib/core/testing/http.fixtures.ts';
import { ApiError } from './api-error.ts';
import { HttpClient } from './http-client.ts';

const BASE_URL = 'http://api.test';

describe('HttpClient', () => {
	it('builds the URL skipping empty query values and resolves the envelope', async () => {
		const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: [] }));
		const client = new HttpClient(BASE_URL, fetchFn);

		const body = await client.request('/customers', {
			query: { status: 'ACTIVE', search: '', page: 2, size: undefined }
		});

		expect(body).toEqual({ success: true, data: [] });
		expect(String(fetchFn.mock.calls[0][0])).toBe('http://api.test/customers?status=ACTIVE&page=2');
	});

	it('sends JSON bodies with the right content type', async () => {
		const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: {} }));
		const client = new HttpClient(BASE_URL, fetchFn);

		await client.request('/customers/1/status', { method: 'PATCH', body: { status: 'ACTIVE' } });

		const init = fetchFn.mock.calls[0][1] as RequestInit;
		expect(init.method).toBe('PATCH');
		expect(init.body).toBe('{"status":"ACTIVE"}');
		expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
	});

	it('turns the error envelope into an ApiError with code, details and request id', async () => {
		const fetchFn = vi.fn().mockResolvedValue(
			jsonResponse(
				{
					success: false,
					error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found', details: null }
				},
				404,
				{ 'X-Request-ID': 'req-1' }
			)
		);
		const client = new HttpClient(BASE_URL, fetchFn);

		const error = await client.request('/customers/x').catch((e: unknown) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			status: 404,
			code: 'CUSTOMER_NOT_FOUND',
			message: 'Customer not found',
			details: [],
			requestId: 'req-1'
		});
	});

	it('reports a non-JSON server failure as INVALID_RESPONSE', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 }));
		const client = new HttpClient(BASE_URL, fetchFn);

		await expect(client.request('/customers')).rejects.toMatchObject({
			status: 502,
			code: 'INVALID_RESPONSE'
		});
	});

	it('reports connection failures as NETWORK_ERROR', async () => {
		const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
		const client = new HttpClient(BASE_URL, fetchFn);

		await expect(client.request('/customers')).rejects.toMatchObject({
			status: 0,
			code: 'NETWORK_ERROR'
		});
	});

	it('lets aborted requests propagate untouched', async () => {
		const abort = new DOMException('Aborted', 'AbortError');
		const client = new HttpClient(BASE_URL, vi.fn().mockRejectedValue(abort));

		await expect(client.request('/customers')).rejects.toBe(abort);
	});
});
