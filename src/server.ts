import express from 'express';
import routes from './routes';
import dotenv from 'dotenv';

import './database/connection'
dotenv.config();


const app = express();

app.use(express.json());
app.use(routes);

app.listen(3324)
console.log("SERVER RODANDO NA PORTA 3324");