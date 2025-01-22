const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const router = express.Router();

// Helper: JWT oluşturma
const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id.toString(), role: user.role }, // role ekleniyor
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id.toString() }, // refresh token için role eklenmesine gerek yok
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Kullanıcı Girişi
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı veritabanında ara
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }

    // Token oluştur ve cookie'ye yaz
    const { accessToken, refreshToken } = createTokens(user);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    res.status(200).json({ message: "Login başarılı", role: user.role });
  } catch (error) {
    console.error("Login hatası:", error.message);
    res.status(500).json({ error: "Login sırasında bir hata oluştu" });
  }
});

// Token Yenileme
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token eksik" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Kullanıcıyı veritabanında ara
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    // Yeni token oluştur ve cookie'ye yaz
    const { accessToken, refreshToken: newRefreshToken } = createTokens(user);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    res.status(200).json({ message: "Token yenilendi" });
  } catch (err) {
    console.error("Refresh token hatası:", err.message);
    res.status(401).json({ error: "Token yenileme sırasında hata oluştu" });
  }
});

// Kullanıcı Çıkışı
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("access_token", { httpOnly: true, sameSite: "Strict" });
    res.clearCookie("refresh_token", { httpOnly: true, sameSite: "Strict" });

    res.status(200).json({ message: "Logout başarılı" });
  } catch (error) {
    console.error("Logout hatası:", error.message);
    res.status(500).json({ error: "Çıkış işlemi sırasında bir hata oluştu." });
  }
});

// Kullanıcı Durumu
router.get("/status", async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: "Yetkisiz erişim: Token eksik" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Kullanıcıyı veritabanında ara
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({
      isAuthenticated: true,
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error("Durum kontrol hatası:", err.message);
    res.status(401).json({ error: "Token doğrulama hatası" });
  }
});

module.exports = router;
