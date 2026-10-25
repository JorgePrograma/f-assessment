<script lang="ts">
	import { Avatar, IconButton } from '#lib/design-system/index.ts';
	import type { Customer } from '#lib/features/customers/models/customer.model.ts';
	import { formatDate } from '#lib/core/utils/format.ts';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		customers: Customer[];
		onselect: (customer: Customer) => void;
	}

	let { customers, onselect }: Props = $props();
</script>

<div class="overflow-hidden rounded-xl ring-1 ring-slate-200">
	<table class="min-w-full divide-y divide-slate-200">
		<thead class="bg-white">
			<tr>
				<th
					scope="col"
					class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-slate-900 sm:pl-5"
				>
					Cliente
				</th>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
					>Estado</th
				>
				<th
					scope="col"
					class="px-3 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-slate-900"
				>
					Fecha de registro
				</th>
				<th
					scope="col"
					class="py-3.5 pr-4 pl-3 text-right text-sm font-semibold text-slate-900 sm:pr-5"
				>
					Acciones
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-200 bg-white">
			{#each customers as customer (customer.id)}
				<tr class="transition-colors hover:bg-slate-50">
					<td class="py-4 pr-3 pl-4 sm:pl-5">
						<div class="flex items-center gap-3">
							<Avatar name={customer.name} />
							<div class="min-w-0">
								<p class="truncate text-sm font-medium text-slate-900">{customer.name}</p>
								<p class="max-w-72 truncate text-sm text-slate-500" title={customer.email}>
									{customer.email}
								</p>
							</div>
						</div>
					</td>
					<td class="px-3 py-4"><StatusBadge status={customer.status} /></td>
					<td class="px-3 py-4 text-sm whitespace-nowrap text-slate-600">
						<time datetime={customer.createdAt.toISOString()}>{formatDate(customer.createdAt)}</time
						>
					</td>
					<td class="py-4 pr-4 pl-3 sm:pr-5">
						<div class="flex justify-end gap-2">
							<IconButton
								tone="brand"
								label="Ver detalle, {customer.name}"
								onclick={() => onselect(customer)}
							>
								<svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
									<path
										fill-rule="evenodd"
										d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
										clip-rule="evenodd"
									/>
								</svg>
							</IconButton>
							<IconButton
								tone="neutral"
								label="Cambiar estado, {customer.name}"
								onclick={() => onselect(customer)}
							>
								<svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path
										d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
									/>
									<path
										d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"
									/>
								</svg>
							</IconButton>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
