export type RovCampaign = {
	positions: number[]
	times: number[]
	kpi: number[]
	rolls: number[]
	pitches: number[]
	headings: number[]
}

export type DataRow = {
	Easting: string
	Northing: string
	WaterDepth: string
	Label: string
	Date: string
	Time: string
	Roll: string
	Pitch: string
	Heading: string
}

export type ApiResponse = {
	raw: RovCampaign
	denoised: RovCampaign
}
