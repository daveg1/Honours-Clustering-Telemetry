import express from 'express'
import cors from 'cors'
import { getTelemetryDenoised, getTelemetryRaw } from './modules/getTelemetry'
import { performClustering } from './modules/performClustering'

const app = express()

// Set app variables
app.set('port', process.env.PORT ?? 5000)

// Set app middlewares
app.use(cors())

// Set routes
// TODO: add queryparams for a specific leg of the journey
app.get('/rov/denoised', async (_, res) => {
	// Run DBSCAN to generate denoised CSV file
	// * ideally this outputs to JSON directly to save some steps
	const instance = performClustering()

	instance
		.once('close', async () => {
			try {
				const tel = await getTelemetryDenoised()
				res.status(200).json(tel)
			} catch (error) {
				res.status(500).json({ error: 'Failed to load denoised data' })
			}
		})
		.once('error', () => {
			res.status(500).json({ error: 'Failed to perform clustering' })
		})
})

app.get('/rov/raw', async (_, res) => {
	try {
		const data = await getTelemetryRaw()
		res.status(200).json(data)
	} catch (err) {
		res.status(500).json({ error: 'Failed to load raw data' })
	}
})

// Start server
app.listen(app.get('port'), () => {
	console.log(`Listening on http://localhost:${app.get('port')}`)
})
