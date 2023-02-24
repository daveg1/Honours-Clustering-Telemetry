import express from 'express'
import cors from 'cors'
import { getTelemetry as getTelemetry } from './modules/getTelemetry'

const app = express()

// Set app variables
app.set('port', process.env.PORT ?? 5000)

// Set app middlewares
app.use(cors())

// Set routes
app.get('/rov', async (_, res) => {
	const tel = await getTelemetry()
	res.status(200).json(tel)
})

// Start server
app.listen(app.get('port'), () => {
	console.log(`Listening on http://localhost:${app.get('port')}`)
})
