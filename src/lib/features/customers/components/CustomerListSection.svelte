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
		Pagination,
		SearchInput,
		showSuccess
	} from '#lib/design-system/index.ts';
	import type {
		CreateCustomerInput,
		Customer,
		CustomerQuery
	} from '#lib/features/customers/models/customer.model.ts';
	import { customerService } from '#lib/features/customers/services/index.ts';
	import { CustomerListState } from '#lib/features/customers/state/customer-list.state.svelte.ts';
	import { getCustomerErrorMessage } from '#lib/features/customers/utils/customer-error-message.ts';
	import {
		hasActiveFilters,
		PAGE_SIZE_OPTIONS,
		parseCustomerQuery,
		toSearchParams
	} from '#lib/features/customers/utils/customer-query.ts';
	import CreateCustomerModal from './CreateCustomerModal.svelte';
	import CustomerList from './CustomerList.svelte';
	import CustomerListSkeleton from './CustomerListSkeleton.svelte';
	import StatusFilter from './StatusFilter.svelte';

	interface Props {
		onchange?: () => void;
		class?: string;
	}

	let { onchange, class: className = '' }: Props = $props();

	const list = new CustomerListState(customerService);
	const query = $derived(parseCustomerQuery(page.url.searchParams));
	const filtered = $derived(hasActiveFilters(query));

	let createOpen = $state(false);

	$effect(() => {
		list.load(query);
	});

	$effect(() => () => list.dispose());

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

	async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
		const customer = await customerService.create(input);
		createOpen = false;
		void showSuccess('¡Cliente creado!', `${customer.name} se registró con estado Pendiente.`);
		if (page.url.search) clearFilters();
		else void list.reload();
		onchange?.();
		return customer;
	}
</script>

<Card title="Clientes" description="Busca, filtra y gestiona cada cliente" flush class={className}>
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
		<div aria-busy={list.isRefreshing}>
			<CustomerList customers={list.customers} />
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

<CreateCustomerModal
	open={createOpen}
	onclose={() => (createOpen = false)}
	oncreate={createCustomer}
/>
