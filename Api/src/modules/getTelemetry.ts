import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import type { RovCampaign } from '../types/RovCampaign'

const readFileAsync = promisify(fs.readFile)

export async function getTelemetry(): Promise<RovCampaign> {
	const data: RovCampaign = {
		positions: [],
		times: [],
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

		// Date,Time,Easting,Northing,WaterDepth,Roll,Pitch,Heading
		// 20-02-27,20:50:47.502,0.15818706419820527,0.41015873015873017,92.93,-6.3,2.0,19.9

		const [year, month, day] = (date as string).split('-')
		const dateTime = new Date(`20${year}-${month}-${day}T${time}`).getTime()

		data.positions.push(eastingOrigin - parseInt(easting))
		data.positions.push(-1 * parseInt(waterDepth))
		data.positions.push(northingOrigin - parseInt(northing))

		data.times.push(dateTime)
		data.rolls.push(parseInt(roll))
		data.pitches.push(parseInt(pitch))
		data.headings.push(parseInt(heading))
	}

	return data
}
