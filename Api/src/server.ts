import express from 'express'
import cors from 'cors'
import { getTelemetry as getTelemetry } from './modules/getTelemetry'
import { performClustering } from './modules/performClustering'

const app = express()

// Set app variables
app.set('port', process.env.PORT ?? 5000)

// Set app middlewares
app.use(cors())

// Set routes
app.get('/rov', async (_, res) => {
	// Run DBSCAN to generate denoised CSV file
	// TODO: ideally this outputs to JSON directly to save some steps
	const instance = performClustering()

	instance
		.once('close', async () => {
			const tel = await getTelemetry()
			res.status(200).json(tel)
		})
		.once('error', () => {
			res.status(500).json({ error: 'failed to run pythong script' })
		})
})

// Start server
app.listen(app.get('port'), () => {
	console.log(`Listening on http://localhost:${app.get('port')}`)
})
