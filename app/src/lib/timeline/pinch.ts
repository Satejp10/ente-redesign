/**
 * Two-finger pinch, reported as discrete steps.
 *
 * The grid has three density levels rather than continuous zoom, so the gesture
 * reports a step each time the fingers cross a ratio threshold and then rebases.
 * That lets one long pinch walk through every level, and it fires mid-gesture
 * rather than on release.
 *
 * `ctrl` + wheel is wired to the same steps so the prototype can be judged on a
 * laptop as well as a phone.
 */

export type PinchOptions = {
	/** +1 = spread (bigger tiles), -1 = pinch (smaller tiles). */
	onStep: (direction: 1 | -1, centerY: number) => void;
	onStart?: () => void;
	onEnd?: () => void;
};

const STEP_IN = 1.3;
const STEP_OUT = 1 / STEP_IN;

export function pinch(node: HTMLElement, options: PinchOptions) {
	let opts = options;
	const points = new Map<number, { x: number; y: number }>();
	let baseDistance = 0;
	let active = false;
	let previousTouchAction = '';

	const distance = () => {
		const [a, b] = [...points.values()];
		return Math.hypot(a.x - b.x, a.y - b.y);
	};

	const centerY = () => {
		const [a, b] = [...points.values()];
		return (a.y + b.y) / 2 - node.getBoundingClientRect().top;
	};

	const stop = () => {
		if (!active) return;
		active = false;
		node.style.touchAction = previousTouchAction;
		opts.onEnd?.();
	};

	const onPointerDown = (event: PointerEvent) => {
		if (event.pointerType === 'mouse') return;
		points.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (points.size === 2) {
			baseDistance = distance();
			active = true;
			previousTouchAction = node.style.touchAction;
			// Takes effect from the *next* gesture in Chromium, but it stops the
			// page zooming if the fingers stay down across a re-render.
			node.style.touchAction = 'none';
			opts.onStart?.();
		}
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!points.has(event.pointerId)) return;
		points.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (!active || points.size !== 2 || baseDistance === 0) return;

		const ratio = distance() / baseDistance;
		if (ratio > STEP_IN) {
			opts.onStep(1, centerY());
			baseDistance = distance();
		} else if (ratio < STEP_OUT) {
			opts.onStep(-1, centerY());
			baseDistance = distance();
		}
	};

	const onPointerUp = (event: PointerEvent) => {
		points.delete(event.pointerId);
		if (points.size < 2) stop();
	};

	const onWheel = (event: WheelEvent) => {
		if (!event.ctrlKey) return;
		event.preventDefault();
		const rect = node.getBoundingClientRect();
		opts.onStep(event.deltaY < 0 ? 1 : -1, event.clientY - rect.top);
	};

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerUp);
	node.addEventListener('wheel', onWheel, { passive: false });

	return {
		update(next: PinchOptions) {
			opts = next;
		},
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerUp);
			node.removeEventListener('wheel', onWheel);
		}
	};
}
