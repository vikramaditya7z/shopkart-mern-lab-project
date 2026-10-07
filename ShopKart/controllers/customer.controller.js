import bcrypt from 'bcrypt';
import Customer from '../models/customer.model.js';
import generateToken from '../utils/generateToken.js';


async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must contain at least 6 characters'
      });
    }

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    return res.status(500).json({
      error: 'Server error'
    });
  }
}


async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }


    const token = generateToken(customer._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}


async function getMyProfile(req, res) {
  try {
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}


function logoutCustomer(req, res) {
  res.clearCookie('token');

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}


export {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer
};