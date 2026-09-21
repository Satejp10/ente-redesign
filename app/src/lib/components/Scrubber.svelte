<script lang="ts">
	import { formatMonthYear } from '$lib/data/library';
	import type { ScrubberSegment } from '$lib/timeline/layout';

	type Props = {
		segments: ScrubberSegment[];
		/** Full height of the timeline in pixels. */
		total: number;
		viewport: number;
		scrollTop: number;
		/** Keep the track clear of the top bar and the tab bar, which sit above it. */
		insetTop: number;
		insetBottom: number;
		onScrub: (top: number) => void;
	};

	let { segments, total, viewport, scrollTop, insetTop, insetBottom, onScrub }: Props = $props();

	const MIN_LABEL_GAP = 22;

	let railHeight = $state(0);
	let dragging = $state(false);
	let pointerY = $state(0);

	const scrollable = $derived(Math.max(1, total - viewport));
	const progress = $derived(Math.min(1, Math.max(0, scrollTop / scrollable)));
	const handleY = $derived(progress * railHeight);

	/** Fraction of the *timeline* currently under the handle, not of the scroll range. */
	const timelineFraction = $derived(total > 0 ? (progress * scrollable) / total : 0);

	const currentLabel = $derived.by(() => {
		const f = dragging ? (pointerY / Math.max(1, railHeight)) * (scrollable / total) : timelineFraction;
		let match = segments[0];
		for (const segment of segments) {
			if (segment.start > f) break;
			match = segment;
		}
		return match ? formatMonthYear(match.time) : '';
	});

	/** Year ticks, thinned out so they never collide on a short phone screen. */
	const ticks = $derived.by(() => {
		const out: { year: number; y: number }[] = [];
		let lastYear: number | undefined;
		let lastY = -Infinity;

		for (const segment of segments) {
			if (segment.year === lastYear) continue;
			const y = segment.start * railHeight;
			if (y - lastY < MIN_LABEL_GAP) continue;
			out.push({ year: segment.year, y });
			lastYear = segment.year;
			lastY = y;
		}

		return out;
	});

	function seek(clientY: number, rail: HTMLElement) {
		const rect = rail.getBoundingClientRect();
		const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
		pointerY = y;
		onScrub((y / Math.max(1, rect.height)) * scrollable);
	}

	function onPointerDown(event: PointerEvent) {
		const rail = event.currentTarget as HTMLElement;
		rail.setPointerCapture(event.pointerId);
		dragging = true;
		seek(event.clientY, rail);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging) return;
		event.preventDefault();
		seek(event.clientY, event.currentTarget as HTMLElement);
	}

	function onPointerUp(event: PointerEvent) {
		dragging = false;
		(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
	}

	function onKeyDown(event: KeyboardEvent) {
		const page = viewport * 0.9;
		const moves: Record<string, number> = {
			ArrowDown: page / 3,
			ArrowUp: -page / 3,
			PageDown: page,
			PageUp: -page,
			Home: -scrollable,
			End: scrollable
		};
		const delta = moves[event.key];
		if (delta === undefined) return;
		event.preventDefault();
		onScrub(Math.min(scrollable, Math.max(0, scrollTop + delta)));
	}
</script>

<div
	class="rail"
	class:dragging
	role="slider"
	tabindex="0"
	aria-label="Scrub through the timeline"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(progress * 100)}
	aria-valuetext={currentLabel}
	style:top="{insetTop}px"
	style:bottom="{insetBottom}px"
	bind:clientHeight={railHeight}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerUp}
	onkeydown={onKeyDown}
>
	<div class="track"></div>

	{#each ticks as tick (tick.year)}
		<span class="tick" style:top="{tick.y}px">{tick.year}</span>
	{/each}

	<div class="handle" style:top="{handleY}px"></div>

	{#if dragging}
		<div class="bubble" style:top="{pointerY}px">{currentLabel}</div>
	{/if}
</div>

<style>
	.rail {
		position: absolute;
		inset-inline-end: 0;
		/* Must hold the year labels outright: a label that spills onto a photo is
		   illegible over a light one. */
		width: 38px;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
		outline: none;
	}

	.rail:focus-visible .track {
		background: var(--accent);
	}

	.track {
		position: absolute;
		inset-block: 0;
		inset-inline-end: 6px;
		width: 2px;
		border-radius: 1px;
		background: var(--border);
	}

	.tick {
		position: absolute;
		inset-inline-end: 13px;
		transform: translateY(-50%);
		font-size: 9px;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		opacity: 0.55;
		pointer-events: none;
	}

	.handle {
		position: absolute;
		inset-inline-end: 3px;
		width: 8px;
		height: 34px;
		margin-top: -17px;
		border-radius: 4px;
		background: var(--text-muted);
		opacity: 0.5;
		transition:
			opacity 140ms ease,
			background-color 140ms ease;
		pointer-events: none;
	}

	.dragging .handle {
		opacity: 1;
		background: var(--accent);
	}

	.bubble {
		position: absolute;
		inset-inline-end: 26px;
		transform: translateY(-50%);
		padding: 7px 12px;
		border-radius: 999px;
		background: var(--text);
		color: var(--bg);
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 6px 20px rgb(0 0 0 / 0.22);
	}
</style>
