/**
 * A synthetic photo library.
 *
 * Fake data only — there is no backend. Everything is derived from one fixed
 * seed so the library is identical on every reload and every device, which is
 * what makes "does this scroll smoothly" a repeatable question.
 *
 * Photos are anchored to *today* rather than to a fixed date, so the "Today"
 * and "Yesterday" headers stay honest.
 */

export type Photo = {
	id: string;
	/** picsum.photos seed — stable per photo, so the same image comes back every time. */
	seed: string;
	/** Epoch milliseconds. */
	time: number;
	/** Hue for the placeholder colour shown under the image while it loads. */
	hue: number;
};

export type DayGroup = {
	/** Local YYYY-MM-DD. */
	key: string;
	label: string;
	/** Index of this group's first photo in the flat array. */
	start: number;
	count: number;
	time: number;
};

const SEED = 20_260_921;
const TOTAL = 3200;
const SPAN_DAYS = Math.round(4 * 365.25);
const DAY_MS = 86_400_000;

/** mulberry32 — small, fast, good enough, and deterministic across engines. */
function mulberry32(a: number) {
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
	};
}

function startOfDay(ms: number): number {
	const d = new Date(ms);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

/**
 * Real libraries are lumpy: nothing for a fortnight, then forty photos from one
 * afternoon. Uniformly scattered photos make virtualization look easier than it
 * is, because every day group is the same height.
 */
export function buildLibrary(now: number = Date.now()): Photo[] {
	const rnd = mulberry32(SEED);
	const photos: Photo[] = [];
	const today = startOfDay(now);
	let n = 0;

	while (photos.length < TOTAL) {
		// Skew towards recent days — people take more photos lately than four years ago.
		const dayOffset = Math.floor(Math.pow(rnd(), 1.7) * SPAN_DAYS);
		const burst = 1 + Math.floor(Math.pow(rnd(), 2.2) * 38);
		const base = today - dayOffset * DAY_MS;

		for (let i = 0; i < burst && photos.length < TOTAL; i++) {
			const hour = 7 + Math.floor(rnd() * 14);
			const time = base + hour * 3_600_000 + Math.floor(rnd() * 3_600_000);
			photos.push({ id: `p${n}`, seed: `ente-${n}`, time, hue: Math.floor(rnd() * 360) });
			n++;
		}
	}

	photos.sort((a, b) => b.time - a.time);
	return photos;
}

const sameYear = new Intl.DateTimeFormat(undefined, {
	weekday: 'short',
	day: 'numeric',
	month: 'short'
});
const otherYear = new Intl.DateTimeFormat(undefined, {
	day: 'numeric',
	month: 'short',
	year: 'numeric'
});

function dayLabel(time: number, now: number): string {
	const day = startOfDay(time);
	const today = startOfDay(now);
	if (day === today) return 'Today';
	if (day === today - DAY_MS) return 'Yesterday';
	const d = new Date(day);
	return d.getFullYear() === new Date(today).getFullYear()
		? sameYear.format(d)
		: otherYear.format(d);
}

function dayKey(time: number): string {
	const d = new Date(time);
	const m = `${d.getMonth() + 1}`.padStart(2, '0');
	const day = `${d.getDate()}`.padStart(2, '0');
	return `${d.getFullYear()}-${m}-${day}`;
}

/** Photos must already be sorted newest-first. */
export function groupByDay(photos: Photo[], now: number = Date.now()): DayGroup[] {
	const groups: DayGroup[] = [];
	let current: DayGroup | undefined;

	for (let i = 0; i < photos.length; i++) {
		const key = dayKey(photos[i].time);
		if (!current || current.key !== key) {
			current = {
				key,
				label: dayLabel(photos[i].time, now),
				start: i,
				count: 0,
				time: startOfDay(photos[i].time)
			};
			groups.push(current);
		}
		current.count++;
	}

	return groups;
}

const monthYear = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

export function formatMonthYear(time: number): string {
	return monthYear.format(new Date(time));
}
