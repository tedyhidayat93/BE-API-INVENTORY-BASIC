import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { warehouses } from '../../db/schema/warehouses';
import { UpdateWarehouseInput, CreateWarehouseInput } from '../../interfaces/warehouse';

export class WarehouseService {
    async create(data: CreateWarehouseInput) {
        try {
            const [warehouse] = await db.insert(warehouses)
                .values({
                    name: data.name,
                    location: data.location || null,
                })
                .returning();
            return warehouse;
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error('Warehouse with this name already exists');
            }
            throw error;
        }
    }

    async findAll() {
        return await db.select().from(warehouses).orderBy(warehouses.name);
    }

    async findOne(id: string) {
        const [warehouse] = await db
            .select()
            .from(warehouses)
            .where(eq(warehouses.id, id));
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        return warehouse;
    }

    async update(id: string, data: UpdateWarehouseInput) {
        const [warehouse] = await db
            .update(warehouses)
            .set({
                ...data,
            })
            .where(eq(warehouses.id, id))
            .returning();

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        return warehouse;
    }

    async remove(id: string) {
        const [warehouse] = await db
            .delete(warehouses)
            .where(eq(warehouses.id, id))
            .returning();
            
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        return warehouse;
    }
}

export const warehouseService = new WarehouseService();