process.env.PORT = '3001';
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-jest';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-jest';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
