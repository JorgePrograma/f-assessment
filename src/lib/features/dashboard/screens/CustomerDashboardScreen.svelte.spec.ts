import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ApiError } from '#lib/core/http/api-error.ts';
import { buildCustomer, buildMeta } from '#lib/features/customers/testing/customer.fixtures.ts';
import CustomerDashboardScreen from './CustomerDashboardScreen.svelte';

const mocks = vi.hoisted(() => ({
	list: vi.fn(),
	summary: vi.fn(),
	create: vi.fn(),
	updateStatus: vi.fn(),
	goto: vi.fn(),
	showSuccess: vi.fn(),
	url: new URL('http://localhost/')
}));

vi.mock('#lib/features/customers/services/index.ts', () => ({
	customerService: { list: mocks.list, create: mocks.create, updateStatus: mocks.updateStatus }
}));
vi.mock('#lib/features/dashboard/services/index.ts', () => ({
	dashboardService: { customerSummary: mocks.summary }
}));
vi.mock('#lib/core/http/index.ts', async () => ({
	ApiError: (await import('#lib/core/http/api-error.ts')).ApiError,
	httpClient: {}
}));
vi.mock('$app/state', () => ({
	page: {
		get url() {
			return mocks.url;
		}
	}
}));
vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$app/paths', () => ({
	resolve: (path: string, params?: { id: string }) =>
		params ? path.replace('[id]', params.id) : path
}));
vi.mock('#lib/design-system/organisms/alerts.ts', () => ({
	confirmAction: vi.fn(),
	showLoading: vi.fn(),
	showSuccess: mocks.showSuccess,
	showError: vi.fn()
}));

const SUMMARY = { total: 29, byStatus: { ACTIVE: 14, PENDING: 12, BLOCKED: 3 } };

const table = () => page.getByTestId('customer-table');

beforeEach(() => {
	vi.clearAllMocks();
	mocks.url = new URL('http://localhost/');
	mocks.summary.mockResolvedValue(SUMMARY);
});

describe('CustomerDashboardScreen', () => {
	it('shows a skeleton while the first page loads, then the customers (AC-01, AC-09)', async () => {
		let resolve!: (value: unknown) => void;
		mocks.list.mockReturnValue(new Promise((r) => (resolve = r)));
		render(CustomerDashboardScreen);

		await expect.element(page.getByTestId('customer-skeleton')).toBeInTheDocument();

		resolve({ items: [buildCustomer({ name: 'Ana López' })], meta: buildMeta() });
		await expect.element(table().getByText('Ana López', { exact: true })).toBeVisible();
		await expect.element(page.getByTestId('customer-skeleton')).not.toBeInTheDocument();
	});

	it('shows a friendly error with a working retry button (AC-11)', async () => {
		mocks.list
			.mockRejectedValueOnce(new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'offline' }))
			.mockResolvedValueOnce({ items: [buildCustomer({ name: 'Ana López' })], meta: buildMeta() });
		render(CustomerDashboardScreen);

		await expect.element(page.getByRole('alert')).toHaveTextContent(/conectar con el servidor/);
		await page.getByRole('button', { name: 'Reintentar' }).click();

		await expect.element(table().getByText('Ana López', { exact: true })).toBeVisible();
	});

	it('explains that there are no customers yet (AC-12)', async () => {
		mocks.list.mockResolvedValue({ items: [], meta: buildMeta({ total: 0, pages: 0 }) });
		render(CustomerDashboardScreen);

		await expect.element(page.getByText('Aún no hay clientes registrados')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Limpiar filtros' }))
			.not.toBeInTheDocument();
	});

	it('offers to clear filters when they leave no results (AC-13, AC-06)', async () => {
		mocks.url = new URL('http://localhost/?status=BLOCKED&search=zzz&page=2');
		mocks.list.mockResolvedValue({ items: [], meta: buildMeta({ total: 0, pages: 0 }) });
		render(CustomerDashboardScreen);

		expect(mocks.list).toHaveBeenCalledWith(
			{ status: 'BLOCKED', search: 'zzz', page: 2, size: 10 },
			expect.any(AbortSignal)
		);
		await page.getByRole('button', { name: 'Limpiar filtros' }).click();

		expect(mocks.goto).toHaveBeenCalledWith('/', expect.objectContaining({ replace: true }));
	});

	it('writes filter changes to the URL starting again from page 1 (AC-06, AC-08)', async () => {
		mocks.url = new URL('http://localhost/?page=3');
		mocks.list.mockResolvedValue({ items: [buildCustomer()], meta: buildMeta() });
		render(CustomerDashboardScreen);

		await page
			.getByRole('group', { name: 'Filtrar por estado' })
			.getByRole('button', { name: 'Activos' })
			.click();

		expect(mocks.goto).toHaveBeenCalledWith('/?status=ACTIVE', expect.anything());
	});

	it('changes the page size from the pagination (AC-24)', async () => {
		mocks.url = new URL('http://localhost/?page=2');
		mocks.list.mockResolvedValue({ items: [buildCustomer()], meta: buildMeta({ pages: 3 }) });
		render(CustomerDashboardScreen);

		await page.getByLabelText('Filas por página').selectOptions('20');

		expect(mocks.goto).toHaveBeenCalledWith('/?size=20', expect.anything());
	});

	it('shows the metric cards and filters the list from them (AC-22, AC-23)', async () => {
		mocks.list.mockResolvedValue({ items: [buildCustomer()], meta: buildMeta() });
		render(CustomerDashboardScreen);

		const cards = page.getByRole('group', { name: 'Resumen de clientes' });
		await expect
			.element(cards.getByRole('button', { name: /Total de clientes.*29/ }))
			.toBeVisible();
		await cards.getByRole('button', { name: /Bloqueados.*3/ }).click();

		expect(mocks.goto).toHaveBeenCalledWith('/?status=BLOCKED', expect.anything());
	});

	it('links each customer to its own detail page instead of a modal (AC-15)', async () => {
		const customer = buildCustomer({ id: 'abc-123', name: 'Ana López' });
		mocks.list.mockResolvedValue({ items: [customer], meta: buildMeta() });
		render(CustomerDashboardScreen);

		const link = table().getByRole('link', { name: /Ver detalle.*Ana López/ });
		await expect.element(link).toHaveAttribute('href', '/customers/abc-123');
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('creates a customer, confirms it and reloads list and metrics (AC-18, AC-21)', async () => {
		const created = buildCustomer({ id: 'new-id', name: 'Nueva Cliente' });
		mocks.list.mockResolvedValue({ items: [buildCustomer()], meta: buildMeta() });
		mocks.create.mockResolvedValue(created);
		render(CustomerDashboardScreen);

		await page.getByRole('button', { name: 'Nuevo cliente' }).click();
		await page.getByLabelText('Nombre').fill('Nueva Cliente');
		await page.getByLabelText('Email').fill('nueva@example.com');
		await page.getByRole('button', { name: 'Crear cliente' }).click();

		expect(mocks.create).toHaveBeenCalledWith({
			name: 'Nueva Cliente',
			email: 'nueva@example.com'
		});
		await expect
			.poll(() => mocks.showSuccess)
			.toHaveBeenCalledWith('¡Cliente creado!', 'Nueva Cliente se registró con estado Pendiente.');
		await expect
			.element(page.getByRole('dialog', { name: 'Nuevo cliente' }))
			.not.toBeInTheDocument();
		await expect.poll(() => mocks.list).toHaveBeenCalledTimes(2);
		await expect.poll(() => mocks.summary).toHaveBeenCalledTimes(2);
	});
});
