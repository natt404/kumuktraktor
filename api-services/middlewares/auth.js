const jwt = require("jsonwebtoken");
const User = require("../models/Users");

// Token doğrulama yardımcı fonksiyonu
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Geçersiz veya süresi dolmuş token.");
  }
};


// Kullanıcının giriş yapmış olduğunu doğrula
exports.isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    console.log('Alınan Access Token:', token); // Token'i logla

    if (!token) {
      return res.status(401).json({ error: "Yetkisiz erişim: Token bulunamadı." });
    }

    // Token doğrulama

    
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = decoded; // Kullanıcı bilgilerini isteğe ekle

   
    next();
  } catch (error) {
    console.error("Yetkilendirme hatası:", error.message);
    return res.status(401).json({ error: error.message });
  }
};

// Kullanıcının admin rolü olup olmadığını kontrol et
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Bu işlem için yetkiniz yok." });
};

// Refresh Token doğrulaması (Redis kaldırıldı)
exports.verifyRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token bulunamadı." });
    }

    // Refresh token doğrulama
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Refresh token hatası:", error.message);
    return res.status(401).json({ error: error.message });
  }
};

// Kullanıcının belirli izinlere sahip olup olmadığını kontrol et
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.user && req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }
    return res.status(403).json({ error: "Bu işlem için izniniz yok." });
  };
};

exports.authStatus = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    console.log('Gelen Access Token:', token);

    if (!token) {
      console.warn('Access Token eksik!');
      return res.json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Kullanıcının rolünü veritabanından al
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.json({ isAuthenticated: false });
    }

    res.json({
      isAuthenticated: true,
      userId: user._id,
      role: user.role, // Kullanıcı rolü
    });
  } catch (err) {
    console.error('Auth Status Hatası:', err.message);
    res.json({ isAuthenticated: false });
  }
};

// Kullanıcı giriş işlemi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre.' });
    }

    // Token oluştur
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Loglama
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    // Token'ları çerezlere yaz
    res.cookie('access_token', accessToken, { httpOnly: true, secure: false });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: false });

    res.status(200).json({ message: 'Giriş başarılı.', userId: user._id, role: user.role });
  } catch (error) {
    console.error('Login hatası:', error.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};


