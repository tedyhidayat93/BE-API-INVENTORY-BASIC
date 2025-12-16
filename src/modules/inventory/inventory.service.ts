import { db } from '../../db';
import { sql, inArray, or, and, eq, gte, lte, desc, asc } from 'drizzle-orm';
import { stocks } from '../../db/schema/stocks';
import { products } from '../../db/schema/products';
import { warehouses } from '../../db/schema/warehouses';
import { stockMovements } from '../../db/schema/stock-movements';
import { StockMovementInput, InventoryItem, StockOpnameStatus } from '../../interfaces/inventory';
import { StockMovementType, StockOpname, StockOpnameInput, StockOpnameItemInput } from '../../interfaces/inventory';
import { stockOpnames } from '../../db/schema/stock-opnames';
import { stockOpnameItems } from '../../db/schema/stock-opname-items';

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
                    productUnitPrice: products.price,
                    warehouseId: stocks.warehouseId,
                    warehouseName: warehouses.name,
                    totalPrice: sql<number>`${products.price} * ${stocks.quantity}`,
                    quantity: stocks.quantity,
                    lastUpdated: stocks.updatedAt
                })
                .from(stocks)
                .where(eq(stocks.warehouseId, warehouseId))
                .leftJoin(products, eq(products.id, stocks.productId))
                .leftJoin(warehouses, eq(warehouses.id, stocks.warehouseId))
            
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

    async getStockMovements(filters: {
        productId?: string;
        warehouseId?: string;
        type?: StockMovementType;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        const { 
            productId, 
            warehouseId, 
            type, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 20 
        } = filters;

        const offset = (page - 1) * limit;

        const conditions = [];
        if (productId) conditions.push(eq(stockMovements.productId, productId));
        if (warehouseId) {
            conditions.push(
                or(
                    eq(stockMovements.fromWarehouseId, warehouseId),
                    eq(stockMovements.toWarehouseId, warehouseId)
                )
            );
        }
        if (type) conditions.push(eq(stockMovements.type, type));
        if (startDate) conditions.push(gte(stockMovements.createdAt, startDate));
        if (endDate) {
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            conditions.push(lte(stockMovements.createdAt, nextDay));
        }

        const [items, total] = await Promise.all([
            db
                .select()
                .from(stockMovements)
                .where(and(...conditions))
                .orderBy(desc(stockMovements.createdAt))
                .limit(limit)
                .offset(offset),
            
            db
                .select({ count: sql<number>`count(*)` })
                .from(stockMovements)
                .where(and(...conditions))
                .then(res => Number(res[0]?.count || 0))
        ]);

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getStockMovementById(id: string) {
        const [movement] = await db
            .select()
            .from(stockMovements)
            .where(eq(stockMovements.id, id))
            .limit(1);

        if (!movement) {
            throw new Error('Stock movement not found');
        }

        return movement;
    }

    // async createStockMovement(data: StockMovementInput) {
    //     try {
    //         const [movement] = await db
    //             .insert(stockMovements)
    //             .values(data)
    //             .returning();
            
    //         return movement;
    //     } catch (error: any) {
    //         throw new Error('Failed to create stock movement');
    //     }
    // }

    async createStockMovement(data: StockMovementInput) {
        // Start a database transaction
        return db.transaction(async (tx) => {
            try {
                // Validate movement type specific requirements
                switch (data.type) {
                    case 'TRANSFER':
                        if (!data.fromWarehouseId || !data.toWarehouseId) {
                            throw new Error('Source and destination warehouses are required for transfer');
                        }
                        if (data.fromWarehouseId === data.toWarehouseId) {
                            throw new Error('Source and destination warehouses must be different');
                        }
                        break;

                    case 'IN':
                        if (!data.toWarehouseId) {
                            throw new Error('Destination warehouse is required for IN movement');
                        }
                        break;

                    case 'OUT':
                        if (!data.fromWarehouseId) {
                            throw new Error('Source warehouse is required for OUT movement');
                        }
                        break;

                    case 'ADJUSTMENT':
                        if (!data.fromWarehouseId && !data.toWarehouseId) {
                            throw new Error('Either source or destination warehouse is required for adjustment');
                        }
                        break;
                }

                // Handle stock updates based on movement type
                if (data.type === 'TRANSFER' || data.type === 'OUT') {
                    // Check source stock
                    const sourceStock = await tx.query.stocks.findFirst({
                        where: (stocks, { and, eq }) => 
                            and(
                                eq(stocks.productId, data.productId),
                                eq(stocks.warehouseId, data.fromWarehouseId!)
                            )
                    });

                    if (!sourceStock || sourceStock.quantity < data.quantity) {
                        throw new Error('Insufficient stock in source warehouse');
                    }

                    // Update source stock (decrease)
                    await tx
                        .update(stocks)
                        .set({ 
                            quantity: sourceStock.quantity - data.quantity,
                            updatedAt: new Date()
                        })
                        .where(and(
                            eq(stocks.productId, data.productId),
                            eq(stocks.warehouseId, data.fromWarehouseId!)
                        ));
                }

                if (data.type === 'TRANSFER' || data.type === 'IN') {
                    const warehouseId = data.type === 'TRANSFER' ? data.toWarehouseId : data.toWarehouseId;
                    
                    // Check if stock record exists
                    const targetStock = await tx.query.stocks.findFirst({
                        where: (stocks, { and, eq }) => 
                            and(
                                eq(stocks.productId, data.productId),
                                eq(stocks.warehouseId, warehouseId!)
                            )
                    });

                    if (targetStock) {
                        // Update existing stock
                        await tx
                            .update(stocks)
                            .set({ 
                                quantity: targetStock.quantity + data.quantity,
                                updatedAt: new Date()
                            })
                            .where(and(
                                eq(stocks.productId, data.productId),
                                eq(stocks.warehouseId, warehouseId!)
                            ));
                    } else {
                        // Create new stock record if it doesn't exist
                        await tx.insert(stocks).values({
                            productId: data.productId,
                            warehouseId: warehouseId!,
                            quantity: data.quantity
                        });
                    }
                }

                // Create the movement record
                const [movement] = await tx
                    .insert(stockMovements)
                    .values({
                        ...data,
                        createdAt: new Date()
                    })
                    .returning();

                return movement;

            } catch (error: any) {
                throw new Error(`Failed to create stock movement: ${error.message}`);
            }
        });
    }

    async updateStockMovement(id: string, data: StockMovementInput) {
        try {
            const [movement] = await db
                .update(stockMovements)
                .set(data)
                .where(eq(stockMovements.id, id))
                .returning();
            
            return movement;
        } catch (error: any) {
            throw new Error('Failed to update stock movement');
        }
    }

    async deleteStockMovement(id: string) {
        try {
            const [movement] = await db
                .delete(stockMovements)
                .where(eq(stockMovements.id, id))
                .returning();
            
            return movement;
        } catch (error: any) {
            throw new Error('Failed to delete stock movement');
        }
    }

    private generateReferenceNumber(prefix: string = 'OP'): string {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        return `${prefix}${year}${month}${random}`;
    }

    async getStockOpnames(filters: {
        warehouseId?: string;
        status?: StockOpnameStatus;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        const { 
            warehouseId, 
            status, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 20 
        } = filters;

        const offset = (page - 1) * limit;

        const conditions = [];
        if (warehouseId) conditions.push(eq(stockOpnames.warehouseId, warehouseId));
        if (status) conditions.push(eq(stockOpnames.status, status));
        if (startDate) conditions.push(gte(stockOpnames.countDate, startDate));
        if (endDate) {
            const nextDay = new Date(endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            conditions.push(lte(stockOpnames.countDate, nextDay));
        }

        const [items, total] = await Promise.all([
            db
                .select()
                .from(stockOpnames)
                .where(and(...conditions))
                .orderBy(desc(stockOpnames.countDate))
                .limit(limit)
                .offset(offset),
            
            db
                .select({ count: sql<number>`count(*)` })
                .from(stockOpnames)
                .where(and(...conditions))
                .then(res => Number(res[0]?.count || 0))
        ]);

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getStockOpnameById(id: string) {
        const [opname] = await db
            .select()
            .from(stockOpnames)
            .where(eq(stockOpnames.id, id))
            .limit(1);

        if (!opname) {
            throw new Error('Stock opname not found');
        }

        const items = await db
            .select()
            .from(stockOpnameItems)
            .where(eq(stockOpnameItems.stockOpnameId, id));

        return {
            ...opname,
            items
        };
    }

    async updateStockOpnameStatus(id: string, status: StockOpnameStatus, updatedBy: string) {
        const [opname] = await db
            .update(stockOpnames)
            .set({
                status,
                updatedAt: new Date(),
                updatedBy
            })
            .where(eq(stockOpnames.id, id))
            .returning();

        if (!opname) {
            throw new Error('Stock opname not found');
        }

        return opname;
    }

    async processStockOpname(id: string, userId: string) {
        return db.transaction(async (tx) => {
            // Get the opname with items
            const opname = await tx
                .select()
                .from(stockOpnames)
                .where(
                    and(
                        eq(stockOpnames.id, id),
                        eq(stockOpnames.status, 'COMPLETED') // Only process completed opnames
                    )
                )
                .limit(1)
                .then(res => res[0]);

            if (!opname) {
                throw new Error('Stock opname not found or not in COMPLETED status');
            }

            const items = await tx
                .select()
                .from(stockOpnameItems)
                .where(eq(stockOpnameItems.stockOpnameId, id));

            // Process each item
            for (const item of items) {
                const difference = item.physicalQuantity - item.systemQuantity;
                
                if (difference !== 0) {
                    const movementType = difference > 0 
                        ? 'adjustment_in' 
                        : 'adjustment_out';

                    await tx.insert(stockMovements).values({
                        productId: item.productId,
                        type: movementType,
                        quantity: Math.abs(difference),
                        fromWarehouseId: movementType === 'adjustment_out' ? opname.warehouseId : undefined,
                        toWarehouseId: movementType === 'adjustment_in' ? opname.warehouseId : undefined,
                        referenceId: opname.id,
                        notes: `Stock opname adjustment - ${item.notes || ''}`.trim(),
                        createdBy: userId
                    });

                    // Update stock level
                    if (movementType === 'adjustment_in') {
                        await tx
                            .insert(stocks)
                            .values({
                                productId: item.productId,
                                warehouseId: opname.warehouseId,
                                quantity: difference,
                                updatedAt: new Date()
                            })
                            .onConflictDoUpdate({
                                target: [stocks.productId, stocks.warehouseId],
                                set: {
                                    quantity: sql`${stocks.quantity} + ${difference}`,
                                    updatedAt: new Date()
                                }
                            });
                    } else {
                        await tx
                            .update(stocks)
                            .set({
                                quantity: sql`${stocks.quantity} - ${Math.abs(difference)}`,
                                updatedAt: new Date()
                            })
                            .where(
                                and(
                                    eq(stocks.productId, item.productId),
                                    eq(stocks.warehouseId, opname.warehouseId)
                                )
                            );
                    }
                }
            }

            // Update opname status to ADJUSTED
            const [updatedOpname] = await tx
                .update(stockOpnames)
                .set({
                    status: 'ADJUSTED',
                    updatedAt: new Date(),
                    updatedBy: userId
                })
                .where(eq(stockOpnames.id, id))
                .returning();

            return updatedOpname;
        });
    }

    async createStockOpname(data: StockOpnameInput) {
        return db.transaction(async (tx) => {
            try {
                // Generate reference number
                const referenceNumber = this.generateReferenceNumber('OP');
                
                // Create stock opname header
                const [opname] = await tx
                    .insert(stockOpnames)
                    .values({
                        warehouseId: data.warehouseId,
                        countDate: data.countDate,
                        referenceNumber,
                        status: 'DRAFT',
                        notes: data.notes,
                        createdBy: data.createdBy
                    })
                    .returning();

                if (!opname) {
                   throw new Error('Failed to create stock opname');
                }

                // Process each item
                const opnameItems = await Promise.all(
                    data.items.map(async (item) => {
                        // Get current system quantity
                        const [stock] = await tx
                            .select()
                            .from(stocks)
                            .where(
                                and(
                                    eq(stocks.productId, item.productId),
                                    eq(stocks.warehouseId, data.warehouseId)
                                )
                            )
                            .limit(1);

                        const systemQuantity = stock?.quantity || 0;
                        const difference = item.physicalQuantity - systemQuantity;

                        const [opnameItem] = await tx
                            .insert(stockOpnameItems)
                            .values({
                                stockOpnameId: opname.id || '',
                                productId: item.productId,
                                systemQuantity,
                                physicalQuantity: item.physicalQuantity,
                                difference,
                                notes: item.notes
                            })
                            .returning();

                        return opnameItem;
                    })
                );

                return {
                    ...opname,
                    items: opnameItems
                };
            } catch (error) {
                await tx.rollback();
                throw error;
            }
        });
    }
}

export const inventoryService = new InventoryService();