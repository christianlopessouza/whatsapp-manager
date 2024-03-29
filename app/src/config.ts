
import dotenv from 'dotenv';

const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env${environment !== 'development' ? `.${environment}` : ''}` });

export const PORT = parseInt(process.env.PORT!) || 3000;
export const GATEWAY = process.env.GATEWAY || '0.0.0.0';
export const APP_DIR = process.env.APP_DIR;
export const FILE_FORMAT = process.env.FILE_FORMAT;
export const DB_DIR = process.env.DB_DIR;


// Adicione outras variáveis de ambiente conforme necessário
