<!-- Single-choice button group; the active option is exposed with aria-pressed. -->
<script lang="ts" generics="T">
	interface Option {
		value: T;
		label: string;
	}

	interface Props {
		options: Option[];
		value: T;
		onchange: (value: T) => void;
		label: string;
	}

	let { options, value, onchange, label }: Props = $props();
</script>

<div
	role="group"
	aria-label={label}
	class="grid w-full grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 min-[420px]:grid-cols-4 md:inline-flex md:w-auto"
>
	{#each options as option (option.label)}
		{@const selected = value === option.value}
		<button
			type="button"
			aria-pressed={selected}
			onclick={() => onchange(option.value)}
			class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 {selected
				? 'bg-white text-slate-900 shadow-sm'
				: 'text-slate-600 hover:text-slate-900'}"
		>
			{option.label}
		</button>
	{/each}
</div>
