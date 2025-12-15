import { db } from '../../db';
import { eq, and } from 'drizzle-orm';
import { stocks } from '../../db/schema/stocks';
import { products } from '../../db/schema/products';
import { warehouses } from '../../db/schema/warehouses';
import { InventoryItem } from '../../interfaces/inventory';


export class InventoryService {
    async addOrUpdateItem(data: InventoryItem) {
        try {
            // Check if product and warehouse exist
            const [product] = await db.select().from(products).where(eq(products.id, data.productId));
            const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, data.warehouseId));
            
            if (!product) throw new Error('Product not found');
            if (!warehouse) throw new Error('Warehouse not found');

            // Check if inventory item already exists
            const [existingItem] = await db
                .select()
                .from(stocks)
                .where(
                    and(
                        eq(stocks.productId, data.productId),
                        eq(stocks.warehouseId, data.warehouseId)
                    )
                );

            if (existingItem) {
                // Update existing item
                const [updatedItem] = await db
                    .update(stocks)
                    .set({
                        quantity: data.quantity,
                        updatedAt: new Date()
                    })
                    .where(eq(stocks.id, existingItem.id))
                    .returning();
                return updatedItem;
            } else {
                // Create new item
                const [newItem] = await db
                    .insert(stocks)
                    .values({
                        productId: data.productId,
                        warehouseId: data.warehouseId,
                        quantity: data.quantity
                    })
                    .returning();
                return newItem;
            }
        } catch (error: any) {
            if (error.code === '23503') {
                throw new Error('Product or Warehouse not found');
            }
            if (error.code === '23505') {
                throw new Error('Inventory item already exists');
            }
            throw error;
        }
    }

    async getInventoryByWarehouse(warehouseId: string) {
        try {
            const items = await db
                .select({
                    id: stocks.id,
                    productId: stocks.productId,
                    productName: products.name,
                    warehouseId: stocks.warehouseId,
                    quantity: stocks.quantity,
                    lastUpdated: stocks.updatedAt
                })
                .from(stocks)
                .where(eq(stocks.warehouseId, warehouseId))
                .leftJoin(products, eq(products.id, stocks.productId));
            
            return items;
        } catch (error: any) {
            throw new Error('Failed to fetch inventory');
        }
    }

    async getInventoryByProduct(productId: string) {
        try {
            const items = await db
                .select({
                    id: stocks.id,
                    productId: stocks.productId,
                    warehouseId: stocks.warehouseId,
                    warehouseName: warehouses.name,
                    quantity: stocks.quantity,
                    lastUpdated: stocks.updatedAt
                })
                .from(stocks)
                .where(eq(stocks.productId, productId))
                .leftJoin(warehouses, eq(warehouses.id, stocks.warehouseId));
            
            return items;
        } catch (error: any) {
            throw new Error('Failed to fetch inventory');
        }
    }

    async updateQuantity(itemId: string, quantity: number) {
        try {
            const [updatedItem] = await db
                .update(stocks)
                .set({
                    quantity,
                    updatedAt: new Date()
                })
                .where(eq(stocks.id, itemId))
                .returning();
            
            if (!updatedItem) {
                throw new Error('Inventory item not found');
            }
            
            return updatedItem;
        } catch (error: any) {
            throw new Error('Failed to update inventory quantity');
        }
    }

    async deleteItem(itemId: string) {
        try {
            const [deletedItem] = await db
                .delete(stocks)
                .where(eq(stocks.id, itemId))
                .returning();
            
            if (!deletedItem) {
                throw new Error('Inventory item not found');
            }
            
            return deletedItem;
        } catch (error: any) {
            throw new Error('Failed to delete inventory item');
        }
    }
}

export const inventoryService = new InventoryService();