const express = require('express');
const router = express.Router();

// MongoDB Modellerini Yükle
const Categories = require('../../models/Categories');
const Products = require('../../models/Products');

// SEO Bilgilerini Döndüren Endpoint
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // Kategori veya Ürün SEO Bilgilerini Bul
    const category = await Categories.findOne({ slug });
    if (category) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Ana Sayfa",
            "item": "https://www.siteniz.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category.name,
            "item": `https://www.siteniz.com/categories/${slug}`
          }
        ]
      };

      return res.json({
        title: category.name,
        description: `Tüm ${category.name} ürünlerini keşfedin.`,
        keywords: `${category.name}, yedek parça, motor`,
        schema: schemaData
      });
    }

    const product = await Products.findOne({ slug }).populate('images', 'url');
    if (product) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.images?.[0]?.url || '/images/default-product.jpg',
        "brand": product.brand || "Bilinmiyor",
        "sku": product._id,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
        }
      };

      return res.json({
        title: product.name,
        description: product.description,
        keywords: `${product.name}, ${product.category.name}, yedek parça`,
        image: product.images?.[0]?.url || '/images/default-product.jpg',
        schema: schemaData
      });
    }

    res.status(404).json({ message: 'SEO bilgisi bulunamadı.' });
  } catch (err) {
    console.error('Hata:', err.message);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

module.exports = router;
