import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
  const superUser = {
      email: 'admin',
      password: 'admin',
  };
  app.service('users').create(superUser).then(user => {
      console.log('Admin user created:', user)
  }).catch(error => {
      console.error('Error creating admin user:', error)
  })
})