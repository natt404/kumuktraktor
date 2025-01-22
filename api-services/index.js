const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");
const { authStatus } = require('./middlewares/auth');
const formRoutes = require('./routes/forms');

// Environment Variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS Ayarları
app.use(
  cors({
    origin: ['http://localhost:3000'], // Next.js frontend adresi
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// MongoDB Bağlantısı
connectDB();

// Auth Durumu Route'u
app.get('/api/status', authStatus);

// Public Routes Dinamik Yükleme
const publicRoutesPath = path.join(__dirname, 'routes', 'public'); // Bu zaten tanımlı
fs.readdirSync(publicRoutesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const routeName = file.replace('.js', '');
    const route = require(path.join(publicRoutesPath, file));
    app.use(`/api/public/${routeName}`, route);
    console.log(`Public Route yüklendi: /api/public/${routeName}`);
  }
});
const mediaRoutes = require('./routes/admin/media');

// Media endpoint'lerini kullan
app.use('/api/admin/media', mediaRoutes);
// Slug Çözümleme Endpoint'i
app.get("/api/resolve-slug/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    // MongoDB'den kategori veya ürün bul
    const category = await require("./models/Categories").findOne({ slug });
    if (category) {
      return res.json({ type: "category", data: category });
    }

    const product = await require("./models/Products")
      .findOne({ slug })
      .populate("images", "url")
      .populate("category", "name");

    if (product) {
      return res.json({ type: "product", data: product });
    }

    res.status(404).json({ message: "Slug için veri bulunamadı" });
  } catch (err) {
    console.error("Hata:", err.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});



// Admin Routes Dinamik Yükleme
const adminRoutesPath = path.join(__dirname, 'routes', 'admin');
fs.readdirSync(adminRoutesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const routeName = file.replace('.js', '');
    const route = require(path.join(adminRoutesPath, file));
    app.use(`/api/admin/${routeName}`, route);
    console.log(`Admin Route yüklendi: /api/admin/${routeName}`);
  }
});


// Ek Rotlar
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const apiKeyRoute = require('./routes/apiKey');
const testRoutes = require('./routes/test');

app.use('/api/auth', authRoutes);
console.log('Auth routes yüklendi.');
app.use('/api/search', searchRoutes);
app.use('/api', apiKeyRoute);
app.use('/api/test', testRoutes);

app.use('/api/forms', formRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Global Hata Yönetimi
app.use((err, req, res, next) => {
  console.error('Hata:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
