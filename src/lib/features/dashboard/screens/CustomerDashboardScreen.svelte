<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PageHeader } from '#lib/design-system/index.ts';
	import {
		CustomerListSection,
		parseCustomerQuery,
		toSearchParams,
		type CustomerStatus
	} from '#lib/features/customers/index.ts';
	import CustomerMetrics from '#lib/features/dashboard/components/CustomerMetrics.svelte';

	let metrics: ReturnType<typeof CustomerMetrics> | undefined = $state();

	const query = $derived(parseCustomerQuery(page.url.searchParams));

	function filterByStatus(status: CustomerStatus | null) {
		const params = toSearchParams({ ...query, page: 1, status }).toString();
		goto(resolve(params ? `/?${params}` : '/'), { replace: true, reset: false });
	}
</script>

<svelte:head>
	<title>Customer Dashboard</title>
	<meta name="description" content="Consulta y administra los clientes registrados." />
</svelte:head>

<main class="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
	<PageHeader
		title="Customer Dashboard"
		breadcrumbs={[{ label: 'Inicio', href: resolve('/') }, { label: 'Clientes' }]}
	/>

	<div class="mt-6">
		<CustomerMetrics bind:this={metrics} selected={query.status} onselect={filterByStatus} />
	</div>

	<CustomerListSection class="mt-4 sm:mt-6" onchange={() => metrics?.reload()} />
</main>
