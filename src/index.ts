import { app } from './app'
import { logger } from './logger'
import { Application } from './declarations'

const port = app.get('port')
const host = app.get('host')

const AddConIvaTypes = async (app: Application) => {
  try {
    await app.service('cond-iva-types').create({ name: 'Responsable Inscripto' });
    await app.service('cond-iva-types').create({ name: 'IVA Excento' });
    await app.service('cond-iva-types').create({ name: 'Monotributista' });
  } catch (error) {
    logger.error('Error creating cond-iva-types:', error);
  }
}

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app.listen(port)
.then(() => {
  const superUser = {
    email: 'admin',
    password: 'admin',
  };
  app.service('users').create(superUser).then(user => {
    console.log('Admin user created:', user)
  }).catch(error => {
    console.error('Error creating admin user:', error)
  }).then(() => {
    app.service('users').patch(1, { role: 'admin', firstName: 'Admin', lastName: 'Admin' }).then(() => {
      console.log('Admin role assigned to user with ID 1')
    }).catch(error => {
      console.error('Error creating admin user:', error)
    })
  })
  logger.info(`Feathers app listening on http://${host}:${port}`)
})
.then(() => AddConIvaTypes(app))
.catch(error => {
  logger.error('Error adding ConIvaTypes:', error)
  process.exit(1)
});