import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/order.model.js';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

async function createPaymentOrder(req, res) {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        error: 'Shipping address is required'
      });
    }

    const fullName = shippingAddress.fullName?.trim();
    const phone = shippingAddress.phone?.trim();
    const addressLine = (shippingAddress.addressLine || shippingAddress.address)?.trim();
    const city = shippingAddress.city?.trim();
    const state = shippingAddress.state?.trim();
    const pincode = shippingAddress.pincode?.trim();

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({
        error: 'All shipping address fields are required'
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        error: 'Please enter a valid phone number'
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        error: 'Pincode must contain exactly 6 digits'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        error: 'Your cart is empty'
      });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          error: 'One or more products in your cart are no longer available'
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const order = new Order({
      customer: customer._id,
      items,
      shippingAddress: {
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode
      },
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `order_${order._id}`
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to create payment order'
    });
  }
}

async function verifyPayment(req, res) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'Missing payment verification details'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order.razorpayOrderId + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = product.stock - item.quantity;
        await product.save();
      }
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to verify payment'
    });
  }
}

async function paymentFailed(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (order.paymentStatus === 'PENDING') {
      order.paymentStatus = 'FAILED';
      await order.save();
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update payment status'
    });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch orders'
    });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch order details'
    });
  }
}

export {
  createPaymentOrder,
  verifyPayment,
  paymentFailed,
  getOrders,
  getOrderById
};
