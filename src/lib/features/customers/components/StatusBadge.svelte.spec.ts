import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatusBadge from './StatusBadge.svelte';

describe('StatusBadge (AC-03)', () => {
	it.each([
		['ACTIVE', 'Activo', 'emerald'],
		['PENDING', 'Pendiente', 'amber'],
		['BLOCKED', 'Bloqueado', 'rose']
	] as const)('renders %s as "%s" with its own color', async (status, label, color) => {
		render(StatusBadge, { status });

		const badge = page.getByText(label);
		await expect.element(badge).toBeInTheDocument();
		await expect.element(badge).toHaveClass(new RegExp(`bg-${color}-50`));
	});
});
