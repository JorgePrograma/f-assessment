<script lang="ts">
	import { Avatar, LinkButton } from '#lib/design-system/index.ts';
	import type { Customer } from '#lib/features/customers/models/customer.model.ts';
	import { formatDate } from '#lib/core/utils/format.ts';
	import { customerDetailPath } from '#lib/features/customers/utils/routes.ts';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		customers: Customer[];
	}

	let { customers }: Props = $props();
</script>

<ul class="divide-y divide-slate-100">
	{#each customers as customer (customer.id)}
		<li class="px-4 py-4">
			<div class="flex items-start gap-3">
				<Avatar name={customer.name} />
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-semibold text-slate-900">{customer.name}</p>
					<p class="truncate text-sm text-slate-500">{customer.email}</p>
				</div>
				<StatusBadge status={customer.status} />
			</div>
			<div class="mt-3 flex items-center justify-between gap-3">
				<p class="text-xs text-slate-500">
					Registrado el
					<time datetime={customer.createdAt.toISOString()}>{formatDate(customer.createdAt)}</time>
				</p>
				<LinkButton variant="ghost" size="sm" href={customerDetailPath(customer.id)}>
					Ver detalle<span class="sr-only">, {customer.name}</span>
				</LinkButton>
			</div>
		</li>
	{/each}
</ul>
