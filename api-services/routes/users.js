const express = require('express');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

// Tüm kullanıcıları listele
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Veritabanından kullanıcıları al
    const users = await User.find().select('-password'); // Şifre alanını döndürme
    res.status(200).json(users);
  } catch (err) {
    console.error('Kullanıcılar getirilemedi:', err.message);
    res.status(500).json({ error: 'Kullanıcılar getirilemedi.' });
  }
});

// Yeni bir kullanıcı oluştur
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // E-posta kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });
    }

    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Kullanıcı oluşturuldu.', user: savedUser });
  } catch (err) {
    console.error('Kullanıcı oluşturulamadı:', err.message);
    res.status(500).json({ error: 'Kullanıcı oluşturulamadı.' });
  }
});

// Kullanıcı bilgilerini düzenle
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true }
    ).select('-password'); // Şifre alanını döndürme

    if (!updatedUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json({ message: 'Kullanıcı düzenlendi.', user: updatedUser });
  } catch (err) {
    console.error('Kullanıcı düzenlenemedi:', err.message);
    res.status(500).json({ error: 'Kullanıcı düzenlenemedi.' });
  }
});

// Kullanıcıyı sil
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json({ message: 'Kullanıcı silindi.' });
  } catch (err) {
    console.error('Kullanıcı silinemedi:', err.message);
    res.status(500).json({ error: 'Kullanıcı silinemedi.' });
  }
});

module.exports = router;
