<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { buildLibrary, groupByDay } from '$lib/data/library';
	import { density } from '$lib/timeline/density.svelte';
	import {
		buildLayout,
		monthSegments,
		photoIndexAt,
		topOfPhoto,
		visible
	} from '$lib/timeline/layout';
	import { pinch } from '$lib/timeline/pinch';
	import Scrubber from './Scrubber.svelte';
	import Tile from './Tile.svelte';

	/** Room for the floating top bar and the tab bar. */
	const INSET_TOP = 60;
	const INSET_BOTTOM = 76;
	/**
	 * The scrubber gets its own column rather than overlaying the last one. Wide
	 * enough that the year labels sit on the background instead of on a photo,
	 * where they were unreadable against a light image.
	 */
	const RAIL_WIDTH = 38;

	const photos = buildLibrary();
	const groups = groupByDay(photos);

	let scroller = $state<HTMLDivElement>();
	let width = $state(0);
	let height = $state(0);
	let scrollTop = $state(0);
	let debug = $state(false);
	let tilesInDom = $state(0);

	const layout = $derived(
		buildLayout(
			groups,
			Math.max(0, width - RAIL_WIDTH),
			density.columns,
			INSET_TOP,
			INSET_BOTTOM
		)
	);
	const view = $derived(visible(layout, scrollTop, height));
	const segments = $derived(monthSegments(layout));

	onMount(() => {
		density.restore();
		debug = new URLSearchParams(location.search).has('debug');
	});

	$effect(() => {
		// Read `view` so this re-runs whenever the rendered set changes.
		view.tiles.length;
		if (!debug) return;
		tick().then(() => {
			tilesInDom = document.querySelectorAll('[data-tile]').length;
		});
	});

	function onScroll() {
		if (scroller) scrollTop = scroller.scrollTop;
	}

	/**
	 * Hold the photo under the fingers still while the columns change. Without
	 * this the grid re-flows around the top of the viewport and the thing you
	 * were looking at jumps off screen, which reads as a bug even though the
	 * density change worked.
	 */
	async function onPinchStep(direction: 1 | -1, centerY: number) {
		if (!scroller) return;
		const anchor = photoIndexAt(layout, scrollTop + centerY);
		if (!density.step(direction)) return;

		await tick();

		const target = topOfPhoto(layout, anchor) - centerY;
		scroller.scrollTop = Math.max(0, Math.min(layout.total - height, target));
		scrollTop = scroller.scrollTop;
	}

	function onScrub(top: number) {
		if (!scroller) return;
		scroller.scrollTop = top;
		scrollTop = scroller.scrollTop;
	}
</script>

<div class="viewport">
	<div
		class="scroller"
		bind:this={scroller}
		bind:clientWidth={width}
		bind:clientHeight={height}
		onscroll={onScroll}
		use:pinch={{ onStep: onPinchStep }}
	>
		<div class="canvas" style:height="{layout.total}px" style:width="{layout.width}px">
			{#each view.headers as header (header.key)}
				<h2 class="day" style:top="{header.top}px">{header.label}</h2>
			{/each}

			{#each view.tiles as placed (photos[placed.index].id)}
				<Tile
					photo={photos[placed.index]}
					top={placed.top}
					left={placed.left}
					size={placed.size}
				/>
			{/each}
		</div>
	</div>

	<Scrubber
		{segments}
		total={layout.total}
		viewport={height}
		{scrollTop}
		insetTop={INSET_TOP}
		insetBottom={INSET_BOTTOM}
		{onScrub}
	/>

	{#if debug}
		<div class="debug">
			{tilesInDom} tiles in DOM · {photos.length} photos · {layout.columns} cols
		</div>
	{/if}
</div>

<style>
	.viewport {
		position: absolute;
		inset: 0;
	}

	.scroller {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		/* Let one-finger drags scroll, and keep the browser's own pinch-zoom out
		   of the way of the density gesture. */
		touch-action: pan-y;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior-y: contain;
	}

	/* The browser's scrollbar would sit under the custom scrubber. */
	.scroller::-webkit-scrollbar {
		width: 0;
		height: 0;
	}

	.canvas {
		position: relative;
	}

	.day {
		position: absolute;
		inset-inline: 0;
		margin: 0;
		padding: 12px 14px 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}

	.debug {
		position: absolute;
		inset-block-end: 88px;
		inset-inline-start: 12px;
		padding: 6px 10px;
		border-radius: 999px;
		background: var(--text);
		color: var(--bg);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
</style>
