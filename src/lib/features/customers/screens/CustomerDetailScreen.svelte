<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDateTime } from '#lib/core/utils/format.ts';
	import {
		Avatar,
		Button,
		Card,
		confirmAction,
		EmptyState,
		ErrorState,
		LinkButton,
		PageHeader,
		showError,
		showLoading,
		showSuccess
	} from '#lib/design-system/index.ts';
	import { STATUS_PRESENTATION } from '#lib/features/customers/components/customer-status.ts';
	import StatusBadge from '#lib/features/customers/components/StatusBadge.svelte';
	import {
		CUSTOMER_STATUSES,
		type CustomerStatus
	} from '#lib/features/customers/models/customer.model.ts';
	import { customerService } from '#lib/features/customers/services/index.ts';
	import { CustomerDetailState } from '#lib/features/customers/state/customer-detail.state.svelte.ts';
	import { getCustomerErrorMessage } from '#lib/features/customers/utils/customer-error-message.ts';

	interface Props {
		customerId: string;
	}

	let { customerId }: Props = $props();

	const detail = new CustomerDetailState(customerService);
	const listPath = resolve('/');
	const selectId = $props.id();

	let selectedStatus = $derived<CustomerStatus>(detail.customer?.status ?? 'PENDING');
	let saving = $state(false);

	$effect(() => {
		detail.load(customerId);
		return () => detail.dispose();
	});

	const label = (status: CustomerStatus) => STATUS_PRESENTATION[status].label;

	async function saveStatus(event: SubmitEvent) {
		event.preventDefault();
		const customer = detail.customer;
		if (!customer || selectedStatus === customer.status) return;

		const target = selectedStatus;
		const confirmed = await confirmAction({
			title: '¿Cambiar el estado?',
			text: `${customer.name} pasará de ${label(customer.status)} a ${label(target)}.`,
			confirmText: 'Sí, cambiar',
			tone: target === 'BLOCKED' ? 'danger' : 'primary'
		});
		if (!confirmed) {
			selectedStatus = customer.status;
			return;
		}

		saving = true;
		void showLoading('Actualizando estado…');
		try {
			const updated = await customerService.updateStatus(customer.id, target);
			detail.replace(updated);
			void showSuccess('¡Listo!', `${updated.name} ahora está ${label(updated.status)}.`);
		} catch (error) {
			selectedStatus = customer.status;
			void showError('No se pudo cambiar el estado', getCustomerErrorMessage(error));
		} finally {
			saving = false;
		}
	}

	async function copyId(id: string) {
		await navigator.clipboard.writeText(id);
		void showSuccess('ID copiado', id);
	}
</script>

<svelte:head>
	<title>{detail.customer?.name ?? 'Cliente'} · Customer Dashboard</title>
</svelte:head>

<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
	<PageHeader
		title="Detalle del cliente"
		breadcrumbs={[
			{ label: 'Inicio', href: listPath },
			{ label: 'Clientes', href: listPath },
			{ label: detail.customer?.name ?? 'Detalle' }
		]}
	>
		{#snippet actions()}
			<LinkButton href={listPath} class="gap-1.5">
				<svg class="-ml-0.5 size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
						clip-rule="evenodd"
					/>
				</svg>
				Volver a clientes
			</LinkButton>
		{/snippet}
	</PageHeader>

	<div class="mt-6" aria-live="polite">
		{#if detail.status === 'idle' || (detail.status === 'loading' && !detail.customer)}
			<div class="grid gap-6 lg:grid-cols-3" data-testid="customer-detail-skeleton">
				<div class="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"></div>
				<div
					class="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200 lg:col-span-2"
				></div>
			</div>
		{:else if detail.status === 'not-found'}
			<Card>
				<EmptyState
					title="Cliente no encontrado"
					description="El cliente que buscas no existe o fue eliminado."
				>
					{#snippet action()}
						<LinkButton href={listPath}>Volver a clientes</LinkButton>
					{/snippet}
				</EmptyState>
			</Card>
		{:else if detail.status === 'error'}
			<Card>
				<ErrorState
					title="No se pudo cargar el cliente"
					message={getCustomerErrorMessage(detail.error)}
					onretry={() => detail.reload()}
				/>
			</Card>
		{:else if detail.customer}
			{@const customer = detail.customer}
			<div class="grid gap-6 lg:grid-cols-3">
				<Card>
					<div class="flex flex-col items-center text-center">
						<Avatar name={customer.name} size="lg" />
						<h2 class="mt-4 text-lg font-semibold text-slate-900">{customer.name}</h2>
						<a
							href="mailto:{customer.email}"
							class="mt-1 text-sm break-all text-indigo-600 hover:underline">{customer.email}</a
						>
						<div class="mt-4"><StatusBadge status={customer.status} /></div>
					</div>
				</Card>

				<div class="space-y-6 lg:col-span-2">
					<Card title="Información del cliente">
						<dl class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
							<div>
								<dt class="text-sm font-medium text-slate-500">Nombre</dt>
								<dd class="mt-1 text-sm text-slate-900">{customer.name}</dd>
							</div>
							<div>
								<dt class="text-sm font-medium text-slate-500">Email</dt>
								<dd class="mt-1 text-sm break-all text-slate-900">{customer.email}</dd>
							</div>
							<div>
								<dt class="text-sm font-medium text-slate-500">Estado</dt>
								<dd class="mt-1"><StatusBadge status={customer.status} /></dd>
							</div>
							<div>
								<dt class="text-sm font-medium text-slate-500">Fecha de registro</dt>
								<dd class="mt-1 text-sm text-slate-900">
									<time datetime={customer.createdAt.toISOString()}
										>{formatDateTime(customer.createdAt)}</time
									>
								</dd>
							</div>
							<div class="sm:col-span-2">
								<dt class="text-sm font-medium text-slate-500">ID</dt>
								<dd class="mt-1 flex items-center gap-2">
									<span class="font-mono text-xs break-all text-slate-600">{customer.id}</span>
									<button
										type="button"
										onclick={() => copyId(customer.id)}
										class="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
										aria-label="Copiar ID"
									>
										<svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path
												d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z"
											/>
											<path
												d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z"
											/>
										</svg>
									</button>
								</dd>
							</div>
						</dl>
					</Card>

					<Card title="Cambiar estado" description="El cambio se aplica de inmediato.">
						<form id="estado" onsubmit={saveStatus} class="flex flex-col gap-3 sm:flex-row">
							<label for={selectId} class="sr-only">Nuevo estado</label>
							<select
								id={selectId}
								bind:value={selectedStatus}
								disabled={saving}
								class="w-full rounded-lg border-0 py-2 pr-8 pl-3 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:max-w-xs"
							>
								{#each CUSTOMER_STATUSES as status (status)}
									<option value={status}>{label(status)}</option>
								{/each}
							</select>
							<Button type="submit" disabled={saving || selectedStatus === customer.status}>
								{saving ? 'Guardando…' : 'Guardar'}
							</Button>
						</form>
					</Card>
				</div>
			</div>
		{/if}
	</div>
</main>
