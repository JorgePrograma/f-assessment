<!--
	Headline metrics. Each card is also a filter for the customer list, so the dashboard
	and the table stay connected (AC-22, AC-23).
-->
<script lang="ts">
	import { formatNumber, formatShare } from '#lib/core/utils/format.ts';
	import type { CustomerSummary } from '#lib/features/customers/models/customer-summary.model.ts';
	import {
		CUSTOMER_STATUSES,
		type CustomerStatus
	} from '#lib/features/customers/models/customer.model.ts';
	import { STATUS_PRESENTATION } from '../customer-status.ts';

	interface Props {
		summary: CustomerSummary | null;
		selected: CustomerStatus | null;
		onselect: (status: CustomerStatus | null) => void;
	}

	let { summary, selected, onselect }: Props = $props();

	const cards = $derived.by(() => {
		if (!summary) return [];
		const { total, byStatus } = summary;
		return [
			{ status: null, label: 'Total de clientes', value: total, caption: 'Todos los estados' },
			...CUSTOMER_STATUSES.map((status) => ({
				status,
				label: STATUS_PRESENTATION[status].filterLabel,
				value: byStatus[status],
				caption: `${formatShare(byStatus[status], total)} del total`
			}))
		];
	});
</script>

<div
	class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
	aria-label="Resumen de clientes"
	role="group"
>
	{#if !summary}
		{#each { length: 4 }, index (index)}
			<div
				class="h-[118px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
				data-testid="stat-card-skeleton"
			></div>
		{/each}
	{:else}
		{#each cards as card (card.label)}
			{@const active = selected === card.status}
			<button
				type="button"
				aria-pressed={active}
				onclick={() => onselect(active ? null : card.status)}
				class="group rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:p-5 {active
					? 'ring-2 ring-indigo-500'
					: 'ring-slate-200 hover:ring-slate-300'}"
			>
				<span class="flex items-center gap-2 text-sm font-medium text-slate-600">
					{#if card.status}
						<span
							class="size-2.5 rounded-full {STATUS_PRESENTATION[card.status].fillClass}"
							aria-hidden="true"
						></span>
					{:else}
						<svg
							class="size-4 text-slate-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"
							/>
						</svg>
					{/if}
					{card.label}
				</span>
				<span class="mt-3 block text-3xl font-semibold tracking-tight text-slate-900 tabular-nums"
					>{formatNumber(card.value)}</span
				>
				<span class="mt-1 block text-xs text-slate-500">{card.caption}</span>
			</button>
		{/each}
	{/if}
</div>
