import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

async function addToCart(req, res) {
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

    if (product.stock <= 0) {
      return res.status(400).json({
        error: 'Product is out of stock'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      if (customer.cart[itemIndex].quantity + 1 > product.stock) {
        return res.status(400).json({
          error: 'Cannot add more items than available in stock'
        });
      }
      customer.cart[itemIndex].quantity += 1;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await customer.save();
    await customer.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: customer.cart
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

async function getCart(req, res) {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      cart: customer.cart
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

async function updateCartQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const qty = Number(quantity);
    if (quantity === undefined || isNaN(qty) || qty < 1) {
      return res.status(400).json({
        error: 'Quantity must be a number greater than or equal to 1'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        error: 'Requested quantity exceeds available stock'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Product not found in cart'
      });
    }

    customer.cart[itemIndex].quantity = qty;
    await customer.save();
    await customer.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: customer.cart
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

async function removeFromCart(req, res) {
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

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Product not in cart'
      });
    }

    customer.cart.splice(itemIndex, 1);
    await customer.save();
    await customer.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: customer.cart
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
