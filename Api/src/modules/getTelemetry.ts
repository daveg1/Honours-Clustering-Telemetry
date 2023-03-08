import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import type { RovCampaign } from '../types/RovCampaign'

const readFileAsync = promisify(fs.readFile)

export async function getTelemetry(): Promise<RovCampaign> {
	const data: RovCampaign = {
		positions: [],
		times: [],
		kpi: [],
		rolls: [],
		pitches: [],
		headings: [],
	}

	const rawData = await readFileAsync(path.resolve(__dirname, '..', 'data/telemetry.csv'), 'utf-8')
	const lines = rawData.split(/\r\n|\n/) as any[]

	lines.shift() // skip header line
	const firstLine = lines.shift()

	const eastingOrigin = firstLine[2] as number
	const northingOrigin = firstLine[3] as number

	for (const line of lines) {
		const split = line.split(',') as string[]
		const [date, time, easting, northing, waterDepth, roll, pitch, heading] = split

		const [year, month, day] = (date as string).split('-')
		const dateTime = new Date(`20${year}-${month}-${day}T${time}`).getTime()

		// data.positions.push(eastingOrigin - parseInt(easting))
		data.positions.push(parseInt(easting))
		data.positions.push(-1 * parseInt(waterDepth))
		// data.positions.push(northingOrigin - parseInt(northing))
		data.positions.push(parseInt(northing))

		data.times.push(dateTime)
		data.rolls.push(parseInt(roll))
		data.pitches.push(parseInt(pitch))
		data.headings.push(parseInt(heading))
	}

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

	return data
}
