import { RovCampaign } from '../types/RovCampaign';

const endpoint = 'http://localhost:5000/rov';

export async function getTelemetryRaw(): Promise<RovCampaign> {
	const res = await fetch(endpoint + '/raw');

	if (res.status === 200) {
		return (await res.json()) as RovCampaign;
	} else {
		throw new Error(res.statusText);
	}
}

export async function getTelemetryDenoised(
	start: number,
	end: number,
	windowed: boolean
): Promise<RovCampaign> {
	const url = new URL(endpoint + '/denoised');
	url.searchParams.set('start', start.toString());
	url.searchParams.set('end', end.toString());
	url.searchParams.set('windowed', String(windowed));

	const res = await fetch(url);

	if (res.status === 200) {
		return (await res.json()) as RovCampaign;
	} else {
		throw new Error(res.statusText);
	}
}
