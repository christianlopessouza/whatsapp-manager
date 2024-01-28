import { DataSource } from 'typeorm';
import { APP_DIR } from './config'

const dataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  migrations: [`./${APP_DIR}/database/migrations/*.ts`],
  entities: [`./${APP_DIR}/models/*.ts`],
});
console.log('Entidades lidas:', dataSource.options.entities);


export default dataSource;