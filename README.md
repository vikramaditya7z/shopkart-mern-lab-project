# ShopKart

ShopKart is a full-stack MERN (MongoDB, Express, React, Node.js) e-commerce web application developed across Labs 01–06. It features user authentication, a product catalog with live search and category filtering, a wishlist, an interactive shopping cart with live inventory stock tracking, and a checkout workflow integrated with Razorpay Test Mode payment verification and order tracking.

---

## Features

- **User Authentication & Profiles**: Secure customer registration and login using bcrypt password hashing and JWT (JSON Web Tokens) stored in HTTP-only cookies.
- **Product Catalog & Details**: Browse products with categories, prices, images, and live available stock counts.
- **Search & Filtering**: Search products by name and filter by product categories in real-time.
- **Wishlist**: Add and remove items from a persistent customer wishlist.
- **Shopping Cart**:
  - Add items to cart with real-time stock limits.
  - Increase, decrease, or remove items with automatic total calculation.
  - Client-side stock synchronization ensuring users cannot exceed available inventory.
- **Checkout & Shipping Address**:
  - Shipping address form with validation (full name, phone number, address, city, state, 6-digit pincode).
  - Server-side pre-payment stock and cart validation.
- **Razorpay Test Mode Payment**:
  - Server-side Razorpay order creation in Indian Rupees (INR paise).
  - Client-side Razorpay checkout modal integration.
  - Cryptographic backend verification of Razorpay HMAC SHA256 signature.
- **Order Management & History**:
  - Stores immutable product snapshots (name, price, quantity, image) within each order.
  - Orders listing page (`/orders`) showing payment status and delivery status badges.
  - Detailed order view (`/orders/:id`) with itemized breakdown, shipping destination, and Razorpay payment ID.
- **Inventory & Payment Synchronization**:
  - **Successful Payment**: Order marked `PAID` / `PLACED`, product stock reduced in MongoDB, and customer cart cleared.
  - **Failed Payment**: Order marked `FAILED` / `PENDING_PAYMENT`, stock remains untouched, and customer cart is preserved.

---

## Tech Stack

- **Frontend**:
  - React 19
  - Vite
  - React Router v7
  - Tailwind CSS
  - Axios
- **Backend**:
  - Node.js (ES Modules)
  - Express
  - MongoDB & Mongoose
  - JSON Web Tokens (`jsonwebtoken`)
  - `bcrypt`
  - `cookie-parser`
  - `cors`
  - `dotenv`
  - Razorpay Node SDK (`razorpay`)

---

## Project Structure

```
shopkart-mern-lab-project/
├── ShopKart/                     # Backend Server (Node.js & Express)
│   ├── controllers/             # Controller logic (cart, customer, order, product, wishlist)
│   ├── middlewares/             # Auth middleware (JWT verification)
│   ├── models/                  # Mongoose schemas (Customer, Order, Product)
│   ├── routes/                  # Express API route definitions
│   ├── utils/                   # Helper functions (JWT token generator)
│   ├── index.js                 # Server entry point & database connection
│   ├── package.json             # Backend dependencies and scripts
│   └── .env.example             # Backend environment template
├── ShopKartF/
│   └── ShopKart-Frontend/       # Frontend Application (React & Vite)
│       ├── public/              # Static assets
│       ├── src/
│       │   ├── assets/          # Images and icons
│       │   ├── components/      # Reusable components (Navbar, ProductCard, SearchBar)
│       │   ├── context/         # React Context (CartContext, WishlistContext)
│       │   ├── pages/           # Page views (Home, Login, Register, Products, ProductDetails, Wishlist, Cart, Checkout, Orders, OrderDetails, OrderSuccess)
│       │   ├── services/        # Axios API client instance
│       │   ├── App.jsx          # Route configuration
│       │   ├── main.jsx         # React DOM entry point
│       │   └── index.css        # Tailwind CSS styles
│       ├── index.html           # HTML template
│       ├── package.json         # Frontend dependencies and scripts
│       └── vite.config.js       # Vite configuration
├── .gitignore                   # Git ignore rules for root, backend, and frontend
├── .env.example                 # Root environment template
└── README.md                    # Project documentation
```

---

## Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas**: A free MongoDB Atlas cloud cluster (or a local MongoDB instance)
- **Razorpay Account**: A Razorpay account with access to Test Mode API keys

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vikramaditya7z/shopkart-mern-lab-project.git
   cd shopkart-mern-lab-project
   ```

2. **Install backend dependencies**:
   ```bash
   cd ShopKart
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../ShopKartF/ShopKart-Frontend
   npm install
   ```

---

## Environment Variables

The backend requires configuration variables for database connectivity, authentication, and Razorpay payment processing.

1. Navigate to the `ShopKart` backend directory:
   ```bash
   cd ShopKart
   ```

2. Create a `.env` file based on the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Fill in the values in `ShopKart/.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_test_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   ```

> **Security Note**: Never commit `.env` files to GitHub. The `.gitignore` file is configured to exclude all `.env` files from version control.

---

## MongoDB Setup

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g., M0 tier).
3. Under **Security > Database Access**, create a database user with read and write permissions.
4. Under **Security > Network Access**, add your current IP address (or `0.0.0.0/0` for development access).
5. Under **Deployments > Database**, click **Connect > Drivers > Node.js** to copy your connection string.
6. Replace `<password>` with your database user password and paste the URI into `ShopKart/.env` under `MONGO_URI`.

---

## Razorpay Test Mode

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** using the toggle in the header.
3. Navigate to **Account & Settings > API Keys** and click **Generate Test Key**.
4. Copy the **Key ID** and **Key Secret**.
5. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `ShopKart/.env`.

> **Note**: Test Mode does not process real transactions or real money. Razorpay provides mock payment cards, UPI IDs, and net banking options to test success and failure workflows.

---

## Running the Project

### 1. Start Backend Server

From the project root:
```bash
cd ShopKart
npm run dev
```
*Or using `npm start`.* The backend runs on **`http://localhost:8002`**.

### 2. Start Frontend Application

From a separate terminal in the project root:
```bash
cd ShopKartF/ShopKart-Frontend
npm run dev
```
The frontend application will start on **`http://localhost:5173`**.

---

## Testing Flow

You can manually verify all application flows with the following steps:

1. **Register & Login**: Open `http://localhost:5173/register`, create a customer account, and log in.
2. **Catalog & Search**: Navigate to `/products`, search for products by name, filter by category, and click on an item to view its details.
3. **Wishlist**: Click the wishlist button on product cards to add/remove items and verify on `/wishlist`.
4. **Cart Management**: Add items to the cart, navigate to `/cart`, and adjust quantities (observing that quantity cannot exceed available stock).
5. **Checkout**: Click **Proceed to Checkout**, fill in the 6-digit pincode and shipping details, and click **Pay with Razorpay**.
6. **Payment Verification**:
   - **Successful Payment**: In the Razorpay modal, select **Success**. The backend verifies the HMAC signature, updates order status to `PAID` / `PLACED`, deducts the purchased quantity from `Product.stock`, clears the cart, and redirects to `/order-success/:id`.
   - **Failed Payment**: In the Razorpay modal, select **Failure**. The payment status updates to `FAILED` with status `PENDING_PAYMENT`, inventory stock remains unchanged, and cart items remain intact.
7. **Order History**: Navigate to `/orders` to view all placed orders, and click **View Order Details** (`/orders/:id`) to inspect itemized snapshots and payment IDs.

---

## Important Security Notes

- **Secrets Isolation**: All secret keys (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `MONGO_URI`) reside exclusively on the server in `.env` and are never exposed to the client.
- **Server-Side Pricing**: Order total amounts are computed server-side directly from the database catalog prices.
- **Cryptographic Verification**: Payment confirmation relies on server-side HMAC SHA256 hash comparison (`razorpay_order_id + '|' + razorpay_payment_id`) against `RAZORPAY_KEY_SECRET`.
- **Protected Endpoints**: All cart, order, wishlist, and profile routes require valid JWT tokens verified by `authMiddleware`.
