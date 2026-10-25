<!-- Initials avatar; the color is derived from the name, so a person always gets the same one. -->
<script lang="ts">
	interface Props {
		name: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { name, size = 'md' }: Props = $props();

	const PALETTE = [
		'bg-sky-100 text-sky-700',
		'bg-indigo-100 text-indigo-700',
		'bg-violet-100 text-violet-700',
		'bg-emerald-100 text-emerald-700',
		'bg-amber-100 text-amber-800',
		'bg-rose-100 text-rose-700',
		'bg-teal-100 text-teal-700'
	];

	const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' };

	const initials = $derived(
		name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('')
	);

	const colorClass = $derived.by(() => {
		let hash = 0;
		for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
		return PALETTE[hash % PALETTE.length];
	});
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold {SIZES[
		size
	]} {colorClass}"
	aria-hidden="true">{initials}</span
>
