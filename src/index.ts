import https from 'https'
import fs from 'fs'
import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')
logger.info('helloooo')
process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

const server = https
  .createServer(
    {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.csr')
    },
    app.callback()
  )
  .listen(443)

app.setup(server)

server.on('listening', () => logger.info('Feathers application started'))