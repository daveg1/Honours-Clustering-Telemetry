import { spawn } from 'node:child_process'
import path from 'node:path'

export function performClustering(
	eps: number,
	min_samples: number,
	start: number,
	end: number,
	windowed: string,
) {
	const basePath = path.resolve(__dirname, '..')
	const scriptPath = path.join(basePath, 'scripts/dbscan.py')

	console.log('Spawning process', 'eps', eps, 'min_samples', min_samples)

	// * Hardcoded to first leg of journey for now
	const process = spawn('python', [
		scriptPath,
		basePath,
		eps.toString(),
		min_samples.toString(),
		start.toString(),
		end.toString(),
		windowed,
	])

	process.stdout.on('data', (data) => {
		console.log(data.toString())
	})

	return process
}
