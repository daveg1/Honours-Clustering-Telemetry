import fs from 'node:fs'
import path from 'node:path'
import csvParser from 'csv-parser'
import { finished } from 'node:stream/promises'
import type { DataRow, RovCampaign } from '../types/RovCampaign'

const dataDir = path.resolve(__dirname, '../data')

async function readFile(filePath: string): Promise<RovCampaign> {
	const data: RovCampaign = {
		positions: [],
		times: [],
		kpi: [],
		rolls: [],
		pitches: [],
		headings: [],
		labels: [],
	}

	const eastingOrigin = parseFloat('0.5614811252705111')
	const northingOrigin = parseFloat('0.4420063492064438')

	const readStream = fs
		.createReadStream(filePath)
		.pipe(csvParser())
		.on('data', (row: DataRow) => {
			const { DateTime, Easting, Northing, WaterDepth, Roll, Pitch, Heading, Label } = row

			const dateTime = parseInt(DateTime)
			const scaleFactor = 250 // used to scale up the points in the 3d model

			data.positions.push((eastingOrigin - parseFloat(Easting)) * scaleFactor)
			data.positions.push(-1 * parseFloat(WaterDepth))
			data.positions.push((northingOrigin - parseFloat(Northing)) * scaleFactor)

			data.times.push(dateTime)
			data.rolls.push(parseFloat(Roll))
			data.pitches.push(parseFloat(Pitch))
			data.headings.push(parseFloat(Heading))

			if (Number.isInteger(+Label)) {
				data.labels.push(parseInt(Label))
			}
		})
		.once('end', () => {
			const maxInterval = 10_000
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

/**
 * Reads and parses the telemetry.csv file into JSON format
 * @returns parsed ROV campaign data
 */
export async function getTelemetryDenoised(): Promise<RovCampaign> {
	const denoised = await readFile(path.join(dataDir, 'telemetry_denoised.csv'))
	return denoised
}

export async function getTelemetryRaw(): Promise<RovCampaign> {
	const data = await readFile(path.join(dataDir, 'telemetry.csv'))
	return data
}
