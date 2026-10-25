import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Pagination from './Pagination.svelte';

describe('Pagination (AC-07)', () => {
	it('shows the visible range and moves between pages', async () => {
		const onpagechange = vi.fn();
		render(Pagination, { page: 2, pageSize: 10, totalItems: 29, totalPages: 3, onpagechange });

		await expect.element(page.getByText('11–20')).toBeInTheDocument();
		await expect.element(page.getByText('Página 2 de 3')).toBeInTheDocument();

		await page.getByRole('button', { name: 'Anterior' }).click();
		await page.getByRole('button', { name: 'Siguiente' }).click();
		expect(onpagechange.mock.calls).toEqual([[1], [3]]);
	});

	it('disables the buttons at the edges', async () => {
		render(Pagination, {
			page: 3,
			pageSize: 10,
			totalItems: 29,
			totalPages: 3,
			onpagechange: vi.fn()
		});

		await expect.element(page.getByText('21–29')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Anterior' })).toBeEnabled();
	});

	it('hides the navigation when everything fits in one page', async () => {
		render(Pagination, {
			page: 1,
			pageSize: 10,
			totalItems: 4,
			totalPages: 1,
			onpagechange: vi.fn()
		});

		await expect.element(page.getByText('1–4')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
	});

	it('offers a rows-per-page selector when options are given (AC-24)', async () => {
		const onpagesizechange = vi.fn();
		render(Pagination, {
			page: 1,
			pageSize: 10,
			totalItems: 29,
			totalPages: 3,
			onpagechange: vi.fn(),
			pageSizeOptions: [5, 10, 20],
			onpagesizechange
		});

		const select = page.getByLabelText('Filas por página');
		await expect.element(select).toHaveValue('10');
		await select.selectOptions('20');

		expect(onpagesizechange).toHaveBeenCalledWith(20);
	});
});
