import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatusFilter from './StatusFilter.svelte';

describe('StatusFilter (AC-04)', () => {
	it('offers Todos, Activos, Pendientes and Bloqueados, marking the active one', async () => {
		render(StatusFilter, { value: 'PENDING', onchange: vi.fn() });

		const group = page.getByRole('group', { name: 'Filtrar por estado' });
		await expect
			.element(group.getByRole('button', { name: 'Todos' }))
			.toHaveAttribute('aria-pressed', 'false');
		await expect.element(group.getByRole('button', { name: 'Activos' })).toBeInTheDocument();
		await expect
			.element(group.getByRole('button', { name: 'Pendientes' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect.element(group.getByRole('button', { name: 'Bloqueados' })).toBeInTheDocument();
	});

	it('reports the chosen status, and null for "Todos"', async () => {
		const onchange = vi.fn();
		render(StatusFilter, { value: null, onchange });

		await page.getByRole('button', { name: 'Bloqueados' }).click();
		await page.getByRole('button', { name: 'Todos' }).click();

		expect(onchange.mock.calls).toEqual([['BLOCKED'], [null]]);
	});
});
