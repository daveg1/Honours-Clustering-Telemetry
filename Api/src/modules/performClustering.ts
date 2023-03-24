import { spawn } from 'node:child_process'
import path from 'node:path'

export function performClustering(start: number, end: number) {
	const basePath = path.resolve(__dirname, '..')
	const scriptPath = path.join(basePath, 'scripts/dbscan.py')

	// * Hardcoded to first leg of journey for now
	const process = spawn('python', [scriptPath, basePath, start.toString(), end.toString()])

	process.stdout.on('data', (data) => {
		console.log(data.toString())
	})

	return process
}
