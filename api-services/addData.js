const mongoose = require('mongoose');
const Category = require('./models/Categories'); // Kategori modeli
const Product = require('./models/Products'); // Ürün modeli

// MongoDB Bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/enterprise-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB bağlantısı başarılı!');
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  }
};

// Benzersiz slug oluşturma fonksiyonu
const generateUniqueSlug = async (baseSlug) => {
  let uniqueSlug = baseSlug;
  let count = 1;

  // Benzersiz slug bulunana kadar kontrol et
  while (await Product.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${count}`;
    count += 1;
  }

  return uniqueSlug;
};

// Kategori ve Ürünleri Ekle
const addData = async () => {
  try {
    // Kategori adı
    const categoryName = 'Lombardini 640-820 Yedek Parça';
    const categorySlug = 'lombardini-640-820-yedek-parca';

    // Kategoriyi oluştur veya mevcutsa getir
    let category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      category = await Category.create({ name: categoryName, slug: categorySlug });
      console.log('Kategori oluşturuldu:', category);
    } else {
      console.log('Kategori zaten mevcut:', category);
    }

    const productNames = [
      "ANA YATAK FLANŞ KOMPLE STD.",
      "ANA YATAK FLANŞ KOMPLE SEMİ",
      "ANA YATAK FLANŞ KOMP.STD- SEMİ",
      "ANA YATAK FLANŞ CONTA",
      "EGZOST CONTASI",
      "GÖVDE KAPAK CONTASI",
      "HAVA FİLTRE CONTASI",
      "KARTER CONTASI",
      "KÜLBÜTÖR KAPAK CONTASI",
      "SİLİNDİR KAPAK CONTASI",
      "820 KAFA CONTA",
      "YAĞ FİLTRE ÇANAK CONTASI",
      "TAKIM CONTASI - 640",
      "TAKIM CONTASI - 820",
      "TAKIM CONTA 640-820",
      "BİYEL KOLU",
      "BİYEL KOL BURCU STD.",
      "BİYEL KOL BURCU SEMİ",
      "BİYEL KOL CİVATASI",
      "BİYEL KOL CİVATA SOMUNU",
      "BİYEL KOL YATAK STD-0,25-0,50",
      "BİYEL KOL YATAK STD-0,25-0,50 (640)",
      "BİYEL KOL YATAK STD-0,25-0,50(820)",
      "BİYEL KOL YATAK STD0.25 8220",
      "ÇALIŞTIRMA DURDURMA DÜZENİ JİKLE",
      "ÇALIŞTIRMA İPİ",
      "KOL YATAK 0,25",
      "EGZOST DİRSEĞİ ALT -820",
      "EGZOST DİRSEĞİ ÜST-820",
      "EGZOST SUSTURUCU -640",
      "EGZOST SUSTURUCU Y.M.-640",
      "EGZOST SUSTURUCU -640",
      "EGZOST SUSTURUCU -820",
      "EGZOST SUSTURUCU -820",
      "EGZOST SUSTURUCU KELEPÇESİ-820",
      "EKSANTRİK KAM MİLİ",
      "ENJEKTÖR KÜTÜĞÜ KOMPLE",
      "ENJEKTÖR MEMESİ 160 S 555",
      "ENJEKTÖR TAZYİK BORU -640-820",
      "GAZ KUMANDA KUTUSU KAPAĞI",
      "GAZ KUMANDA KUTUSU KOMPLE",
      "GAZ KUMANDA KUTU KELEBEK SOMUNU",
      "GÖVDE KAPAK KOMPLE",
      "GÖVDE KAPAK RULMANI",
      "HAVA FANI SACI KOMPLE DAVLUNBAZ",
      "HAVA FANI SACI KOMPLE ALT MARŞLI",
      "HAVA FANI SACI KOMPLE ÜST MARŞLI",
      "HAVA FİLTER SÜNGERİ",
      "MARŞ TAKIMI 640",
      "HAVA FİLTRE -640",
      "HAVA FİLTRE SİKLONLU-640",
      "HAVA FİLTRE -820",
      "HAVA FİLTRE ÇEVRE CONTASI",
      "HAVA FİLTRE GÖBEK LASTİĞİ",
      "HAVA YÖNELTME YAN SAC EMME",
      "HAVA YÖNELTME YAN SAC -EGZOST",
      "HAVA YÖNELTME BAĞLAMA ÇUBUĞU",
      "HAVALANDIRMA BORUSU KARTER",
      "İLK HAREKET KASNAĞI",
      "KAPLİN LASTİĞİ 6 DELİK KÜÇÜK",
      "KAPLİN LASTİĞİ 6 DELİK BÜYÜK",
      "KAPLİN LASTİĞİ 8 DELİK",
      "KAPLİN TAKIM YAĞMUR",
      "KAPLİN TAKIM MİSSAN",
      "KAPLİN ERKEK PANCAR TİPİ",
      "KARTER KOMPLE",
      "KARTER TAPA",
      "KRANK KEÇESİ GÖVDE 45*62*10",
      "KRANK KEÇESİ FLANŞ",
      "KRANK MİLİ -640 NET",
      "KRANK MİLİ -820",
      "KRANK MİLİ 665 - 2",
      "KRANK MİLİ 825 - 2",
      "KRANK MİLİ CİVATASI",
      "KRANK MİLİ KAMASI 4*7",
      "KRANK MİLİ TAPASI KÜÇÜK",
      "KRANK ANA YATAĞI GÖVDE STD.-SEMİ",
      "KRANK YATAĞI ÖN BURÇ STD-SEMİ",
      "KÜLBÜTÖR EMME",
      "KÜLBÜTÖR EMME DELİKLİ",
      "KÜLBÜTÖR EGZOST",
      "KÜLBÜTÖR GENLEŞME TAPASI",
      "KÜLBÜTÖR KAPAK",
      "KÜLBÜTÖR KAPAK DEKOMPRASYONLU",
      "KÜLBÜTÖR MİLİ YAĞLAMALI TİP.",
      "KÜLBÜTÖR YAĞLAMA BORUSU ÇELİK",
      "KÜLBÜTÖR YAĞLAMA CİVATASI",
      "KÜLBÜTÖR YAĞLAMA TAKIM KOMPLE",
      "MAKARA TAMİR TAKIMI",
      "MARŞ MOTORU NET",
      "MAZOT BORUSU 640-820",
      "MAZOT İADE BORUSU 640 -820",
      "MAZOT İADE BORUSU CİVATASI",
      "MAZOT DEPOSU 640",
      "MAZOT DEPOSU -820",
      "MAZOT DEPO ÇEMBERİ -820",
      "MAZOT DEPO TIKIRTI BURCU",
      "MAZOT FİLTRE ÇANAĞI CONTALI",
      "MAZOT POMPA ELEMANI 177-AE",
      "MAZOT POMPA VALF 174-C",
      "MOTOR AYAĞI",
      "MOTOR GÖVDESİ BLOK -820",
      "PİSTON -SEGMAN -STD-0,20-0,40 --820",
      "POMPA TAHRİK KOLU KOMPLE",
      "REGÜLATÖR KAMPANA",
      "SANTRAFÜJ FANI YAĞMUR",
      "SANTRAFÜJ KÖMÜRÜ YAĞMUR*519*",
      "SANTRAFÜJ MİLİ YAĞMUR",
      "SEGMAN STD-0,20-0,40 --820",
      "SİLİNDİR 820",
      "SİLİNDİR SAPLAMASI",
      "SUBAP AYAR VİDASI",
      "SUBAP TAKIM 640-820(STD-ETLİ)",
      "SUBAP İTİCİ ÇUBUK",
      "SUBAP İTİCİ MUHAFAZA BORUSU",
      "VOLAN",
      "VOLAN MUHAFAZA SACI 820",
      "YAĞ BASINÇ SUBABI KOMPLE",
      "YAĞ FİLTRESİ",
      "YAĞ POMPASI",
      "YAĞ ÇUBUĞU 820",
      "SOĞUK ÇALIŞTIRICI TAKIM"
    ];

    for (const name of productNames) {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç\s]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');

      const uniqueSlug = await generateUniqueSlug(baseSlug);

      const newProduct = {
        name,
        slug: uniqueSlug,
        price: 0,
        stock: 10,
        description: `${name} açıklaması burada yer alacak.`,
        category: category._id,
        images: [],
        metaTitle: name,
        metaDescription: `${name} açıklaması burada yer alacak.`,
        metaKeywords: name.toLowerCase().split(' '),
      };

      try {
        await Product.create(newProduct);
        console.log(`Ürün başarıyla eklendi: ${name}`);
      } catch (err) {
        console.error(`Ürün eklenirken hata oluştu: ${name} -> ${err.message}`);
      }
    }

    console.log('Veri ekleme işlemi tamamlandı.');
    process.exit(0);
  } catch (err) {
    console.error('Veri ekleme sırasında hata oluştu:', err.message);
    process.exit(1);
  }
};

// Bağlan ve Veri Ekle
connectDB().then(addData);
