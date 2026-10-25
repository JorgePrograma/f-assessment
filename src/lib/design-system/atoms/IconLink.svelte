<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Tone = 'brand' | 'neutral';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		label: string;
		tone?: Tone;
		children: Snippet;
	}

	let { href, label, tone = 'neutral', class: className = '', children, ...rest }: Props = $props();

	const TONES: Record<Tone, string> = {
		brand: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
		neutral: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
	};
</script>

<a
	{href}
	aria-label={label}
	title={label}
	class="inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 {TONES[
		tone
	]} {className}"
	{...rest}
>
	{@render children()}
</a>
