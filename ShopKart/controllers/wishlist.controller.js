import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const isAlreadyInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyInWishlist) {
      return res.status(409).json({
        error: 'Product already in wishlist'
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

async function getWishlist(req, res) {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const productIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Product not in wishlist'
      });
    }

    customer.wishlist.splice(productIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
