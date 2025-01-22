const redisClient = require('./config/redis'); // Redis bağlantısı

const clearRedisCache = async () => {
  try {
    await redisClient.flushAll();
    console.log('Redis önbelleği temizlendi!');
  } catch (err) {
    console.error('Redis önbelleği temizlenemedi:', err.message);
  }
};

clearRedisCache();
