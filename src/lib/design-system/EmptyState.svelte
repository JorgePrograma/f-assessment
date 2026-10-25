<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		action?: Snippet;
	}

	let { title, description, action }: Props = $props();
</script>

<div class="flex flex-col items-center px-6 py-16 text-center">
	<div class="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
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
				d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
			/>
		</svg>
	</div>
	<h3 class="mt-4 text-base font-semibold text-slate-900">{title}</h3>
	<p class="mt-1 max-w-sm text-sm text-slate-600">{description}</p>
	{#if action}
		<div class="mt-6">{@render action()}</div>
	{/if}
</div>
