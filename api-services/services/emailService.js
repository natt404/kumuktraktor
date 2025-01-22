const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer Transporter Konfigürasyonu
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // TLS için
  secure: false, // SSL değil, TLS kullanılıyor
  auth: {
    user: process.env.EMAIL_USER, // E-posta adresiniz
    pass: process.env.EMAIL_PASS, // Gmail uygulama şifresi
  },
  
  debug: true, // Hata ayıklama loglarını aktif eder
  logger: true, // Daha detaylı log verir
});

// E-posta Gönderim İşlevi
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Gönderen e-posta adresi
      to, // Alıcı adresi
      subject, // Konu
      html, // E-posta içeriği (HTML formatında)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.response);
    return info;
  } catch (err) {
    console.error('E-posta gönderim hatası:', err.message);
    throw new Error('E-posta gönderilemedi.');
  }
};

module.exports = { sendEmail };
