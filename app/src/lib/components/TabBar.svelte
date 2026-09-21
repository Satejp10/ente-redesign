<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	const tabs = [
		{
			href: '/',
			label: 'Photos',
			paths: [
				'M4.5 4h15a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13A1.5 1.5 0 0 1 4.5 4z',
				'M3.4 16.2 8 11.8l3.4 3 3.3-3.6 5.9 5.6',
				'M9.6 8.4a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0z'
			]
		},
		{
			href: '/albums/',
			label: 'Albums',
			paths: [
				'M7.5 4h9.8A2.7 2.7 0 0 1 20 6.7v9.8',
				'M4.5 7.5h10a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2z'
			]
		},
		{
			href: '/search/',
			label: 'Search',
			paths: ['M10.6 4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2z', 'M15.4 15.4 20.5 20.5']
		}
	];

	const current = $derived.by(() => {
		const path = page.url.pathname.slice(base.length) || '/';
		return path.endsWith('/') ? path : `${path}/`;
	});
</script>

<nav aria-label="Sections">
	{#each tabs as tab (tab.href)}
		{@const active = current === tab.href}
		<a href="{base}{tab.href}" class:active aria-current={active ? 'page' : undefined}>
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{#each tab.paths as d (d)}
					<path {d} />
				{/each}
			</svg>
			<span>{tab.label}</span>
		</a>
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		inset-inline: 0;
		inset-block-end: 0;
		z-index: 20;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		padding-block: 8px;
		padding-block-end: calc(8px + env(safe-area-inset-bottom, 0px));
		background: color-mix(in srgb, var(--bg) 86%, transparent);
		backdrop-filter: blur(16px);
		border-top: 1px solid var(--border);
	}

	a {
		display: grid;
		justify-items: center;
		gap: 3px;
		padding-block: 4px;
		text-decoration: none;
		color: var(--text-muted);
		font-size: 11px;
		font-weight: 500;
		transition: color 120ms ease;
	}

	a.active {
		color: var(--accent);
	}

	svg {
		width: 22px;
		height: 22px;
	}
</style>
