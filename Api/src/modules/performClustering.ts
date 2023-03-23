import { spawn } from 'node:child_process'
import path from 'node:path'

export function performClustering() {
	const scriptPath = path.resolve(__dirname, '..', 'scripts/dbscan.py')
	return spawn('python', [scriptPath])
}
