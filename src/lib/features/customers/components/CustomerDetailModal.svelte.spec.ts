import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ApiError } from '#lib/core/http/api-error.ts';
import { buildCustomer } from '#lib/features/customers/testing/customer.fixtures.ts';
import CustomerDetailModal from './CustomerDetailModal.svelte';

const customer = buildCustomer({ name: 'Ana López', email: 'ana@example.com', status: 'PENDING' });

describe('CustomerDetailModal', () => {
	it('shows every field of the customer (AC-15)', async () => {
		render(CustomerDetailModal, { customer, onclose: vi.fn(), onstatuschange: vi.fn() });

		const dialog = page.getByRole('dialog', { name: 'Detalle del cliente' });
		await expect.element(dialog).toBeVisible();
		await expect.element(dialog.getByText('Ana López')).toBeVisible();
		await expect.element(dialog.getByRole('link', { name: 'ana@example.com' })).toBeVisible();
		await expect.element(dialog.getByText('Pendiente', { exact: true }).first()).toBeVisible();
		await expect.element(dialog.getByText(customer.id)).toBeVisible();
	});

	it('closes with Escape and with the close button (AC-16)', async () => {
		const onclose = vi.fn();
		render(CustomerDetailModal, { customer, onclose, onstatuschange: vi.fn() });

		await userEvent.keyboard('{Escape}');
		expect(onclose).toHaveBeenCalledTimes(1);
	});

	it('closes with the close button (AC-16)', async () => {
		const onclose = vi.fn();
		render(CustomerDetailModal, { customer, onclose, onstatuschange: vi.fn() });

		await page.getByRole('button', { name: 'Cerrar' }).click();
		expect(onclose).toHaveBeenCalledTimes(1);
	});

	it('saves a new status (AC-17)', async () => {
		const onstatuschange = vi.fn().mockResolvedValue(undefined);
		render(CustomerDetailModal, { customer, onclose: vi.fn(), onstatuschange });

		const save = page.getByRole('button', { name: 'Guardar' });
		await expect.element(save).toBeDisabled();

		await page.getByLabelText('Cambiar estado').selectOptions('Activo');
		await save.click();

		expect(onstatuschange).toHaveBeenCalledWith(customer, 'ACTIVE');
		await expect.element(page.getByText('Estado actualizado')).toBeVisible();
	});

	it('keeps the modal open and shows the error when saving fails (AC-17)', async () => {
		const onclose = vi.fn();
		const onstatuschange = vi
			.fn()
			.mockRejectedValue(new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'offline' }));
		render(CustomerDetailModal, { customer, onclose, onstatuschange });

		await page.getByLabelText('Cambiar estado').selectOptions('Bloqueado');
		await page.getByRole('button', { name: 'Guardar' }).click();

		await expect.element(page.getByRole('alert')).toHaveTextContent(/conectar con el servidor/);
		await expect.element(page.getByRole('dialog')).toBeVisible();
		expect(onclose).not.toHaveBeenCalled();
	});
});
