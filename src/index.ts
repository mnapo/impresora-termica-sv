import { app } from './app'
import { logger } from './logger'

type User = {
  email: string
  password: string
  role: string
  firstName: string
  lastName: string
  cuit: string
  cbu: string
  alias: string
  condIvaTypeId: number
}

export const createCondIvaType = async (condIvaType: string) => {
  try {
    await app.service('cond-iva-types').create({name: condIvaType})
    logger.info(`\tcondIvaType ${condIvaType} created`)
  } catch (error) {
    logger.error('\tError creating cond-iva-types:', error)
  }
}

const createUser = async (id: number, user: User) => {
  const userRecord = await app.service('users').find({query:{email: user.email}})
  logger.info(`\tAdding user:  ${user.email}`)
  userRecord.data.length>0?logger.info("\tUser already exists"):
  app.service('users').create({email: user.email, password: user.password}).then(createdRecord => {
    logger.info( `\tUser created:`, createdRecord)
    app.service('users').patch( id, 
    {
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      cuit: user.cuit,
      cbu: user.cbu,
      alias: user.alias,
      condIvaTypeId: user.condIvaTypeId
    }).then(() => {
      console.log(`\tProperties asiggned tu user: ${user.email}`)
    }).catch(error => {
      console.error('\tError updating user:', error)
    })
  }).catch(error => {
    console.error(`\tError creating user: ${user.email}`, error)
  })
}

const port = app.get('port')
const host = app.get('host')

const populate = async () => {
  const firstCondIvaTypeRecord = await app.service('cond-iva-types').find({query:{name: 'Responsable Inscripto'}});
  if (firstCondIvaTypeRecord.data.length>0)
    logger.info("\tcondIvaTypes already exist")
  else {
    createCondIvaType('Responsable Inscripto')
    createCondIvaType('Monotributo')
    createCondIvaType('Iva Exento')
  }
  //createUser(1, { email: 'your@email.com', password: 'your-pw', role: 'admin', firstName: 'your-first-name', lastName: 'your-last-name', cuit: "", cbu: '', alias: '', condIvaTypeId: 1} );
};

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app.listen(port).then(() => {
  logger.info("Running populate procedure...")
  populate().then(() => {
    logger.info(`Feathers app listening on http://${host}:${port}`)
  });
});