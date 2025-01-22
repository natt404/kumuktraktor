const cacheStore = new Map();

// Hafıza tabanlı önbellekleme middleware'i
const cache = (key, expiryInSeconds = 3600) => (req, res, next) => {
  if (cacheStore.has(key)) {
    const { data, expiry } = cacheStore.get(key);
    if (Date.now() < expiry) {
      console.log(`Cache hit for key: ${key}`);
      return res.status(200).json(data);
    }
    cacheStore.delete(key); // Süresi dolmuş cache'i temizle
  }

  // Orijinal response'u yakalayıp cache'e kaydetme
  const originalJson = res.json;
  res.json = (body) => {
    cacheStore.set(key, { data: body, expiry: Date.now() + expiryInSeconds * 1000 });
    originalJson.call(res, body);
  };

  next();
};

module.exports = cache;
