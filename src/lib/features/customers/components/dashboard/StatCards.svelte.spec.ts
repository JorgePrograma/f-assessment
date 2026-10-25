import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatCards from './StatCards.svelte';

const summary = { total: 20, byStatus: { ACTIVE: 10, PENDING: 6, BLOCKED: 4 } };

describe('StatCards', () => {
	it('shows a skeleton until the summary arrives (AC-22)', async () => {
		render(StatCards, { summary: null, selected: null, onselect: vi.fn() });

		await expect.element(page.getByTestId('stat-card-skeleton').first()).toBeInTheDocument();
	});

	it('shows the total and each status with its share of the total (AC-22)', async () => {
		render(StatCards, { summary, selected: null, onselect: vi.fn() });

		await expect.element(page.getByRole('button', { name: /Total de clientes.*20/ })).toBeVisible();
		await expect.element(page.getByRole('button', { name: /Activos.*10.*50/ })).toBeVisible();
		await expect.element(page.getByRole('button', { name: /Pendientes.*6.*30/ })).toBeVisible();
		await expect.element(page.getByRole('button', { name: /Bloqueados.*4.*20/ })).toBeVisible();
	});

	it('filters by the clicked status and clears the filter when clicked again (AC-23)', async () => {
		const onselect = vi.fn();
		const screen = render(StatCards, { summary, selected: null, onselect });

		const pending = page.getByRole('button', { name: /Pendientes/ });
		await pending.click();
		expect(onselect).toHaveBeenLastCalledWith('PENDING');

		await screen.rerender({ selected: 'PENDING' });
		await expect.element(pending).toHaveAttribute('aria-pressed', 'true');
		await pending.click();
		expect(onselect).toHaveBeenLastCalledWith(null);
	});
});
