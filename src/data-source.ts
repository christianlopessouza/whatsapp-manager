import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'sqlite',
  database: './src/database/database.sqlite',
  migrations: ['./src/database/migrations/*.ts'],
  entities: ['./src/models/*.ts'],
});
console.log('Entidades lidas:', dataSource.options.entities);


export default dataSource;