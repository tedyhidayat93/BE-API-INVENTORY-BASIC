// stock-opname-items.ts
import { pgTable, uuid, integer, timestamp, text, decimal } from 'drizzle-orm/pg-core';
import { stockOpnames } from './stock-opnames';
import { products } from './products';
import { StockOpnameStatus } from './stock-opnames';

export const stockOpnameItems = pgTable('stock_opname_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Reference to stock opname header
    stockOpnameId: uuid('stock_opname_id')
        .references(() => stockOpnames.id, { onDelete: 'cascade' })
        .notNull(),
    
    // Reference to product
    productId: uuid('product_id')
        .references(() => products.id)
        .notNull(),
    
    // System quantity before opname
    systemQuantity: integer('system_quantity')
        .notNull()
        .default(0),
    
    // Physical count
    physicalQuantity: integer('physical_quantity')
        .notNull()
        .default(0),
    
    // Calculated difference (physical - system)
    difference: integer('difference')
        .notNull()
        .default(0),
    
    // Status of the item
    status: StockOpnameStatus('status')
        .notNull()
        .default('DRAFT'),
    
    // For audit trail
    adjustedAt: timestamp('adjusted_at'),
    adjustedBy: uuid('adjusted_by'),
    adjustmentNotes: text('adjustment_notes'),
    
    // Timestamps
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    
    // Additional metadata
    notes: text('notes'),
    
    // For batch/lot tracking if needed
    batchNumber: text('batch_number'),
    expiryDate: timestamp('expiry_date'),
});
