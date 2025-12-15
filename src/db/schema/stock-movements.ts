import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { warehouses } from './warehouses';
import { users } from './users';
import { stockOpnames } from './stock-opnames';


export const stockMovements = pgTable('stock_movements', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    quantity: integer('quantity').notNull(),
    fromWarehouseId: uuid('from_warehouse_id').references(() => warehouses.id),
    toWarehouseId: uuid('to_warehouse_id').references(() => warehouses.id),
    notes: varchar('notes'),
    referenceId: uuid('reference_id')
    .references(
        () => stockOpnames.id,
        { onDelete: 'set null' }  // or 'cascade' if you want to delete related records
    )
    .$type<string | null>(), 
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});