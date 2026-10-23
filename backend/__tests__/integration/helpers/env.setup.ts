import { testDatabaseUrl } from './test-database';

// Défini avant dotenv : le DATABASE_URL de backend/.env (base de démo) n'est jamais lu.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDatabaseUrl();
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789-abcdefghijkl';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789-abcdefghijk';
process.env.MOOD_MIN_RESPONSES = '3';
process.env.ENABLE_JOBS = 'false';
process.env.TIMEZONE = 'Europe/Paris';
