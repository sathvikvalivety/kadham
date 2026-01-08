const EcoProduct = require("../models/EcoProduct");

async function listProducts(req, res) {
  const products = await EcoProduct.listEcoProducts();
  return res.json(products);
}

async function getProduct(req, res) {
  const { id } = req.params;
  const product = await EcoProduct.findEcoProductById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
}

module.exports = { listProducts, getProduct };
