/**
 * Grid density. Three levels, pinch to change, remembered between visits.
 *
 * Ente Photos has no pinch-to-change-density at all — its gallery binds long-press
 * and drag-select but never a scale gesture. Immich mobile does
 * (`mobile/lib/presentation/widgets/timeline/timeline_pinch_zoom.dart`), and
 * changes the column count *during* the gesture rather than on release, which is
 * what makes it feel like direct manipulation instead of a toggle.
 */

const KEY = 'ente-redesign.density';

export const DENSITY_LEVELS = [5, 3, 2] as const;
const DEFAULT_INDEX = 1;

function load(): number {
	if (typeof localStorage === 'undefined') return DEFAULT_INDEX;
	try {
		const raw = localStorage.getItem(KEY);
		if (raw === null) return DEFAULT_INDEX;
		const n = Number.parseInt(raw, 10);
		return Number.isInteger(n) && n >= 0 && n < DENSITY_LEVELS.length ? n : DEFAULT_INDEX;
	} catch {
		// Private mode, blocked storage — the default is a fine answer.
		return DEFAULT_INDEX;
	}
}

class Density {
	index = $state(DEFAULT_INDEX);

	get columns(): number {
		return DENSITY_LEVELS[this.index];
	}

	/** Called once on mount; reading storage during SSR or prerender is meaningless. */
	restore() {
		this.index = load();
	}

	/** `direction` is +1 for bigger tiles (spread), -1 for smaller (pinch). */
	step(direction: 1 | -1): boolean {
		const next = Math.min(DENSITY_LEVELS.length - 1, Math.max(0, this.index + direction));
		if (next === this.index) return false;
		this.index = next;
		try {
			localStorage.setItem(KEY, String(next));
		} catch {
			// Not being able to remember the choice is not a reason to refuse it.
		}
		return true;
	}

	columnsAt(index: number): number {
		return DENSITY_LEVELS[index];
	}
}

export const density = new Density();
