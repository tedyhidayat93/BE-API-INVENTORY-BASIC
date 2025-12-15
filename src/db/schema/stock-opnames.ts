// stock-opnames.ts
import { pgTable, uuid, timestamp, text, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { warehouses } from './warehouses';
import { users } from './users';

// Status enum for stock opname
export const StockOpnameStatus = pgEnum('stock_opname_status', [
    'DRAFT',        // Initial state
    'IN_PROGRESS',  // Counting in progress
    'COMPLETED',    // Successfully completed
    'CANCELLED',    // Cancelled
    'ADJUSTED'      // Stock adjustments applied
]);

export const stockOpnames = pgTable('stock_opnames', {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Reference to warehouse
    warehouseId: uuid('warehouse_id')
        .references(() => warehouses.id)
        .notNull(),
    
    // Status of the opname
    status: StockOpnameStatus('status')
        .notNull()
        .default('DRAFT'),
    
    // Date when the physical count was done
    countDate: timestamp('count_date')
        .notNull()
        .defaultNow(),
    
    // Reference to who created the opname
    createdBy: uuid('created_by')
        .references(() => users.id)
        .notNull(),
    
    // Reference to who adjusted the stock (if any)
    adjustedBy: uuid('adjusted_by')
        .references(() => users.id),
    
    // Timestamps
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),

    updatedBy: uuid('updated_by')
        .references(() => users.id),
    
    // Additional metadata
    notes: text('notes'),
    referenceNumber: varchar('reference_number', { length: 100 }),
    
    // For audit trail
    adjustmentNotes: text('adjustment_notes'),
    cancelledAt: timestamp('cancelled_at'),
    cancelledBy: uuid('cancelled_by')
        .references(() => users.id),
    completedAt: timestamp('completed_at'),
    completedBy: uuid('completed_by')
        .references(() => users.id),
});
