import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { warehouses } from './warehouses';
import { users } from './users';


export const stockMovements = pgTable('stock_movements', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    quantity: integer('quantity').notNull(),
    fromWarehouseId: uuid('from_warehouse_id').references(() => warehouses.id),
    toWarehouseId: uuid('to_warehouse_id').references(() => warehouses.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});