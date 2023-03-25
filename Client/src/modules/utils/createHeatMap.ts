export function createHeatMap(): typeof globalThis.heatMap {
	const gradient: typeof globalThis.heatMap = [];

	let r = 0;
	let g = 1;
	let b = 0;
	let s = 0;

	for (let i = 0; i < 128; i++) {
		gradient.push([r, g, b, s]);
		r += 1 / 128;
		s = r;
	}

	for (let i = 0; i < 128; i++) {
		gradient.push([r, g, b, s]);
		g -= 1 / 128;
		s += 1 / 128;
	}

	return gradient;
}
