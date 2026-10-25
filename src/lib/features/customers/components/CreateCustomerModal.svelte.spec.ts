import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ApiError } from '#lib/core/http/api-error.ts';
import { buildCustomer } from '#lib/features/customers/testing/customer.fixtures.ts';
import CreateCustomerModal from './CreateCustomerModal.svelte';

function renderModal(oncreate = vi.fn().mockResolvedValue(buildCustomer())) {
	render(CreateCustomerModal, { open: true, onclose: vi.fn(), oncreate });
	return oncreate;
}

describe('CreateCustomerModal', () => {
	it('sends the typed name and email (AC-18)', async () => {
		const oncreate = renderModal();

		await page.getByLabelText('Nombre').fill('Ana López');
		await page.getByLabelText('Email').fill('ana@example.com');
		await page.getByRole('button', { name: 'Crear cliente' }).click();

		expect(oncreate).toHaveBeenCalledWith({ name: 'Ana López', email: 'ana@example.com' });
	});

	it('validates before sending and shows each error next to its field (AC-19)', async () => {
		const oncreate = renderModal();

		await page.getByLabelText('Email').fill('not-an-email');
		await page.getByRole('button', { name: 'Crear cliente' }).click();

		await expect.element(page.getByText('El nombre es obligatorio.')).toBeVisible();
		await expect.element(page.getByText('Ingresa un email válido.')).toBeVisible();
		await expect.element(page.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
		expect(oncreate).not.toHaveBeenCalled();
	});

	it('shows a duplicated email on the email field and keeps what was typed (AC-20)', async () => {
		renderModal(
			vi
				.fn()
				.mockRejectedValue(
					new ApiError({ status: 409, code: 'EMAIL_ALREADY_EXISTS', message: 'duplicated' })
				)
		);

		await page.getByLabelText('Nombre').fill('Ana López');
		await page.getByLabelText('Email').fill('ana@example.com');
		await page.getByRole('button', { name: 'Crear cliente' }).click();

		await expect.element(page.getByText('Ya existe un cliente con este email.')).toBeVisible();
		await expect.element(page.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
		await expect.element(page.getByLabelText('Nombre')).toHaveValue('Ana López');
		await expect.element(page.getByRole('dialog', { name: 'Nuevo cliente' })).toBeVisible();
	});

	it('shows non-field failures as a general message (AC-20)', async () => {
		renderModal(
			vi.fn().mockRejectedValue(new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'x' }))
		);

		await page.getByLabelText('Nombre').fill('Ana López');
		await page.getByLabelText('Email').fill('ana@example.com');
		await page.getByRole('button', { name: 'Crear cliente' }).click();

		await expect.element(page.getByRole('alert')).toHaveTextContent(/conectar con el servidor/);
	});
});
