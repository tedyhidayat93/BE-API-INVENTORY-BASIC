import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { products } from '../../db/schema/products';
import { CreateProductInput, UpdateProductInput } from '../../interfaces/product';

export class ProductService {
    async create(data: CreateProductInput) {
        try {
            const [product] = await db.insert(products)
                .values({
                    name: data.name,
                    sku: data.sku,
                    price: data.price.toString(),
                })
                .returning();
            return product;
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error('SKU already exists');
            }
            throw error;
        }
    }

    async findAll() {
        return await db.select().from(products).orderBy(products.name);
    }

    async findOne(id: string) {
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, id));
        
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async update(id: string, data: UpdateProductInput) {
        const updateData: any = { ...data };
        if (data.price !== undefined) {
            updateData.price = data.price.toString();
        }
        
        const [product] = await db
            .update(products)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(products.id, id))
            .returning();

        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async remove(id: string) {
        const [product] = await db
            .delete(products)
            .where(eq(products.id, id))
            .returning();
            
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async findBySku(sku: string) {
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.sku, sku));
        return product;
    }
}

export const productService = new ProductService();