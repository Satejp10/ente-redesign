/**
 * Timeline geometry.
 *
 * Every day group's height is known before anything renders, so the scroll
 * container can be given its true total height up front and the browser's own
 * scrollbar stays honest. Only the rows inside the viewport are ever turned
 * into DOM nodes — the same approach Immich web takes in
 * `web/src/lib/components/timeline/AssetLayout.svelte`: absolutely positioned
 * tiles inside a fixed-height relative box.
 */

import type { DayGroup } from '$lib/data/library';

export const HEADER_HEIGHT = 40;
/** Breathing room under each day block. */
export const GROUP_GAP = 14;

export type PlacedGroup = {
	group: DayGroup;
	/** Offset of the header from the top of the timeline. */
	top: number;
	/** Offset of this group's first tile row. */
	gridTop: number;
	rows: number;
	height: number;
};

export type Layout = {
	groups: PlacedGroup[];
	total: number;
	columns: number;
	tile: number;
	gap: number;
	width: number;
};

export type PlacedTile = {
	index: number;
	top: number;
	left: number;
	size: number;
};

export type PlacedHeader = {
	key: string;
	label: string;
	top: number;
};

/**
 * `insetTop` and `insetBottom` reserve room for the floating top bar and tab
 * bar. Folding them into the layout rather than into the scroll container's
 * padding keeps one coordinate system: tile positions, scroll offsets and
 * scrubber fractions all mean the same thing.
 */
export function buildLayout(
	groups: DayGroup[],
	width: number,
	columns: number,
	insetTop = 0,
	insetBottom = 0
): Layout {
	const gap = columns >= 5 ? 2 : 3;
	const tile = (width - gap * (columns - 1)) / columns;

	const placed: PlacedGroup[] = [];
	let top = insetTop;

	for (const group of groups) {
		const rows = Math.ceil(group.count / columns);
		const gridTop = top + HEADER_HEIGHT;
		const height = HEADER_HEIGHT + rows * tile + (rows - 1) * gap + GROUP_GAP;
		placed.push({ group, top, gridTop, rows, height });
		top += height;
	}

	return { groups: placed, total: top + insetBottom, columns, tile, gap, width };
}

/** Index of the last group whose top is at or before `y`. */
export function groupIndexAt(layout: Layout, y: number): number {
	const groups = layout.groups;
	let lo = 0;
	let hi = groups.length - 1;

	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (groups[mid].top <= y) lo = mid;
		else hi = mid - 1;
	}

	return lo;
}

/**
 * The tiles and headers intersecting [scrollTop, scrollTop + viewport), plus
 * `overscan` pixels either side so a fast flick does not outrun the renderer.
 */
export function visible(
	layout: Layout,
	scrollTop: number,
	viewport: number,
	overscan = 400
): { tiles: PlacedTile[]; headers: PlacedHeader[] } {
	const tiles: PlacedTile[] = [];
	const headers: PlacedHeader[] = [];

	if (layout.groups.length === 0 || layout.tile <= 0) return { tiles, headers };

	const top = scrollTop - overscan;
	const bottom = scrollTop + viewport + overscan;
	const { columns, tile, gap } = layout;
	const step = tile + gap;

	for (let g = groupIndexAt(layout, top); g < layout.groups.length; g++) {
		const placed = layout.groups[g];
		if (placed.top >= bottom) break;

		if (placed.top + HEADER_HEIGHT > top && placed.top < bottom) {
			headers.push({ key: placed.group.key, label: placed.group.label, top: placed.top });
		}

		const firstRow = Math.max(0, Math.floor((top - placed.gridTop) / step));
		const lastRow = Math.min(placed.rows - 1, Math.floor((bottom - placed.gridTop) / step));

		for (let r = firstRow; r <= lastRow; r++) {
			const rowTop = placed.gridTop + r * step;
			const offset = r * columns;
			const inRow = Math.min(columns, placed.group.count - offset);

			for (let c = 0; c < inRow; c++) {
				tiles.push({
					index: placed.group.start + offset + c,
					top: rowTop,
					left: c * step,
					size: tile
				});
			}
		}
	}

	return { tiles, headers };
}

/** The photo nearest a point on screen — used to hold position through a pinch. */
export function photoIndexAt(layout: Layout, y: number): number {
	const placed = layout.groups[groupIndexAt(layout, y)];
	if (!placed) return 0;
	const row = Math.max(
		0,
		Math.min(placed.rows - 1, Math.floor((y - placed.gridTop) / (layout.tile + layout.gap)))
	);
	return placed.group.start + row * layout.columns;
}

/** Where a given photo sits, so it can be put back under the same finger. */
export function topOfPhoto(layout: Layout, index: number): number {
	let lo = 0;
	let hi = layout.groups.length - 1;

	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (layout.groups[mid].group.start <= index) lo = mid;
		else hi = mid - 1;
	}

	const placed = layout.groups[lo];
	const row = Math.floor((index - placed.group.start) / layout.columns);
	return placed.gridTop + row * (layout.tile + layout.gap);
}

export type ScrubberSegment = {
	label: string;
	year: number;
	/** Fraction of the whole timeline, 0-1. */
	start: number;
	size: number;
	time: number;
};

/** One segment per calendar month, sized by how much timeline that month occupies. */
export function monthSegments(layout: Layout): ScrubberSegment[] {
	const segments: ScrubberSegment[] = [];
	if (layout.total <= 0) return segments;

	let currentKey = '';
	let current: ScrubberSegment | undefined;

	for (const placed of layout.groups) {
		const d = new Date(placed.group.time);
		const key = `${d.getFullYear()}-${d.getMonth()}`;

		if (key !== currentKey) {
			currentKey = key;
			current = {
				label: key,
				year: d.getFullYear(),
				start: placed.top / layout.total,
				size: 0,
				time: placed.group.time
			};
			segments.push(current);
		}

		current!.size += placed.height / layout.total;
	}

	return segments;
}
