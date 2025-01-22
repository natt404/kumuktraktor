const rateLimit = require('express-rate-limit');

// İstek sınırlandırıcı
exports.rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için maksimum 100 istek
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
});

const redis = require('../config/redis');

const rateLimit = (key, limit, duration) => async (req, res, next) => {
  try {
    const currentRequests = await redis.incr(key);
    if (currentRequests === 1) {
      await redis.expire(key, duration); // Süreyi ayarla
    }
    if (currentRequests > limit) {
      return res.status(429).json({ error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' });
    }
    next();
  } catch (err) {
    console.error('Rate limit error:', err);
    next();
  }
};

module.exports = rateLimit;
