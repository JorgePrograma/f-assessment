<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Crumb {
		label: string;
		href?: string;
	}

	interface Props {
		title: string;
		breadcrumbs?: Crumb[];
		actions?: Snippet;
	}

	let { title, breadcrumbs = [], actions }: Props = $props();
</script>

<div
	class="relative overflow-hidden rounded-2xl bg-sky-50 px-6 py-6 ring-1 ring-sky-100 sm:flex sm:items-center sm:justify-between sm:px-8"
>
	<div class="relative z-10">
		<h1 class="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
		{#if breadcrumbs.length > 0}
			<nav aria-label="Ruta de navegación" class="mt-1.5">
				<ol class="flex flex-wrap items-center gap-2 text-sm text-slate-500">
					{#each breadcrumbs as crumb, index (crumb.label)}
						{#if index > 0}
							<li aria-hidden="true" class="size-1 rounded-full bg-slate-400"></li>
						{/if}
						<li>
							{#if crumb.href && index < breadcrumbs.length - 1}
								<a href={crumb.href} class="hover:text-slate-700">{crumb.label}</a>
							{:else}
								<span aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
									>{crumb.label}</span
								>
							{/if}
						</li>
					{/each}
				</ol>
			</nav>
		{/if}
	</div>

	{#if actions}
		<div class="relative z-10 mt-4 sm:mt-0">{@render actions()}</div>
	{/if}

	<svg
		class="pointer-events-none absolute -top-6 right-40 hidden h-36 w-36 text-sky-100 sm:block"
		viewBox="0 0 100 100"
		aria-hidden="true"
	>
		<circle cx="50" cy="50" r="50" fill="currentColor" />
	</svg>
	<svg
		class="pointer-events-none absolute -right-8 -bottom-10 hidden h-32 w-32 text-indigo-100 sm:block"
		viewBox="0 0 100 100"
		aria-hidden="true"
	>
		<circle cx="50" cy="50" r="50" fill="currentColor" />
	</svg>
</div>
