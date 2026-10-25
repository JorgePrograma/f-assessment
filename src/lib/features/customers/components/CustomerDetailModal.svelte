<!-- Customer detail with status change (AC-15, AC-16, AC-17). -->
<script lang="ts">
	import { Button, Modal } from '#lib/design-system/index.ts';
	import {
		CUSTOMER_STATUSES,
		type Customer,
		type CustomerStatus
	} from '#lib/features/customers/models/customer.model.ts';
	import { getCustomerErrorMessage } from '#lib/features/customers/utils/customer-error-message.ts';
	import { formatDateTime } from '#lib/core/utils/format.ts';
	import { STATUS_PRESENTATION } from './customer-status.ts';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		customer: Customer | null;
		onclose: () => void;
		onstatuschange: (customer: Customer, status: CustomerStatus) => Promise<void>;
	}

	let { customer, onclose, onstatuschange }: Props = $props();

	const selectId = $props.id();
	// Follows the customer's status, but the user can override it through the select.
	let selectedStatus = $derived<CustomerStatus>(customer?.status ?? 'PENDING');
	let saving = $state(false);
	let errorMessage = $state<string | null>(null);
	let savedMessage = $state<string | null>(null);

	$effect(() => {
		void customer?.id;
		errorMessage = null;
		savedMessage = null;
	});

	async function saveStatus(event: SubmitEvent) {
		event.preventDefault();
		if (!customer || selectedStatus === customer.status) return;

		saving = true;
		errorMessage = null;
		savedMessage = null;
		try {
			await onstatuschange(customer, selectedStatus);
			savedMessage = 'Estado actualizado';
		} catch (error) {
			errorMessage = getCustomerErrorMessage(error);
		} finally {
			saving = false;
		}
	}
</script>

<Modal open={customer !== null} title="Detalle del cliente" {onclose}>
	{#if customer}
		<dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
			<dt class="text-sm font-medium text-slate-500">Nombre</dt>
			<dd class="text-sm text-slate-900 sm:col-span-2">{customer.name}</dd>

			<dt class="text-sm font-medium text-slate-500">Email</dt>
			<dd class="text-sm break-all sm:col-span-2">
				<a href="mailto:{customer.email}" class="text-indigo-600 hover:underline"
					>{customer.email}</a
				>
			</dd>

			<dt class="text-sm font-medium text-slate-500">Estado</dt>
			<dd class="sm:col-span-2"><StatusBadge status={customer.status} /></dd>

			<dt class="text-sm font-medium text-slate-500">Fecha de registro</dt>
			<dd class="text-sm text-slate-900 sm:col-span-2">
				<time datetime={customer.createdAt.toISOString()}>{formatDateTime(customer.createdAt)}</time
				>
			</dd>

			<dt class="text-sm font-medium text-slate-500">ID</dt>
			<dd class="font-mono text-xs break-all text-slate-600 sm:col-span-2">{customer.id}</dd>
		</dl>

		<form onsubmit={saveStatus} class="mt-6 border-t border-slate-200 pt-5">
			<label for={selectId} class="block text-sm font-medium text-slate-900">Cambiar estado</label>
			<div class="mt-2 flex flex-col gap-3 sm:flex-row">
				<select
					id={selectId}
					bind:value={selectedStatus}
					disabled={saving}
					class="w-full rounded-lg border-0 py-2 pr-8 pl-3 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:flex-1"
				>
					{#each CUSTOMER_STATUSES as status (status)}
						<option value={status}>{STATUS_PRESENTATION[status].label}</option>
					{/each}
				</select>
				<Button type="submit" disabled={saving || selectedStatus === customer.status}>
					{saving ? 'Guardando…' : 'Guardar'}
				</Button>
			</div>
			<div aria-live="polite" class="mt-2 min-h-5 text-sm">
				{#if errorMessage}
					<p class="text-rose-600" role="alert">{errorMessage}</p>
				{:else if savedMessage}
					<p class="text-emerald-700">{savedMessage}</p>
				{/if}
			</div>
		</form>
	{/if}
</Modal>
