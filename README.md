# Lumera - Jewelry E-Commerce and Inventory Management System

A modern e-commerce and inventory management platform developed for Lumera jewelry company.

## Features

- 🛍️ E-commerce platform
- 📦 Inventory tracking and management system
- 👤 User management and authentication
- 🛒 Shopping cart and order management
- 📊 Admin panel
- 📱 Responsive design

## Technologies

- **Frontend/Backend**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Package Manager**: npm

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lumera/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # Shadcn UI components
├── lib/             # Utility functions and helpers
├── types/           # TypeScript type definitions
├── public/          # Static files
└── styles/          # CSS files
```

## Development

The project is currently under active development.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Adding Shadcn UI Components

To add Shadcn UI components to your project:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

