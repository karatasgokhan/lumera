# Lumera - Jewelry E-Commerce and Inventory Management System

A modern e-commerce and inventory management platform developed for Lumera jewelry company, built with Nuxt 4 and Directus CMS.

## Features

- 🛍️ E-commerce platform
- 📦 Inventory tracking and management system
- 👤 Admin panel with sales tracking
- 🛒 Product management
- 📊 Daily and monthly reports
- 📱 Responsive design

## Technologies

- **Framework**: Nuxt 4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Directus
- **Package Manager**: npm

## Prerequisites

- **Node.js**: >=20.19.0 or >=22.12.0 (required for Nuxt 4)
- **npm**: >=10.0.0

⚠️ **Important**: Nuxt 4 requires Node.js >=20.19.0 or >=22.12.0. If you're using an older version, please update Node.js first.

### Updating Node.js

**Using nvm (recommended):**

```bash
nvm install 22
nvm use 22
```

**Using Homebrew:**

```bash
brew upgrade node
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure Directus URL in .env
NUXT_PUBLIC_DIRECTUS_URL=https://your-directus-url.com/

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lumera/
├── app/
│   ├── components/      # Vue components
│   │   ├── admin/      # Admin components
│   │   └── ui/         # UI components
│   ├── composables/    # Vue composables (useProducts, useSales, etc.)
│   ├── layouts/        # Layout components
│   ├── pages/          # File-based routing
│   │   └── admin/     # Admin pages
│   └── utils/         # Utility functions
├── server/
│   └── api/           # Server API routes
├── types/             # TypeScript type definitions
└── public/            # Static files
```

## Development

The project uses Nuxt 4 with Directus CMS integration. Make sure you have:

1. Directus instance running and accessible
2. Environment variables configured in `.env` file
3. Directus collections set up (products, categories, sales, sale_items, stock_movements)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Directus Collections

The following collections are required in Directus:

- `products` - Product catalog
- `categories` - Product categories
- `sales` - Sales records
- `sale_items` - Sale line items
- `stock_movements` - Stock movement tracking

## Environment Variables

```env
NUXT_PUBLIC_DIRECTUS_URL=https://your-directus-url.com/
```

## Branch

This redesign is on the `nuxt-redesign` branch. To switch:

```bash
git checkout nuxt-redesign
```
