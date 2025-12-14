import { pgTable, uuid, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    price: numeric('price', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});