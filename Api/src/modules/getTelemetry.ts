import fs from 'node:fs'
import path from 'node:path'
import csvParser from 'csv-parser'
import { finished } from 'node:stream/promises'
import type { RovCampaign } from '../types/RovCampaign'

type DataRow = {
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

/**
 * Reads and parses the telemetry.csv file into JSON format
 * @returns parsed ROV campaign data
 */
export async function getTelemetry(): Promise<RovCampaign> {
	const data: RovCampaign = {
		positions: [],
		times: [],
		kpi: [],
		rolls: [],
		pitches: [],
		headings: [],
	}

	const eastingOrigin = parseFloat('0.5614811252705111')
	const northingOrigin = parseFloat('0.4420063492064438')

	const readStream = fs
		.createReadStream(path.resolve(__dirname, '..', 'data/telemetry_denoised.csv'))
		.pipe(csvParser())
		.on('data', (row: DataRow) => {
			const { Date: date, Time, Easting, Northing, WaterDepth, Roll, Pitch, Heading } = row

			const [year, month, day] = (date as string).split('-')
			const dateTime = new Date(`20${year}-${month}-${day}T${Time}`).getTime()

			const scaleFactor = 250 // used to scale up the points in the 3d model

			data.positions.push((eastingOrigin - parseFloat(Easting)) * scaleFactor)
			data.positions.push(-1 * parseFloat(WaterDepth))
			data.positions.push((northingOrigin - parseFloat(Northing)) * scaleFactor)

			data.times.push(dateTime)
			data.rolls.push(parseFloat(Roll))
			data.pitches.push(parseFloat(Pitch))
			data.headings.push(parseFloat(Heading))
		})
		.once('end', () => {
			const maxInterval = 10000000
			let tickDifference = 0

			// Normalise times between 0 and 255 for mapping with heatmap gradient in 3D model.
			for (let i = 0; i < data.times.length - 1; i++) {
				tickDifference = data.times[i + 1] - data.times[i]

				if (tickDifference >= maxInterval) {
					tickDifference = maxInterval
				}

				data.kpi.push(Math.floor(255 * (tickDifference / maxInterval)))
			}
		})

	await finished(readStream)
	return data
}
