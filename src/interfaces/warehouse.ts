import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { warehouses } from '../db/schema/warehouses.js';

export type Warehouse = InferSelectModel<typeof warehouses>;
export type NewWarehouse = InferInsertModel<typeof warehouses>;

export interface WarehouseWithStock extends Warehouse {
  stockCount?: number;
  productCount?: number;
}

export interface WarehouseStats {
  totalWarehouses: number;
  totalStockItems: number;
  totalProducts: number;
}

export interface CreateWarehouseInput {
    name: string;
    location?: string;
}

export interface UpdateWarehouseInput extends Partial<CreateWarehouseInput> {}
