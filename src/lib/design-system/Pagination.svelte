<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
		onpagechange: (page: number) => void;
		/** When provided, a "rows per page" selector is shown. */
		pageSizeOptions?: number[];
		onpagesizechange?: (size: number) => void;
	}

	let {
		page,
		pageSize,
		totalItems,
		totalPages,
		onpagechange,
		pageSizeOptions = [],
		onpagesizechange
	}: Props = $props();

	const sizeSelectId = $props.id();
	const firstItem = $derived(totalItems === 0 ? 0 : (page - 1) * pageSize + 1);
	const lastItem = $derived(Math.min(page * pageSize, totalItems));
	const hasPrevious = $derived(page > 1);
	const hasNext = $derived(page < totalPages);
</script>

<nav
	aria-label="Paginación"
	class="grid items-center gap-4 border-t border-slate-200 px-4 py-4 sm:px-6 md:grid-cols-3"
>
	<div class="flex items-center justify-center gap-2 md:justify-start">
		{#if totalPages > 1}
			<Button disabled={!hasPrevious} onclick={() => onpagechange(page - 1)}>Anterior</Button>
			<Button disabled={!hasNext} onclick={() => onpagechange(page + 1)}>Siguiente</Button>
		{/if}
	</div>

	<div class="text-center">
		{#if totalPages > 1}
			<p class="text-sm font-medium text-slate-900" aria-current="page">
				Página {page} de {totalPages}
			</p>
		{/if}
		<p class="text-xs text-slate-500">
			Mostrando <span class="font-medium text-slate-700">{firstItem}–{lastItem}</span> de
			<span class="font-medium text-slate-700">{totalItems}</span>
		</p>
	</div>

	{#if pageSizeOptions.length > 0 && onpagesizechange}
		<div class="flex items-center justify-center gap-3 md:justify-end">
			<label for={sizeSelectId} class="text-sm text-slate-700">Filas por página</label>
			<select
				id={sizeSelectId}
				value={pageSize}
				onchange={(event) => onpagesizechange(Number(event.currentTarget.value))}
				class="rounded-lg border-0 py-1.5 pr-8 pl-3 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-indigo-600"
			>
				{#each pageSizeOptions as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
	{/if}
</nav>
