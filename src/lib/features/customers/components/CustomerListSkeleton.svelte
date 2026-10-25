<!-- Placeholder with the shape of the list while the first page loads (AC-09). -->
<script lang="ts">
	interface Props {
		rows?: number;
	}

	let { rows = 6 }: Props = $props();
</script>

<div
	class="animate-pulse divide-y divide-slate-100"
	aria-hidden="true"
	data-testid="customer-skeleton"
>
	{#each { length: rows }, index (index)}
		<div class="flex items-center gap-4 px-4 py-4 md:px-6">
			<div class="flex-1 space-y-2 md:flex md:flex-none md:basis-1/4 md:space-y-0">
				<div class="h-3.5 w-3/4 rounded bg-slate-200"></div>
				<div class="h-3 w-1/2 rounded bg-slate-100 md:hidden"></div>
			</div>
			<div class="hidden h-3.5 flex-1 rounded bg-slate-100 md:block"></div>
			<div class="h-5 w-20 rounded-full bg-slate-200"></div>
			<div class="hidden h-3.5 w-24 rounded bg-slate-100 md:block"></div>
		</div>
	{/each}
</div>
