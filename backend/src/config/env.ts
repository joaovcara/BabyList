import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  databasePath: path.resolve(
    backendRoot,
    process.env.DATABASE_PATH || '../data/database.json'
  ),
};
