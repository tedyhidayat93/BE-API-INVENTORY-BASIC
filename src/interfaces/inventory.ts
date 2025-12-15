import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { Product } from './product.js';
import { Warehouse } from './warehouse.js';
import { User } from './user.js';
import { stockMovements } from '../db/schema/stock-movements.js';
import { stocks } from '../db/schema/stocks.js';



// Stock Types
export type Stock = InferSelectModel<typeof stocks> & {
  product?: Product;
  warehouse?: Warehouse;
};

export type NewStock = InferInsertModel<typeof stocks>;

// Stock Movement Types
export type StockMovementType = 'in' | 'out' | 'transfer' | 'adjustment';

export type StockMovement = InferSelectModel<typeof stockMovements> & {
  product?: Product;
  fromWarehouse?: Warehouse | null;
  toWarehouse?: Warehouse | null;
  createdByUser?: User | null;
};

export type NewStockMovement = InferInsertModel<typeof stockMovements>;

export interface StockMovementFilters {
  productId?: string;
  warehouseId?: string;
  type?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface StockLevelAlert {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: number;
  minimumQuantity: number;
  status: 'low' | 'critical' | 'out-of-stock';
}

export interface InventoryStats {
  totalProducts: number;
  totalStockItems: number;
  totalWarehouses: number;
  lowStockAlerts: number;
  outOfStockItems: number;
  recentMovements: StockMovement[];
}

export interface InventoryItem {
    productId: string;
    warehouseId: string;
    quantity: number;
}

export interface UpdateInventoryItem extends Partial<InventoryItem> {}
