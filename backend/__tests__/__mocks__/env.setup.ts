process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://moodmap:moodmap@localhost:2054/moodmap_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789-abcdefghijkl';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789-abcdefghijk';
process.env.MOOD_MIN_RESPONSES = '3';
process.env.ENABLE_JOBS = 'false';
process.env.TIMEZONE = 'Europe/Paris';
