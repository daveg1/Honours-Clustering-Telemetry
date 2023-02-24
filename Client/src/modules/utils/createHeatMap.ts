import type { Globals } from '../../types/Globals';

export function createHeatMap(): Globals['heatMap'] {
	const gradient: Globals['heatMap'] = [];

	let r = 0;
	let g = 1;
	let b = 0;

	for (let i = 0; i < 128; i++) {
		gradient.push([r, g, b]);
		r += 1 / 128;
	}

	for (let i = 0; i < 128; i++) {
		gradient.push([r, g, b]);
		g -= 1 / 128;
	}

	return gradient;
}
