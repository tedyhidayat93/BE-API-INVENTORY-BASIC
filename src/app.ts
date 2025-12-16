import express from 'express'
import cors from 'cors'
import router from './router/index'
import 'dotenv/config'

const app = express()

const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
}

// ✅ CORS (preflight handled automatically)
app.use(cors(corsOptions))

// ✅ Body parser
app.use(express.json())

// ✅ Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

// ✅ Routes
router(app)

export default app
