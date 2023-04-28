import { spawn } from 'node:child_process'
import path from 'node:path'

export function performClustering(start: number, end: number, windowed: string) {
	const basePath = path.resolve(__dirname, '..')
	const scriptPath = path.join(basePath, 'scripts/dbscan.py')

	console.log('Spawning process', 'start', start, 'end', end)

	// * Hardcoded to first leg of journey for now
	const process = spawn('py', [scriptPath, basePath, start.toString(), end.toString(), windowed])

	process.stdout.on('data', (data) => {
		console.log(data.toString())
	})

	process.stdout.on('error', (error) => {
		console.log('Python error', error)
	})

	return process
}
