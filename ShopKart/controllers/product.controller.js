import mongoose from 'mongoose';
import Product from '../models/product.model.js';

async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        error: 'Price must be greater than 0'
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        error: 'Stock must be 0 or greater'
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      stock: Number(stock)
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || 'Failed to create product'
    });
  }
}

async function getAllProducts(req, res) {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All Categories' && category !== 'All') {
      query.category = category;
    }

    const products = await Product.find(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export {
  createProduct,
  getAllProducts,
  getProductById
};
