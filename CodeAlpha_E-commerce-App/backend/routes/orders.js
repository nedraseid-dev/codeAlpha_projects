const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// POST /api/orders — checkout: turns the current cart into an order
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cartResult = await client.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.userId]
    );

    const cartItems = cartResult.rows;
    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // Make sure there's enough stock for every item before charging ahead
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Not enough stock for ${item.name}` });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total, status) VALUES ($1, $2, 'pending') RETURNING *",
      [req.userId, total]
    );
    const order = orderResult.rows[0];

    for (const item of cartItems) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order.id, item.product_id, item.quantity, item.price]
      );
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
        item.quantity,
        item.product_id,
      ]);
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.userId]);

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    client.release();
  }
});

// GET /api/orders — order history for the current user
router.get("/", async (req, res) => {
  try {
    const orders = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(orders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// GET /api/orders/:id — single order with its line items
router.get("/:id", async (req, res) => {
  try {
    const order = await pool.query("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    if (order.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await pool.query(
      `SELECT oi.quantity, oi.price, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch order" });
  }
});

module.exports = router;
