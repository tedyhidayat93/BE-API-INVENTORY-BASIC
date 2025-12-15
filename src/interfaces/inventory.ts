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
export const STOCK_MOVEMENT_TYPES = [
    'IN',
    'OUT',
    'TRANSFER',
    'ADJUSTMENT',
] as const;

export type StockMovementType = typeof STOCK_MOVEMENT_TYPES[number];


export const STOCK_OPNAME_STATUSES = [
    'DRAFT',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'ADJUSTED',
] as const;

export type StockOpnameStatus = typeof STOCK_OPNAME_STATUSES[number];

// export type StockMovement = InferSelectModel<typeof stockMovements> & {
//   product?: Product;
//   fromWarehouse?: Warehouse | null;
//   toWarehouse?: Warehouse | null;
//   createdByUser?: User | null;
// };

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

export interface InventoryItem {
    id: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    updatedAt: Date;
    product?: Product;
    warehouse?: Warehouse;
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

export interface StockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  referenceId?: string;
  notes?: string;
  createdBy: string;
}

export interface StockMovement extends Omit<StockMovementInput, 'createdBy'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface StockOpnameItemInput {
  productId: string;
  systemQuantity: number;
  physicalQuantity: number;
  notes?: string;
}

export interface StockOpnameInput {
  warehouseId: string;
  countDate: Date;
  notes?: string;
  items: StockOpnameItemInput[];
  createdBy: string;
}

export interface StockOpname extends Omit<StockOpnameInput, 'items' | 'createdBy'> {
  id: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ADJUSTED';
  referenceNumber: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  items: StockOpnameItem[];
}

export interface StockOpnameItem extends StockOpnameItemInput {
  id: string;
  stockOpnameId: string;
  difference: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalWarehouses: number;
  totalStockValue: number;
  lowStockAlerts: number;
  outOfStockItems: number;
  recentMovements: StockMovement[];
}