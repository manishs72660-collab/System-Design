const pool = require('../config/db');

const COLS = 'id, name, category_id, brand, price, rating, stock, created_at';

const getPaging = (query) => {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '20', 10), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

// 1 + 2: list, pagination, filter, sort
exports.getProducts = async (req, res) => {
  try {
    const { page, limit, offset } = getPaging(req.query);
    const { category, brand, minPrice, maxPrice, minRating, sort } = req.query;

    const where = [];
    const params = [];

    if (category) {
      params.push(parseInt(category, 10));
      where.push(`category_id = $${params.length}`);
    }
    if (brand) {
      params.push(brand);
      where.push(`brand = $${params.length}`);
    }
    if (minPrice) {
      params.push(parseFloat(minPrice));
      where.push(`price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      where.push(`price <= $${params.length}`);
    }
    if (minRating) {
      params.push(parseFloat(minRating));
      where.push(`rating >= $${params.length}`);
    }

    const sortMap = {
      price: 'price ASC',
      price_desc: 'price DESC',
      rating: 'rating DESC',
      newest: 'created_at DESC',
    };
    const orderBy = sortMap[sort] || 'id ASC';
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    params.push(limit, offset);
    const sql = `
      SELECT ${COLS}
      FROM products
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await pool.query(sql, params);
    res.json({ page, limit, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 3: search (baseline: ILIKE, baad me full-text se optimize)
exports.searchProducts = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q is required' });

    const { page, limit, offset } = getPaging(req.query);

    const { rows } = await pool.query(
      `SELECT ${COLS}
       FROM products
       WHERE name ILIKE $1 OR description ILIKE $1
       ORDER BY id
       LIMIT $2 OFFSET $3`,
      [`%${q}%`, limit, offset]
    );

    res.json({ page, limit, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 4: get by id
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 5: create
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category_id, brand, price, rating, stock } = req.body;

    if (!name || !category_id || !brand || price == null || rating == null) {
      return res.status(400).json({ error: 'name, category_id, brand, price, rating required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, description, category_id, brand, price, rating, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || null, category_id, brand, price, rating, stock || 0]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};