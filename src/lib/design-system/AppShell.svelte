<!--
	Application frame: brand + sectioned sidebar on desktop, collapsible drawer on mobile.
	Navigation items are data, so the shell knows nothing about the app's pages.
-->
<script lang="ts" module>
	export interface NavItem {
		label: string;
		href: string;
		icon: 'dashboard' | 'docs' | 'api';
		active?: boolean;
		external?: boolean;
	}

	export interface NavSection {
		title: string;
		items: NavItem[];
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		brand: string;
		brandSuffix?: string;
		homeHref: string;
		sections: NavSection[];
		children: Snippet;
	}

	let { brand, brandSuffix = '', homeHref, sections, children }: Props = $props();

	let menuOpen = $state(false);

	const ICONS: Record<NavItem['icon'], string> = {
		dashboard:
			'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
		docs: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
		api: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5'
	};
</script>

{#snippet navigation()}
	<a
		href={homeHref}
		class="flex items-center gap-2.5 px-2"
		aria-label="{brand}{brandSuffix} — inicio"
	>
		<span
			class="grid size-8 place-items-center rounded-full bg-linear-to-br from-sky-400 to-indigo-600"
			aria-hidden="true"
		>
			<span class="size-3.5 rounded-full bg-white"></span>
		</span>
		<span class="text-xl tracking-tight text-slate-900">
			<span class="font-semibold">{brand}</span><span class="font-light">{brandSuffix}</span>
		</span>
	</a>

	<nav class="mt-10 space-y-8" aria-label="Navegación principal">
		{#each sections as section (section.title)}
			<div>
				<p class="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
					{section.title}
				</p>
				<ul class="mt-3 space-y-1">
					{#each section.items as item (item.href)}
						<li>
							<a
								href={item.href}
								target={item.external ? '_blank' : undefined}
								rel={item.external ? 'noreferrer' : undefined}
								aria-current={item.active ? 'page' : undefined}
								onclick={() => (menuOpen = false)}
								class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 {item.active
									? 'bg-indigo-600 text-white shadow-sm'
									: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
							>
								<svg
									class="size-5 shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d={ICONS[item.icon]} />
								</svg>
								<span class="flex-1">{item.label}</span>
								{#if item.external}
									<span class="sr-only">(se abre en otra pestaña)</span>
									<svg
										class="size-3.5 opacity-60"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.25-.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 1 1-1.06-1.06l5.22-5.22H12.25a.75.75 0 0 1-.75-.75Z"
											clip-rule="evenodd"
										/>
									</svg>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
{/snippet}

<div class="min-h-dvh bg-white">
	<!-- Desktop sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 lg:block"
	>
		{@render navigation()}
	</aside>

	<!-- Mobile drawer -->
	{#if menuOpen}
		<div class="fixed inset-0 z-40 lg:hidden">
			<button
				type="button"
				class="absolute inset-0 bg-slate-900/40"
				aria-label="Cerrar menú"
				onclick={() => (menuOpen = false)}
			></button>
			<aside class="relative h-full w-72 max-w-[85%] overflow-y-auto bg-white px-4 py-6 shadow-xl">
				{@render navigation()}
			</aside>
		</div>
	{/if}

	<div class="lg:pl-64">
		<header
			class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:hidden"
		>
			<button
				type="button"
				onclick={() => (menuOpen = true)}
				aria-expanded={menuOpen}
				class="-m-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
				aria-label="Abrir menú"
			>
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
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				</svg>
			</button>
			<span class="text-lg tracking-tight text-slate-900">
				<span class="font-semibold">{brand}</span><span class="font-light">{brandSuffix}</span>
			</span>
		</header>

		{@render children()}
	</div>
</div>
