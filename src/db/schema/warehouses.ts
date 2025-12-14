import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const warehouses = pgTable('warehouses', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    location: varchar('location', { length: 150 }),
    createdAt: timestamp('created_at').defaultNow()
});