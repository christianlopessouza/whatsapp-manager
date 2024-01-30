import { DataSource } from 'typeorm';
import { APP_DIR,FILE_FORMAT } from './config'




const dataSource = new DataSource({
  type: 'sqlite',
  database: `./database.sqlite`,
  migrations: [`./${APP_DIR}/database/migrations/*.${FILE_FORMAT}`],
  entities: [`./${APP_DIR}/models/*.${FILE_FORMAT}`],
});

export default dataSource;