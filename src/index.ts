import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app.listen(port).then(() => {
  const superUser = {
    email: 'admin',
    password: 'admin'
  };
  app.service('users').create(superUser).then(user => {
    console.log('Admin user created:', user)
  }).catch(error => {
    console.error('Error creating admin user:', error)
  }).then(() => {
    app.service('users').patch(1, { role: 'admin' }).then(() => {
      console.log('Admin role assigned to user with ID 1')
    }).catch(error => {
      console.error('Error creating admin user:', error)
    })
  })
  logger.info(`Feathers app listening on http://${host}:${port}`)
})