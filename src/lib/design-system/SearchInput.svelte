<!--
	Search box that reports its value only after the user stops typing for `delay` ms (AC-05).
	It also follows external changes of `value`, e.g. when filters are cleared.
-->
<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		value: string;
		onsearch: (value: string) => void;
		label: string;
		placeholder?: string;
		delay?: number;
	}

	let { value, onsearch, label, placeholder = '', delay = 300 }: Props = $props();

	const inputId = $props.id();
	let draft = $state(untrack(() => value));
	let lastSubmitted = untrack(() => value);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (value !== lastSubmitted) {
			clearTimeout(timer);
			lastSubmitted = value;
			draft = value;
		}
	});

	$effect(() => () => clearTimeout(timer));

	function submit(next: string) {
		clearTimeout(timer);
		lastSubmitted = next.trim();
		onsearch(lastSubmitted);
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		draft = event.currentTarget.value;
		clearTimeout(timer);
		timer = setTimeout(() => submit(draft), delay);
	}

	function clear() {
		draft = '';
		submit('');
	}
</script>

<div class="relative w-full">
	<label for={inputId} class="sr-only">{label}</label>
	<svg
		class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
		viewBox="0 0 20 20"
		fill="currentColor"
		aria-hidden="true"
	>
		<path
			fill-rule="evenodd"
			d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
			clip-rule="evenodd"
		/>
	</svg>
	<input
		id={inputId}
		type="search"
		value={draft}
		oninput={handleInput}
		onkeydown={(event) => event.key === 'Enter' && submit(draft)}
		{placeholder}
		maxlength={100}
		autocomplete="off"
		class="w-full rounded-lg border-0 bg-white py-2 pr-9 pl-9 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 [&::-webkit-search-cancel-button]:hidden"
	/>
	{#if draft}
		<button
			type="button"
			onclick={clear}
			class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
			aria-label="Limpiar búsqueda"
		>
			<svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path
					d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
				/>
			</svg>
		</button>
	{/if}
</div>
