<script lang="ts" module>
	export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: BadgeTone;
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();

	const TONES: Record<BadgeTone, { badge: string; dot: string }> = {
		success: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
		warning: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500' },
		danger: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
		neutral: { badge: 'bg-slate-50 text-slate-700 ring-slate-500/20', dot: 'bg-slate-400' }
	};
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset {TONES[
		tone
	].badge}"
>
	<span class="size-1.5 rounded-full {TONES[tone].dot}" aria-hidden="true"></span>
	{@render children()}
</span>
