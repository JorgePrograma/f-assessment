<script lang="ts">
	import './layout.css';
	import { API_URL } from '$app/env/public';
	import { resolve } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';
	import { AppShell, type NavSection } from '#lib/design-system/index.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const sections: NavSection[] = [
		{
			title: 'Principal',
			items: [{ label: 'Clientes', href: resolve('/'), icon: 'dashboard', active: true }]
		},
		{
			title: 'Recursos',
			items: [
				{ label: 'API · Swagger', href: `${API_URL}/docs`, icon: 'api', external: true },
				{ label: 'API · ReDoc', href: `${API_URL}/redoc`, icon: 'docs', external: true }
			]
		}
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppShell brand="Customer" brandSuffix="admin" homeHref={resolve('/')} {sections}>
	{@render children()}
</AppShell>
