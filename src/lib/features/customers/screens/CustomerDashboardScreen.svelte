<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ApiError } from '#lib/core/http/index.ts';
	import {
		Button,
		Card,
		EmptyState,
		ErrorState,
		PageHeader,
		Pagination,
		SearchInput,
		Toast
	} from '#lib/design-system/index.ts';
	import type {
		CreateCustomerInput,
		Customer,
		CustomerQuery,
		CustomerStatus
	} from '#lib/features/customers/models/customer.model.ts';
	import { customerService } from '#lib/features/customers/services/index.ts';
	import { CustomerListState } from '#lib/features/customers/state/customer-list.state.svelte.ts';
	import { CustomerSummaryState } from '#lib/features/customers/state/customer-summary.state.svelte.ts';
	import { getCustomerErrorMessage } from '#lib/features/customers/utils/customer-error-message.ts';
	import {
		hasActiveFilters,
		PAGE_SIZE_OPTIONS,
		parseCustomerQuery,
		toSearchParams
	} from '#lib/features/customers/utils/customer-query.ts';
	import CreateCustomerModal from '#lib/features/customers/components/CreateCustomerModal.svelte';
	import CustomerDetailModal from '#lib/features/customers/components/CustomerDetailModal.svelte';
	import CustomerList from '#lib/features/customers/components/CustomerList.svelte';
	import CustomerListSkeleton from '#lib/features/customers/components/CustomerListSkeleton.svelte';
	import StatusFilter from '#lib/features/customers/components/StatusFilter.svelte';
	import StatCards from '#lib/features/customers/components/dashboard/StatCards.svelte';

	const list = new CustomerListState(customerService);
	const summary = new CustomerSummaryState(customerService);
	const query = $derived(parseCustomerQuery(page.url.searchParams));
	const filtered = $derived(hasActiveFilters(query));

	let selectedCustomer = $state<Customer | null>(null);
	let createOpen = $state(false);
	let notice = $state<string | null>(null);

	$effect(() => {
		list.load(query);
	});

	$effect(() => {
		summary.load();
		return () => {
			summary.dispose();
			list.dispose();
		};
	});

	const announcement = $derived.by(() => {
		if (list.status === 'loading') return 'Cargando clientes…';
		if (list.status === 'error') return 'Error al cargar los clientes';
		if (list.status === 'success' && list.meta) return `${list.meta.total} clientes encontrados`;
		return '';
	});

	function updateQuery(changes: Partial<CustomerQuery>) {
		const params = toSearchParams({ ...query, page: 1, ...changes }).toString();
		goto(resolve(params ? `/?${params}` : '/'), { replace: true, reset: false });
	}

	function clearFilters() {
		updateQuery({ status: null, search: '' });
	}

	async function changeStatus(customer: Customer, status: CustomerStatus) {
		selectedCustomer = await customerService.updateStatus(customer.id, status);
		notice = 'Estado actualizado';
		await Promise.all([list.reload(), summary.load()]);
	}

	async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
		const customer = await customerService.create(input);
		createOpen = false;
		notice = `Cliente creado: ${customer.name}`;
		if (page.url.search) clearFilters();
		else void list.reload();
		void summary.load();
		return customer;
	}
</script>

<svelte:head>
	<title>Customer Dashboard</title>
	<meta name="description" content="Consulta y administra los clientes registrados." />
</svelte:head>

<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
	<PageHeader
		title="Customer Dashboard"
		breadcrumbs={[{ label: 'Inicio', href: resolve('/') }, { label: 'Clientes' }]}
	>
		{#snippet actions()}
			<Button onclick={() => (createOpen = true)} class="gap-1.5">
				<svg class="-ml-0.5 size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
					/>
				</svg>
				Nuevo cliente
			</Button>
		{/snippet}
	</PageHeader>

	<div class="mt-6">
		<StatCards
			summary={summary.summary}
			selected={query.status}
			onselect={(status) => updateQuery({ status })}
		/>
	</div>

	<Card
		title="Clientes"
		description="Busca, filtra y gestiona cada cliente"
		flush
		class="mt-4 sm:mt-6"
	>
		<div
			class="flex flex-col gap-3 px-4 pb-4 md:flex-row-reverse md:items-center md:justify-between md:px-6"
		>
			<div class="md:w-80">
				<SearchInput
					value={query.search}
					onsearch={(search) => updateQuery({ search })}
					label="Buscar clientes"
					placeholder="Buscar por nombre o email"
				/>
			</div>
			<StatusFilter value={query.status} onchange={(status) => updateQuery({ status })} />
		</div>

		{#if list.isRefreshing}
			<div class="h-0.5 animate-pulse bg-indigo-500" aria-hidden="true"></div>
		{/if}

		{#if list.isInitialLoading}
			<CustomerListSkeleton />
		{:else if list.status === 'error'}
			<ErrorState
				title="No se pudieron cargar los clientes"
				message={getCustomerErrorMessage(list.error)}
				requestId={list.error instanceof ApiError ? list.error.requestId : undefined}
				onretry={() => list.reload()}
			/>
		{:else if list.isEmpty}
			{#if list.meta && list.meta.total > 0}
				<EmptyState
					title="Esta página no existe"
					description="La página solicitada ya no tiene clientes."
				>
					{#snippet action()}
						<Button variant="secondary" onclick={() => updateQuery({})}>
							Ir a la primera página
						</Button>
					{/snippet}
				</EmptyState>
			{:else if filtered}
				<EmptyState
					title="Sin resultados"
					description="Ningún cliente coincide con la búsqueda o el filtro seleccionado."
				>
					{#snippet action()}
						<Button variant="secondary" onclick={clearFilters}>Limpiar filtros</Button>
					{/snippet}
				</EmptyState>
			{:else}
				<EmptyState
					title="Aún no hay clientes registrados"
					description="Cuando se registren clientes aparecerán en esta lista."
				>
					{#snippet action()}
						<Button onclick={() => (createOpen = true)}>Crear el primer cliente</Button>
					{/snippet}
				</EmptyState>
			{/if}
		{:else}
			<div
				aria-busy={list.isRefreshing}
				class="transition-opacity duration-150 {list.isRefreshing ? 'opacity-60' : ''}"
			>
				<CustomerList
					customers={list.customers}
					onselect={(customer) => (selectedCustomer = customer)}
				/>
			</div>
		{/if}

		{#if list.meta && list.status !== 'error' && list.customers.length > 0}
			<Pagination
				page={list.meta.page}
				pageSize={list.meta.size}
				totalItems={list.meta.total}
				totalPages={list.meta.pages}
				onpagechange={(pageNumber) => updateQuery({ page: pageNumber })}
				pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
				onpagesizechange={(size) => updateQuery({ size })}
			/>
		{/if}
	</Card>

	<p class="sr-only" aria-live="polite">{announcement}</p>
</main>

<CustomerDetailModal
	customer={selectedCustomer}
	onclose={() => (selectedCustomer = null)}
	onstatuschange={changeStatus}
/>

<CreateCustomerModal
	open={createOpen}
	onclose={() => (createOpen = false)}
	oncreate={createCustomer}
/>

<Toast message={notice} onclose={() => (notice = null)} />
