const bcrypt = require('bcrypt');

(async () => {
  const plainPassword = '123456'; // Şifre
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  console.log('Yeni Hash:', hashedPassword);

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Şifre eşleşiyor mu:', isMatch);
})();
