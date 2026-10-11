# 🛒 বাজার দর — BazarDor

**প্রয়োজনীয় পণ্যের দাম এক নজরে।**

BazarDor is a Bangla-first web application that helps users explore the prices of everyday essentials in Bangladesh. Users can browse products, filter by category, compare prices, and view product details.

## 🌐 Project Links

* **Live Website:** https://deft-pastelito-68f251.netlify.app
* **GitHub Repository:** https://github.com/subaita512/bazardor

## ✨ Key Features

1. **Homepage and Price Ticker:** Browse everyday products and view price changes.
2. **Product Categories:** Filter products by category and sort them by price.
3. **Product Details:** View individual product information and available price comparisons.
4. **Authentication:** Register and sign in using email and password with Better Auth.
5. **Profile Management:** View profile information and update the user's name.
6. **Responsive Design:** Layout designed for mobile, tablet, and desktop screens.
7. **Bengali Interface:** Bangla product information and Bengali price formatting.

## 🛠️ Technologies Used

* Next.js with App Router
* React
* TypeScript
* Tailwind CSS
* Better Auth
* REST API
* Git and GitHub
* Netlify for deployment

## 📡 API

The application uses the BazarDor API to retrieve product and category information.

Base API URL:

`https://api.api-store.workers.dev/api/bazardor`

Available endpoints include:

* `/products` — retrieve products
* `/products?category=chal` — filter products by category
* `/products/1` — retrieve a product by ID
* `/categories` — retrieve categories
* `/categories/chal` — retrieve a specific category

## 🚀 Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/subaita512/bazardor.git
   ```

2. Open the project folder:

   ```bash
   cd bazardor
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure the environment variables required by Better Auth and any other services used by the project in `.env.local`. Never commit secret keys to GitHub.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000.

## 📱 Responsive Design

BazarDor uses responsive layouts to support different screen sizes and devices.

## ⚠️ Disclaimer

Displayed prices are indicative and may change depending on market conditions.


