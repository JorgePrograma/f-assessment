import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SearchInput from './SearchInput.svelte';

describe('SearchInput (AC-05)', () => {
	it('reports the value only once the user stops typing', async () => {
		const onsearch = vi.fn();
		render(SearchInput, { value: '', onsearch, label: 'Buscar clientes', delay: 150 });

		const input = page.getByLabelText('Buscar clientes');
		await input.fill('an');
		await input.fill('ana ');
		expect(onsearch).not.toHaveBeenCalled();

		await expect.poll(() => onsearch.mock.calls).toEqual([['ana']]);
	});

	it('clears immediately with the clear button', async () => {
		const onsearch = vi.fn();
		render(SearchInput, { value: 'ana', onsearch, label: 'Buscar clientes' });

		await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();

		expect(onsearch).toHaveBeenCalledWith('');
		await expect.element(page.getByLabelText('Buscar clientes')).toHaveValue('');
	});

	it('follows external changes of the value', async () => {
		const screen = render(SearchInput, {
			value: 'ana',
			onsearch: vi.fn(),
			label: 'Buscar clientes'
		});

		await screen.rerender({ value: '' });

		await expect.element(page.getByLabelText('Buscar clientes')).toHaveValue('');
	});
});
