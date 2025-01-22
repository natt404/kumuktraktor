const cache = new Map();

// Cache'ten veri getirme
const getFromCache = (key) => {
  return cache.has(key) ? cache.get(key) : null;
};

// Cache'e veri kaydetme
const setToCache = (key, data, expiry = 3600) => {
  cache.set(key, data);
  setTimeout(() => cache.delete(key), expiry * 1000);
};

module.exports = { getFromCache, setToCache };
