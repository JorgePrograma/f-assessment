<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		title: string;
		message: string;
		onretry: () => void;
		requestId?: string;
	}

	let { title, message, onretry, requestId }: Props = $props();
</script>

<div role="alert" class="flex flex-col items-center px-6 py-16 text-center">
	<div class="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
		<svg
			class="size-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
			/>
		</svg>
	</div>
	<h3 class="mt-4 text-base font-semibold text-slate-900">{title}</h3>
	<p class="mt-1 max-w-sm text-sm text-slate-600">{message}</p>
	{#if requestId}
		<p class="mt-2 font-mono text-xs text-slate-400">Ref: {requestId}</p>
	{/if}
	<Button onclick={onretry} class="mt-6">Reintentar</Button>
</div>
