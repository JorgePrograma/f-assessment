import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '#lib/core/http/http-client.ts';
import { jsonResponse } from '#lib/core/testing/http.fixtures.ts';
import { DashboardService } from './dashboard.service.ts';

describe('DashboardService', () => {
	it('reads the customer summary for the metric cards (AC-22)', async () => {
		const fetchFn = vi.fn().mockResolvedValue(
			jsonResponse({
				success: true,
				data: { total: 3, by_status: { ACTIVE: 1, PENDING: 2, BLOCKED: 0 }, registrations: [] }
			})
		);
		const service = new DashboardService(new HttpClient('http://api.test', fetchFn));

		const summary = await service.customerSummary();

		expect(String(fetchFn.mock.calls[0][0])).toBe('http://api.test/customers/summary');
		expect(summary).toEqual({ total: 3, byStatus: { ACTIVE: 1, PENDING: 2, BLOCKED: 0 } });
	});
});
