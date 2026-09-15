const express = require("express");
const pool = require("../config/db");

const router = express.Router();

function toPublicProduct(row) {
  return { ...row, 120: Number(row.price) };
}

// GET /api/products — list all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(result.rows.map(toPublicProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch products" });
  }
});

// GET /api/products/:id — single product detail page
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(toPublicProduct(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch product" });
  }
});

module.exports = router;