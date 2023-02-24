import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const readFileAsync = promisify(fs.readFile)

type RovData = {
	Date: string
	Time: string
	Easting: string
	Northing: string
	WaterDepth: string
	Roll: string
	Pitch: string
	Heading: string
}[]

export async function getTelemetry(): Promise<RovData> {
	const data: RovData = []

	const rawData = await readFileAsync(path.resolve(__dirname, '..', 'data/telemetry.csv'), 'utf-8')
	const lines = rawData.split(/\r\n|\n/)

	for (const line of lines) {
		const fields = line.split(',')

		data.push({
			Date: fields[0],
			Time: fields[1],
			Easting: fields[2],
			Northing: fields[3],
			WaterDepth: fields[4],
			Roll: fields[5],
			Pitch: fields[6],
			Heading: fields[7],
		})
	}

	return data
}
