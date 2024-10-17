const express = require('express');
const app = express();
app.use(express.json());
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const dbPath = path.join(__dirname, 'billing.db');
let db = null;
const connectToDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customer (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        contact TEXT NOT NULL,
        email TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        brand TEXT NOT NULL,
        supplier TEXT NOT NULL,
        category TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS billing (
        billing_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
        FOREIGN KEY (product_id) REFERENCES product (product_id)
      );
    `);

    // Start the server
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000');
    });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};
connectToDb();
const convertToCustomerResponse = (dbObject) => ({
  customerId: dbObject.customer_id,
  name: dbObject.name,
  gender: dbObject.gender,
  contact: dbObject.contact,
  email: dbObject.email,
});
const convertToProductResponse = (dbObject) => ({
  productId: dbObject.product_id,
  name: dbObject.name,
  price: dbObject.price,
  quantity: dbObject.quantity,
  brand: dbObject.brand,
  supplier: dbObject.supplier,
  category: dbObject.category,
});
const convertToBillingResponse = (dbObject) => ({
  billingId: dbObject.billing_id,
  customerId: dbObject.customer_id,
  productId: dbObject.product_id,
  quantity: dbObject.quantity,
  totalAmount: dbObject.total_amount,
});
// 1.Get all customers
app.get('/customers/', async (req, res) => {
  try {
    const customers = await db.all('SELECT * FROM customer;');
    res.send(customers.map(convertToCustomerResponse));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 2.Add a customer
app.post('/customers/', async (req, res) => {
  const { name, gender, contact, email } = req.body;

  if (!name || !gender || !contact || !email) {
    return res.status(400).send('All fields (name, gender, contact, email) are required');
  }

  try {
    const query = `
      INSERT INTO customer (name, gender, contact, email)
      VALUES (?, ?, ?, ?);
    `;
    await db.run(query, [name, gender, contact, email]);
    res.send('Customer Successfully Added');
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// 3.Get all products
app.get('/products/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM product;');
    res.send(products.map(convertToProductResponse));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// 4.Add a product
app.post('/products/', async (req, res) => {
  const { name, price, quantity, brand, supplier, category } = req.body;

  if (!name || !price || !quantity || !brand || !supplier || !category) {
    return res.status(400).send('All fields (name, price, quantity, brand, supplier, category) are required');
  }
  try {
    const query = `
      INSERT INTO product (name, price, quantity, brand, supplier, category)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    await db.run(query, [name, price, quantity, brand, supplier, category]);
    res.send('Product Successfully Added');
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// 5.Get all billings
app.get('/billing/', async (req, res) => {
  try {
    const billings = await db.all('SELECT * FROM billing;');
    res.send(billings.map(convertToBillingResponse));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// 6.Add a billing record
app.post('/billing/', async (req, res) => {
  const { customerId, productId, quantity} = req.body;

  if (!customerId || !productId || !quantity) {
    return res.status(400).send('customerId, productId, and quantity are required');
  }
  try {
    // Fetch the product price
    const product = await db.get('SELECT price FROM product WHERE product_id = ?;', [productId]);
    if (!product) {
      return res.status(400).send('Invalid productId');
    }
    const totalAmount = product.price * quantity;
    const query = `
      INSERT INTO billing (customer_id, product_id, quantity, total_amount)
      VALUES (?, ?, ?, ?);
    `;
    await db.run(query, [customerId, productId, quantity, totalAmount]);
    res.send('Billing Record Successfully Added');
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
app.get('/customers/search', async (req, res) => {
  const { name } = req.query;

  if (!name) {
      return res.status(400).send({ error: 'Name query parameter is required' });
  }

  try {
      const customers = await db.all('SELECT * FROM customer WHERE name LIKE ?;', [`%${name}%`]);
      res.send(customers);
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});

