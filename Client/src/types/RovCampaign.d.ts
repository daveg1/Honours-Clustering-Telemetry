export type RovCampaign = {
	positions: number[];
	times: string[];
	kpi: number[];
	rolls: number[];
	pitches: number[];
	headings: number[];
};

export type ApiResponse = {
	raw: RovCampaign;
	denoised: RovCampaign;
};
