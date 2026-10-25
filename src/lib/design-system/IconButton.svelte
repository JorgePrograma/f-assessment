<!-- Round icon-only button. `label` is mandatory: it is the accessible name. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Tone = 'brand' | 'danger' | 'neutral';

	interface Props extends HTMLButtonAttributes {
		label: string;
		tone?: Tone;
		children: Snippet;
	}

	let { label, tone = 'neutral', class: className = '', children, ...rest }: Props = $props();

	const TONES: Record<Tone, string> = {
		brand: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
		danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
		neutral: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
	};
</script>

<button
	type="button"
	aria-label={label}
	title={label}
	class="inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 {TONES[
		tone
	]} {className}"
	{...rest}
>
	{@render children()}
</button>
