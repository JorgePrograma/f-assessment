<!-- Transient confirmation message; announced politely to screen readers and dismissed after `duration` ms. -->
<script lang="ts">
	interface Props {
		message: string | null;
		onclose: () => void;
		duration?: number;
	}

	let { message, onclose, duration = 4000 }: Props = $props();

	$effect(() => {
		if (!message) return;
		const timer = setTimeout(onclose, duration);
		return () => clearTimeout(timer);
	});
</script>

<div
	role="status"
	aria-live="polite"
	class="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
>
	{#if message}
		<div
			class="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900 py-3 pr-3 pl-4 text-sm text-white shadow-lg"
		>
			<svg
				class="size-5 shrink-0 text-emerald-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
					clip-rule="evenodd"
				/>
			</svg>
			<span>{message}</span>
			<button
				type="button"
				onclick={onclose}
				class="rounded p-1 text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
				aria-label="Cerrar notificación"
			>
				<svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>
