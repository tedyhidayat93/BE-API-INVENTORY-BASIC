import { pgTable, uuid, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { products } from './products';
import { warehouses } from './warehouses';


export const stocks = pgTable('stocks', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
    quantity: integer('quantity').default(0).notNull(),
    updatedAt: timestamp('updated_at').defaultNow()
    }, (t) => ({
    uniq: unique().on(t.productId, t.warehouseId)
}));