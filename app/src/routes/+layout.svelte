<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import TabBar from '$lib/components/TabBar.svelte';

	let { children } = $props();

	const titles: Record<string, string> = {
		'/': 'Photos',
		'/albums/': 'Albums',
		'/search/': 'Search'
	};

	const title = $derived.by(() => {
		const path = page.url.pathname.slice(base.length) || '/';
		return titles[path.endsWith('/') ? path : `${path}/`] ?? 'Photos';
	});
</script>

<svelte:head>
	<title>{title} — Ente redesign concept</title>
</svelte:head>

<div class="app">
	<header>
		<h1>{title}</h1>
		<span class="tag">Unofficial concept</span>
	</header>

	{@render children()}

	<TabBar />
</div>

<style>
	.app {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	header {
		position: fixed;
		inset-inline: 0;
		inset-block-start: 0;
		z-index: 20;
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 14px 16px 10px;
		padding-block-start: calc(14px + env(safe-area-inset-top, 0px));
		background: color-mix(in srgb, var(--bg) 82%, transparent);
		backdrop-filter: blur(16px);
	}

	h1 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
	}

	.tag {
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
</style>
