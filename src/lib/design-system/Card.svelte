<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		flush?: boolean;
		class?: string;
		actions?: Snippet;
		children: Snippet;
	}

	let {
		title,
		description,
		flush = false,
		class: className = '',
		actions,
		children
	}: Props = $props();

	const headingId = $props.id();

	const bodyClass = $derived.by(() => {
		if (flush) return title ? 'mt-4' : '';
		return title ? 'px-5 pt-4 pb-5 sm:px-6 sm:pb-6' : 'p-5 sm:p-6';
	});
</script>

<section
	aria-labelledby={title ? headingId : undefined}
	class="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 {className}"
>
	{#if title}
		<header class="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
			<div>
				<h2 id={headingId} class="text-base font-semibold text-slate-900">{title}</h2>
				{#if description}
					<p class="mt-0.5 text-sm text-slate-500">{description}</p>
				{/if}
			</div>
			{#if actions}
				<div class="shrink-0">{@render actions()}</div>
			{/if}
		</header>
	{/if}
	<div class={bodyClass}>
		{@render children()}
	</div>
</section>
