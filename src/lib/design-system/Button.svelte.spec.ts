import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Button from './Button.svelte';

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button', () => {
	it('shows a pointer cursor when it can be clicked', async () => {
		render(Button, { children: label('Guardar') });

		const button = page.getByRole('button', { name: 'Guardar' }).element();
		expect(getComputedStyle(button).cursor).toBe('pointer');
	});

	it('shows a not-allowed cursor when disabled', async () => {
		render(Button, { children: label('Guardar'), disabled: true });

		const button = page.getByRole('button', { name: 'Guardar' }).element();
		expect(getComputedStyle(button).cursor).toBe('not-allowed');
	});
});
