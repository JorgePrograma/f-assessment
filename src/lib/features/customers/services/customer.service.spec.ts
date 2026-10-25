import { describe, expect, it, vi } from 'vitest';
import { jsonResponse } from '#lib/core/testing/http.fixtures.ts';
import { buildCustomerDto, buildMeta } from '#lib/features/customers/testing/customer.fixtures.ts';
import { CustomerService } from './customer.service.ts';
import { HttpClient } from '#lib/core/http/http-client.ts';

function createService(response: Response) {
	const fetchFn = vi.fn().mockResolvedValue(response);
	return { service: new CustomerService(new HttpClient('http://api.test', fetchFn)), fetchFn };
}

describe('CustomerService', () => {
	it('lists customers mapping the DTO into the UI model (AC-01)', async () => {
		const meta = buildMeta({ total: 1 });
		const { service, fetchFn } = createService(
			jsonResponse({ success: true, data: [buildCustomerDto()], meta })
		);

		const page = await service.list({ status: 'BLOCKED', search: '  ana ', page: 3, size: 10 });

		expect(String(fetchFn.mock.calls[0][0])).toBe(
			'http://api.test/customers?status=BLOCKED&search=ana&page=3&size=10'
		);
		expect(page.meta).toEqual(meta);
		expect(page.items[0]).toEqual({
			id: '3024a60e-c2c1-4cea-a189-955366d55088',
			name: 'Juan Pérez',
			email: 'juan@example.com',
			status: 'PENDING',
			createdAt: new Date('2026-10-25T05:09:26.640552Z')
		});
	});

	it('updates the status with PATCH and returns the mapped customer (AC-17)', async () => {
		const { service, fetchFn } = createService(
			jsonResponse({ success: true, data: buildCustomerDto({ status: 'ACTIVE' }) })
		);

		const customer = await service.updateStatus('abc/1', 'ACTIVE');

		expect(String(fetchFn.mock.calls[0][0])).toBe('http://api.test/customers/abc%2F1/status');
		expect(fetchFn.mock.calls[0][1]).toMatchObject({
			method: 'PATCH',
			body: '{"status":"ACTIVE"}'
		});
		expect(customer.status).toBe('ACTIVE');
		expect(customer.createdAt).toBeInstanceOf(Date);
	});

	it('creates a customer with POST, sending trimmed values (AC-18)', async () => {
		const { service, fetchFn } = createService(
			jsonResponse({ success: true, data: buildCustomerDto({ name: 'Ana' }) }, 201)
		);

		const customer = await service.create({ name: '  Ana ', email: ' ana@example.com ' });

		expect(String(fetchFn.mock.calls[0][0])).toBe('http://api.test/customers');
		expect(fetchFn.mock.calls[0][1]).toMatchObject({
			method: 'POST',
			body: '{"name":"Ana","email":"ana@example.com"}'
		});
		expect(customer.name).toBe('Ana');
	});

	it('reads the summary for the metric cards (AC-22)', async () => {
		const { service, fetchFn } = createService(
			jsonResponse({
				success: true,
				data: { total: 3, by_status: { ACTIVE: 1, PENDING: 2, BLOCKED: 0 }, registrations: [] }
			})
		);

		const summary = await service.summary();

		expect(String(fetchFn.mock.calls[0][0])).toBe('http://api.test/customers/summary');
		expect(summary).toEqual({ total: 3, byStatus: { ACTIVE: 1, PENDING: 2, BLOCKED: 0 } });
	});
});
