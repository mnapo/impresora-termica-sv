import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

const createCondIvaTypes = async () => {
  try {
    await app.service('cond-iva-types').find()
    await app.service('cond-iva-types').create({ name: 'Responsable Inscripto' });
    await app.service('cond-iva-types').create({ name: 'IVA Exento' });
    await app.service('cond-iva-types').create({ name: 'Monotributo' });
    logger.info('\tcondIvaTypes created');
  } catch (error) {
    logger.error('\tError creating cond-iva-types:', error);
  }
};

const createSuperUser = async () => {
  const superUser = {email: 'admin', password: 'admin'};
  app.service('users').create(superUser).then(user => {
    logger.info('\tSuper user created:', user)
  }).catch(error => {
    console.error('\tError creating super user:', error)
  }).then(() => {
    app.service('users').patch(1, { role: 'admin', firstName: 'Admin', lastName: 'Admin' }).then(() => {
      console.log('\tAdmin role assigned to super user')
    }).catch(error => {
      console.error('\tError updating super user:', error)
    })
  });
};
const populate = async () => {
  const superUserRecord = await app.service('users').find({query:{email: 'admin'}});
  superUserRecord.data.length>0?logger.info("\tSuper user already exists"):createSuperUser();
  const firstCondIvaTypeRecord = await app.service('cond-iva-types').find({query:{name: 'Responsable Inscripto'}});
  firstCondIvaTypeRecord.data.length>0?logger.info("\tcondIvaTypes already exist"):createCondIvaTypes();
};

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app.listen(port).then(() => {
  logger.info("Running populate procedure...")
  populate().then(() => {
    logger.info(`Feathers app listening on http://${host}:${port}`)
  });
});