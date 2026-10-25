<script lang="ts">
	import type { CustomerStatus } from '#lib/features/customers/index.ts';
	import { dashboardService } from '#lib/features/dashboard/services/index.ts';
	import { CustomerSummaryState } from '#lib/features/dashboard/state/customer-summary.state.svelte.ts';
	import StatCards from './StatCards.svelte';

	interface Props {
		selected: CustomerStatus | null;
		onselect: (status: CustomerStatus | null) => void;
	}

	let { selected, onselect }: Props = $props();

	const summary = new CustomerSummaryState(dashboardService);

	$effect(() => {
		summary.load();
		return () => summary.dispose();
	});

	export function reload(): Promise<void> {
		return summary.load();
	}
</script>

<StatCards summary={summary.summary} {selected} {onselect} />
