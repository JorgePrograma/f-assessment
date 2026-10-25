<!-- Labelled text input with an inline error message wired through aria-describedby. -->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label: string;
		value: string;
		error?: string | null;
	}

	let { label, value = $bindable(), error = null, id, ...rest }: Props = $props();

	const generatedId = $props.id();
	const inputId = $derived(id ?? generatedId);
	const errorId = $derived(`${inputId}-error`);
</script>

<div>
	<label for={inputId} class="block text-sm font-medium text-slate-900">{label}</label>
	<input
		id={inputId}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? errorId : undefined}
		class="mt-1.5 block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 {error
			? 'ring-rose-400'
			: 'ring-slate-300'}"
		{...rest}
	/>
	{#if error}
		<p id={errorId} class="mt-1.5 text-sm text-rose-600">{error}</p>
	{/if}
</div>
