import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  settings,
} from './schema';

const url =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:password@localhost:5432/odyssey_restaurant';

async function main() {
  console.log('Seeding database…');
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  // Settings
  await db
    .insert(settings)
    .values([
      { key: 'restaurant_name', value: 'Odyssey Kitchen' },
      { key: 'auto_accept_orders', value: 'false' },
      { key: 'default_prep_time_minutes', value: '20' },
      { key: 'service_available', value: 'true' },
      { key: 'opening_hours_mon', value: '11:00-22:00' },
      { key: 'opening_hours_tue', value: '11:00-22:00' },
      { key: 'opening_hours_wed', value: '11:00-22:00' },
      { key: 'opening_hours_thu', value: '11:00-22:00' },
      { key: 'opening_hours_fri', value: '11:00-23:00' },
      { key: 'opening_hours_sat', value: '10:00-23:00' },
      { key: 'opening_hours_sun', value: '10:00-21:00' },
    ])
    .onConflictDoNothing();

  // Menu categories
  const [starters, mains, desserts, drinks, sides] = await db
    .insert(menuCategories)
    .values([
      { name: 'Starters', description: 'Begin your experience', sortOrder: 1 },
      { name: 'Mains', description: 'Signature dishes', sortOrder: 2 },
      { name: 'Desserts', description: 'Sweet endings', sortOrder: 3 },
      { name: 'Drinks', description: 'Curated beverages', sortOrder: 4 },
      { name: 'Sides', description: 'Perfect accompaniments', sortOrder: 5 },
    ])
    .returning();

  if (!starters || !mains || !desserts || !drinks || !sides) throw new Error('Category insert failed');

  // Menu items (prices in cents)
  const insertedItems = await db
    .insert(menuItems)
    .values([
      // Starters
      { categoryId: starters.id, name: 'Burrata & Heirloom Tomatoes', description: 'Fresh burrata with heirloom tomatoes, basil oil, and sea salt', price: 1600, prepTimeMinutes: 8 },
      { categoryId: starters.id, name: 'Crispy Calamari', description: 'Lightly breaded calamari with lemon aioli and smoked paprika', price: 1400, prepTimeMinutes: 10 },
      { categoryId: starters.id, name: 'French Onion Soup', description: 'Classic soupe à l\'oignon with gruyère crostini', price: 1200, prepTimeMinutes: 12 },
      // Mains
      { categoryId: mains.id, name: 'Wagyu Beef Burger', description: 'Wagyu patty, aged cheddar, caramelised onion, brioche bun', price: 2400, prepTimeMinutes: 18 },
      { categoryId: mains.id, name: 'Pan-Seared Salmon', description: 'Atlantic salmon, lemon butter, asparagus, wild rice', price: 2800, prepTimeMinutes: 20 },
      { categoryId: mains.id, name: 'Truffle Tagliatelle', description: 'House-made pasta, black truffle, parmesan, chives', price: 2200, prepTimeMinutes: 15 },
      { categoryId: mains.id, name: '8oz Sirloin Steak', description: 'Prime sirloin, herb butter, peppercorn jus, fries', price: 3800, prepTimeMinutes: 22 },
      { categoryId: mains.id, name: 'Roasted Half Chicken', description: 'Free-range chicken, rosemary, preserved lemon, roasted vegetables', price: 2600, prepTimeMinutes: 25 },
      // Desserts
      { categoryId: desserts.id, name: 'Vanilla Crème Brûlée', description: 'Classic crème brûlée with Tahitian vanilla', price: 900, prepTimeMinutes: 8 },
      { categoryId: desserts.id, name: 'Chocolate Fondant', description: 'Warm chocolate fondant, vanilla ice cream, caramel sauce', price: 1100, prepTimeMinutes: 14 },
      { categoryId: desserts.id, name: 'Lemon Tart', description: 'Butter pastry, lemon curd, Italian meringue', price: 950, prepTimeMinutes: 5 },
      // Drinks
      { categoryId: drinks.id, name: 'House Red Wine', description: 'Côtes du Rhône, 175ml', price: 800, prepTimeMinutes: 2 },
      { categoryId: drinks.id, name: 'House White Wine', description: 'Pouilly-Fumé, 175ml', price: 900, prepTimeMinutes: 2 },
      { categoryId: drinks.id, name: 'Sparkling Water', description: 'Acqua Panna 500ml', price: 400, prepTimeMinutes: 1 },
      { categoryId: drinks.id, name: 'Espresso Martini', description: 'Vodka, Kahlúa, fresh espresso', price: 1400, prepTimeMinutes: 4 },
      // Sides
      { categoryId: sides.id, name: 'Truffle Fries', description: 'Hand-cut fries, truffle oil, parmesan, herbs', price: 800, prepTimeMinutes: 10 },
      { categoryId: sides.id, name: 'Seasonal Greens', description: 'Wilted greens, garlic, lemon, chilli', price: 700, prepTimeMinutes: 8 },
    ])
    .returning();

  // Customers
  const insertedCustomers = await db
    .insert(customers)
    .values([
      { name: 'Alice Martin', email: 'alice.martin@example.com', phone: '+1 617 555 0101' },
      { name: 'Ben Clarke', email: 'ben.clarke@example.com', phone: '+1 617 555 0102' },
      { name: 'Chloe Nguyen', email: 'chloe.nguyen@example.com', phone: '+1 617 555 0103' },
      { name: 'David Park', email: 'david.park@example.com', phone: '+1 617 555 0104' },
      { name: 'Elena Vasquez', email: 'elena.vasquez@example.com', phone: '+1 617 555 0105' },
      { name: 'Finn Okafor', email: 'finn.okafor@example.com', phone: '+1 617 555 0106' },
      { name: 'Grace Kim', email: 'grace.kim@example.com', phone: '+1 617 555 0107' },
    ])
    .returning();

  // Helper to get items by index safely
  const item = (i: number) => {
    const it = insertedItems[i];
    if (!it) throw new Error(`No item at index ${i}`);
    return it;
  };
  const customer = (i: number) => {
    const c = insertedCustomers[i];
    if (!c) throw new Error(`No customer at index ${i}`);
    return c;
  };

  // Orders with different statuses
  const ordersData = [
    { customerId: customer(0).id, status: 'completed' as const, items: [{ menuItem: item(3), qty: 1 }, { menuItem: item(15), qty: 1 }, { menuItem: item(12), qty: 2 }] },
    { customerId: customer(1).id, status: 'completed' as const, items: [{ menuItem: item(4), qty: 1 }, { menuItem: item(1), qty: 1 }, { menuItem: item(13), qty: 1 }] },
    { customerId: customer(2).id, status: 'preparing' as const, items: [{ menuItem: item(5), qty: 2 }, { menuItem: item(16), qty: 1 }] },
    { customerId: customer(3).id, status: 'confirmed' as const, items: [{ menuItem: item(6), qty: 1 }, { menuItem: item(15), qty: 1 }, { menuItem: item(9), qty: 1 }] },
    { customerId: customer(4).id, status: 'pending' as const, items: [{ menuItem: item(7), qty: 1 }, { menuItem: item(0), qty: 1 }] },
    { customerId: customer(5).id, status: 'ready' as const, items: [{ menuItem: item(3), qty: 2 }, { menuItem: item(15), qty: 2 }] },
    { customerId: customer(6).id, status: 'completed' as const, items: [{ menuItem: item(4), qty: 1 }, { menuItem: item(8), qty: 1 }, { menuItem: item(11), qty: 1 }] },
    { customerId: customer(0).id, status: 'completed' as const, items: [{ menuItem: item(5), qty: 1 }, { menuItem: item(14), qty: 2 }] },
    { customerId: customer(1).id, status: 'cancelled' as const, items: [{ menuItem: item(6), qty: 1 }] },
    { customerId: customer(2).id, status: 'pending' as const, items: [{ menuItem: item(0), qty: 1 }, { menuItem: item(2), qty: 1 }, { menuItem: item(13), qty: 2 }] },
  ];

  for (const orderData of ordersData) {
    const subtotal = orderData.items.reduce(
      (sum, { menuItem, qty }) => sum + menuItem.price * qty,
      0,
    );
    const total = subtotal; // No additional fees in demo

    const [order] = await db
      .insert(orders)
      .values({
        customerId: orderData.customerId,
        status: orderData.status,
        subtotal,
        total,
      })
      .returning();

    if (!order) throw new Error('Order insert failed');

    await db.insert(orderItems).values(
      orderData.items.map(({ menuItem, qty }) => ({
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity: qty,
        unitPrice: menuItem.price,
        subtotal: menuItem.price * qty,
      })),
    );
  }

  console.log('Seed complete ✓');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
