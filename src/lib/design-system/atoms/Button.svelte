<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const VARIANTS: Record<Variant, string> = {
		primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500',
		secondary:
			'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50',
		ghost: 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800'
	};

	const SIZES: Record<Size, string> = {
		sm: 'px-2 py-1 text-sm',
		md: 'px-4 py-2 text-sm'
	};
</script>

<button
	{type}
	class="inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 {VARIANTS[
		variant
	]} {SIZES[size]} {className}"
	{...rest}
>
	{@render children()}
</button>
