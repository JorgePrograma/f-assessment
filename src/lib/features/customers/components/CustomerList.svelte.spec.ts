import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { buildCustomer } from '#lib/features/customers/testing/customer.fixtures.ts';
import CustomerList from './CustomerList.svelte';

vi.mock('$app/paths', () => ({
	resolve: (path: string, params?: { id: string }) =>
		params ? path.replace('[id]', params.id) : path
}));

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
		render(CustomerList, { customers });

		const table = page.getByRole('table');
		await expect.element(table).toBeVisible();
		await expect
			.element(table.getByRole('columnheader', { name: 'Fecha de registro' }))
			.toBeVisible();
		await expect.element(table.getByText('ana@example.com')).toBeVisible();
		await expect.element(table.getByText('Bloqueado')).toBeVisible();
		await expect.element(page.getByTestId('customer-cards')).not.toBeVisible();
	});

	it('switches to cards on mobile (AC-02)', async () => {
		await page.viewport(375, 800);
		render(CustomerList, { customers });

		await expect.element(page.getByTestId('customer-cards')).toBeVisible();
		await expect.element(page.getByTestId('customer-table')).not.toBeVisible();
		await expect
			.element(page.getByTestId('customer-cards').getByText('Luis Pérez', { exact: true }))
			.toBeVisible();
	});

	it('links "Ver detalle" and "Cambiar estado" to the customer page (AC-15)', async () => {
		await page.viewport(1280, 800);
		render(CustomerList, { customers });

		const table = page.getByTestId('customer-table');
		await expect
			.element(table.getByRole('link', { name: /Ver detalle.*Luis Pérez/ }))
			.toHaveAttribute('href', '/customers/2');
		await expect
			.element(table.getByRole('link', { name: /Cambiar estado.*Luis Pérez/ }))
			.toHaveAttribute('href', '/customers/2#estado');
	});

	it('links the cards to the customer page on mobile (AC-15)', async () => {
		await page.viewport(375, 800);
		render(CustomerList, { customers });

		await expect
			.element(
				page.getByTestId('customer-cards').getByRole('link', { name: /Ver detalle.*Ana López/ })
			)
			.toHaveAttribute('href', '/customers/1');
	});
});
