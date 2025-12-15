import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { products } from '../db/schema/products.js';

export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

export interface ProductWithStock extends Product {
  stockQuantity?: number;
  warehouseId?: string;
}

export interface CreateProductInput {
    name: string;
    sku: string;
    price: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
