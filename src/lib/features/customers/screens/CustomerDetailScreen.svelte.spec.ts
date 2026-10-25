import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ApiError } from '#lib/core/http/api-error.ts';
import { buildCustomer } from '#lib/features/customers/testing/customer.fixtures.ts';
import CustomerDetailScreen from './CustomerDetailScreen.svelte';

const mocks = vi.hoisted(() => ({
	getById: vi.fn(),
	updateStatus: vi.fn(),
	confirmAction: vi.fn(),
	showLoading: vi.fn(),
	showSuccess: vi.fn(),
	showError: vi.fn()
}));

vi.mock('#lib/features/customers/services/index.ts', () => ({
	customerService: { getById: mocks.getById, updateStatus: mocks.updateStatus }
}));
vi.mock('#lib/design-system/organisms/alerts.ts', () => ({
	confirmAction: mocks.confirmAction,
	showLoading: mocks.showLoading,
	showSuccess: mocks.showSuccess,
	showError: mocks.showError
}));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

const customer = buildCustomer({
	id: 'abc-123',
	name: 'Ana López',
	email: 'ana@example.com',
	status: 'PENDING'
});

beforeEach(() => {
	vi.clearAllMocks();
});

describe('CustomerDetailScreen', () => {
	it('loads the customer by id and shows every field (AC-16)', async () => {
		let resolve!: (value: unknown) => void;
		mocks.getById.mockReturnValue(new Promise((r) => (resolve = r)));
		render(CustomerDetailScreen, { customerId: 'abc-123' });

		await expect.element(page.getByTestId('customer-detail-skeleton')).toBeInTheDocument();
		expect(mocks.getById).toHaveBeenCalledWith('abc-123', expect.any(AbortSignal));

		resolve(customer);
		await expect.element(page.getByRole('heading', { name: 'Ana López' })).toBeVisible();
		await expect.element(page.getByRole('link', { name: 'ana@example.com' })).toBeVisible();
		await expect.element(page.getByText('abc-123')).toBeVisible();
		await expect.element(page.getByText('Pendiente').first()).toBeVisible();
	});

	it('shows "Cliente no encontrado" when the API answers 404 (AC-16)', async () => {
		mocks.getById.mockRejectedValue(
			new ApiError({ status: 404, code: 'CUSTOMER_NOT_FOUND', message: 'not found' })
		);
		render(CustomerDetailScreen, { customerId: 'missing' });

		await expect.element(page.getByText('Cliente no encontrado')).toBeVisible();
		await expect
			.element(page.getByRole('link', { name: 'Volver a clientes' }).first())
			.toHaveAttribute('href', '/');
	});

	it('offers a retry when loading fails (AC-16)', async () => {
		mocks.getById
			.mockRejectedValueOnce(new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'x' }))
			.mockResolvedValueOnce(customer);
		render(CustomerDetailScreen, { customerId: 'abc-123' });

		await expect.element(page.getByRole('alert')).toHaveTextContent(/conectar con el servidor/);
		await page.getByRole('button', { name: 'Reintentar' }).click();

		await expect.element(page.getByRole('heading', { name: 'Ana López' })).toBeVisible();
	});

	it('asks for confirmation before changing the status, then notifies success (AC-17, AC-25)', async () => {
		mocks.getById.mockResolvedValue(customer);
		mocks.confirmAction.mockResolvedValue(true);
		mocks.updateStatus.mockResolvedValue({ ...customer, status: 'BLOCKED' });
		render(CustomerDetailScreen, { customerId: 'abc-123' });

		await page.getByLabelText('Nuevo estado').selectOptions('Bloqueado');
		await page.getByRole('button', { name: 'Guardar' }).click();

		expect(mocks.confirmAction).toHaveBeenCalledWith(
			expect.objectContaining({
				text: 'Ana López pasará de Pendiente a Bloqueado.',
				tone: 'danger'
			})
		);
		expect(mocks.updateStatus).toHaveBeenCalledWith('abc-123', 'BLOCKED');
		expect(mocks.showLoading).toHaveBeenCalledWith('Actualizando estado…');
		await expect
			.poll(() => mocks.showSuccess)
			.toHaveBeenCalledWith('¡Listo!', 'Ana López ahora está Bloqueado.');
		await expect.element(page.getByText('Bloqueado').first()).toBeVisible();
	});

	it('does nothing when the confirmation is cancelled (AC-17)', async () => {
		mocks.getById.mockResolvedValue(customer);
		mocks.confirmAction.mockResolvedValue(false);
		render(CustomerDetailScreen, { customerId: 'abc-123' });

		await page.getByLabelText('Nuevo estado').selectOptions('Activo');
		await page.getByRole('button', { name: 'Guardar' }).click();

		await expect.poll(() => mocks.confirmAction).toHaveBeenCalled();
		expect(mocks.updateStatus).not.toHaveBeenCalled();
		await expect.element(page.getByLabelText('Nuevo estado')).toHaveValue('PENDING');
	});

	it('shows the error and keeps the previous status when saving fails (AC-17)', async () => {
		mocks.getById.mockResolvedValue(customer);
		mocks.confirmAction.mockResolvedValue(true);
		mocks.updateStatus.mockRejectedValue(
			new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'x' })
		);
		render(CustomerDetailScreen, { customerId: 'abc-123' });

		await page.getByLabelText('Nuevo estado').selectOptions('Activo');
		await page.getByRole('button', { name: 'Guardar' }).click();

		await expect
			.poll(() => mocks.showError)
			.toHaveBeenCalledWith('No se pudo cambiar el estado', expect.stringMatching(/conectar/));
		await expect.element(page.getByLabelText('Nuevo estado')).toHaveValue('PENDING');
	});
});
