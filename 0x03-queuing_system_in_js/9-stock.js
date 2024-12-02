#!/usr/bin/yarn dev
import express from 'express';
import { promisify } from 'util';
import { createClient } from 'redis';

// Define the list of products
const listProducts = [
  { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
  { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
  { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
  { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 },
];

// Find a product by its ID
const getItemById = (id) => {
  return listProducts.find((product) => product.itemId === id) || null;
};

// Initialize Redis client
const client = createClient();
const asyncGet = promisify(client.GET).bind(client);
const asyncSet = promisify(client.SET).bind(client);

// Reserve stock for a product
const reserveStockById = async (itemId, stock) => asyncSet(`item.${itemId}`, stock);

// Get the current reserved stock for a product
const getCurrentReservedStockById = async (itemId) => asyncGet(`item.${itemId}`);

// Express app setup
const app = express();
const PORT = 1245;

// Endpoint to list all products
app.get('/list_products', (_, res) => {
  res.json(listProducts);
});

// Endpoint to get details of a single product
app.get('/list_products/:itemId(\\d+)', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const product = getItemById(itemId);

  if (!product) {
    res.status(404).json({ status: 'Product not found' });
    return;
  }

  const reservedStock = parseInt(await getCurrentReservedStockById(itemId) || '0', 10);
  const currentQuantity = product.initialAvailableQuantity - reservedStock;

  res.json({ ...product, currentQuantity });
});

// Endpoint to reserve a product
app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const product = getItemById(itemId);

  if (!product) {
    res.status(404).json({ status: 'Product not found' });
    return;
  }

  const reservedStock = parseInt(await getCurrentReservedStockById(itemId) || '0', 10);
  
  if (reservedStock >= product.initialAvailableQuantity) {
    res.json({ status: 'Not enough stock available', itemId });
    return;
  }

  await reserveStockById(itemId, reservedStock + 1);
  res.json({ status: 'Reservation confirmed', itemId });
});

// Reset product stocks in Redis
const resetProductsStock = async () => {
  await Promise.all(
    listProducts.map((product) => asyncSet(`item.${product.itemId}`, 0))
  );
};

// Start the server
app.listen(PORT, async () => {
  await resetProductsStock();
  console.log(`API available on localhost port ${PORT}`);
});

export default app;
