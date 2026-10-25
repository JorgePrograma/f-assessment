import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { buildCustomer } from '#lib/features/customers/testing/customer.fixtures.ts';
import CustomerList from './CustomerList.svelte';

const customers = [
	buildCustomer({ id: '1', name: 'Ana López', email: 'ana@example.com', status: 'ACTIVE' }),
	buildCustomer({ id: '2', name: 'Luis Pérez', email: 'luis@corp.com', status: 'BLOCKED' })
];

afterEach(async () => {
	await page.viewport(1280, 800);
});

describe('CustomerList', () => {
	it('shows name, email, status and registration date in a table on desktop (AC-01, AC-02)', async () => {
		await page.viewport(1280, 800);
		render(CustomerList, { customers, onselect: vi.fn() });

		const table = page.getByRole('table');
		await expect.element(table).toBeVisible();
		await expect
			.element(table.getByRole('columnheader', { name: 'Fecha de registro' }))
			.toBeVisible();
		await expect.element(table.getByRole('cell', { name: 'ana@example.com' })).toBeVisible();
		await expect.element(table.getByText('Bloqueado')).toBeVisible();
		await expect.element(page.getByTestId('customer-cards')).not.toBeVisible();
	});

	it('switches to cards on mobile (AC-02)', async () => {
		await page.viewport(375, 800);
		render(CustomerList, { customers, onselect: vi.fn() });

		await expect.element(page.getByTestId('customer-cards')).toBeVisible();
		await expect.element(page.getByTestId('customer-table')).not.toBeVisible();
		await expect
			.element(page.getByTestId('customer-cards').getByText('Luis Pérez', { exact: true }))
			.toBeVisible();
	});

	it('reports the customer when "Ver detalle" is pressed (AC-15)', async () => {
		await page.viewport(1280, 800);
		const onselect = vi.fn();
		render(CustomerList, { customers, onselect });

		await page
			.getByTestId('customer-table')
			.getByRole('button', { name: /Ver detalle.*Luis Pérez/ })
			.click();

		expect(onselect).toHaveBeenCalledWith(customers[1]);
	});
});
