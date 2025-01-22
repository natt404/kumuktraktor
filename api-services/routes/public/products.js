const express = require("express");
const Product = require("../../models/Products");

const router = express.Router();
const baseUrl = process.env.BASE_URL || "http://localhost:5000"; // Backend'in temel URL'si

// Helper: Görsel URL formatlama
const formatImageURL = (doc) => {
  if (doc && doc.fileName) {
    return `${baseUrl}/uploads/${doc.fileName}`;
  } else if (doc && doc.url) {
    return doc.url;
  }
  return null;
};

// Helper: Ürünleri sorgu olarak döndür
const getProductWithImagesQuery = (query) => {
  return Product.find(query)
    .select("name slug price description images category")
    .populate("category", "name")
    .populate({
      path: "images",
      select: "fileName url",
      transform: formatImageURL,
    });
};

// Tüm ürünleri listele
router.get("/", async (req, res) => {
  try {
    const products = await getProductWithImagesQuery({});
    res.status(200).json(products);
  } catch (err) {
    console.error("Ürünleri getirirken hata:", err.message);
    res.status(500).json({ error: "Ürünler getirilemedi." });
  }
});

// Belirli bir ürünü slug ile getir
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await getProductWithImagesQuery({ slug });
    if (!product.length) {
      return res.status(404).json({ error: "Ürün bulunamadı." });
    }

    res.status(200).json(product[0]);
  } catch (err) {
    console.error("Slug ile ürün getirirken hata:", err.message);
    res.status(500).json({ error: "Ürün getirilemedi." });
  }
});

// Dinamik kategoriye göre ürünleri getir (featured)
router.get("/featured/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await getProductWithImagesQuery({ category: categoryId }).limit(4);

    if (!products.length) {
      return res.status(404).json({
        message: "Bu kategoriye ait ürün bulunamadı.",
      });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Kategoriye göre ürün getirirken hata:", err.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
