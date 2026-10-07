import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  paymentFailed,
  getOrders,
  getOrderById
} from '../controllers/order.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.post('/payment-failed', authMiddleware, paymentFailed);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;
