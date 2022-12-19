import express from 'express'
import { createServer as createServerHTTP } from 'http'
import WebSocket from 'ws'
import { config as dotenvConfig } from 'dotenv'
import router from './ws/router/ws.router'

const app = express()
const server = createServerHTTP(express)
const wss = new WebSocket.Server({ server })
dotenvConfig()

wss.on('connection', router)

app.get('/api', (_req, res) => res.send('hola'))

app.listen(process.env.PORT_REST, () => console.log(`api rest running on port ${process.env.PORT_REST}`))
server.listen(process.env.PORT_WS, () => console.log(`api ws running on port ${process.env.PORT_WS}`))