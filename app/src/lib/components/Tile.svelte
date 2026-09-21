<script lang="ts">
	import type { Photo } from '$lib/data/library';

	type Props = {
		photo: Photo;
		top: number;
		left: number;
		size: number;
	};

	let { photo, top, left, size }: Props = $props();

	/**
	 * One request size for every density level. Asking for a different width per
	 * level would change the URL and re-download every visible photo on each
	 * pinch step, which is exactly when the app must not stutter.
	 */
	const THUMB = 400;

	let status: 'loading' | 'loaded' | 'failed' = $state('loading');
	let attempt = $state(0);

	const src = $derived(
		`https://picsum.photos/seed/${photo.seed}/${THUMB}/${THUMB}` + (attempt ? `?retry=${attempt}` : '')
	);

	function retry(event: MouseEvent) {
		event.stopPropagation();
		status = 'loading';
		attempt += 1;
	}
</script>

<div
	data-tile
	class="tile"
	style:top="{top}px"
	style:left="{left}px"
	style:width="{size}px"
	style:height="{size}px"
	style:background="hsl({photo.hue} var(--placeholder-saturation) var(--placeholder-lightness))"
>
	{#if status !== 'failed'}
		<img
			{src}
			alt=""
			draggable="false"
			decoding="async"
			class:loaded={status === 'loaded'}
			onload={() => (status = 'loaded')}
			onerror={() => (status = 'failed')}
		/>
	{:else}
		<!-- No spinner. A photo that will not load says so, and offers a way out. -->
		<button class="retry" onclick={retry} aria-label="Retry loading photo">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"
					fill="currentColor"
				/>
			</svg>
		</button>
	{/if}
</div>

<style>
	.tile {
		position: absolute;
		overflow: hidden;
		border-radius: 2px;
		contain: strict;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		opacity: 0;
		transition: opacity 180ms ease-out;
	}

	img.loaded {
		opacity: 1;
	}

	.retry {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--text-muted);
	}

	.retry svg {
		width: 38%;
		max-width: 26px;
		min-width: 14px;
	}

	.retry:active {
		color: var(--text);
	}
</style>
