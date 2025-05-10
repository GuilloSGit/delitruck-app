# Inventory & Sales Management App

A modern, responsive web application for managing products, inventory, clients, and sales orders. Built with Next.js, React, and Tailwind CSS.

## Features

- **Product Catalog**: View, search (with debounce), and filter products. Products are stored in a JSON file and displayed with images, prices, and stock levels.
- **Inventory Management**: Real-time inventory table with search and stock adjustment. Stock is updated automatically after sales.
- **Client Management**: Add, edit, and view clients, including GPS coordinates (selectable on a map or manually entered).
- **Sales Orders**: Create and manage sales orders. Each order can be printed or downloaded as a receipt/remito with the business name and customer information.
- **Business Name Customization**: The business name is loaded dynamically from a configuration file (`public/data/settings.json`) and used throughout the UI and receipts.
- **Responsive UI**: Built with Tailwind CSS, supporting dark mode and mobile-friendly layouts.

## Technical Stack

- **Framework**: Next.js (App Router, TypeScript)
- **UI**: React, Tailwind CSS, Lucide Icons
- **Data Storage**: JSON files (products, clients, settings)
- **API**: Custom Next.js API routes for reading/writing JSON data
- **Hooks**: Custom React hooks for debounce, business name, products, orders, etc.

## Directory Structure

```
app/
  catalog/         # Product catalog pages
  inventory/       # Inventory management
  orders/          # Orders and receipts
  api/             # API routes for products, orders, etc.
components/
  custom/          # Custom React components (tables, forms, receipts)
  ui/              # UI primitives (inputs, cards, badges, etc.)
hooks/             # Custom React hooks
public/
  data/            # JSON data files (products, clients, settings)
```

## Usage

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
3. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- **Business Name**: Change the value in `public/data/settings.json` under the `businessName` key to update the name globally.
- **Products/Clients**: Edit `public/data/products.json` and `public/data/clients.json` to manage your initial data.

## Notable Design Decisions

- All UI text and business name are theme-aware and respond to light/dark mode.
- The product image display uses cropping to ensure uniform 80x80px thumbnails.
- All search fields use a debounce hook for performance and a smooth user experience.
- Receipts and remitos include the business name and customer, and can be printed or downloaded as PNG images.

## Next Steps / TODO
- Add product editing and deletion.
- Add more validations to forms.
- Add user authentication (optional).
- Improve error handling and notifications.

---

**Author:** Marcos (customizable)

---

Feel free to fork, modify, and use this project for your own business needs!