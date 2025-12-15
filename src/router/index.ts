import express from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { productRouter } from '../modules/product/product.route';
import { warehouseRouter } from '../modules/warehouse/warehouse.route';
import { inventoryRouter } from '../modules/inventory/inventory.route';

export default function router(app: express.Application) {
    app.use('/auth', authRoutes);   
    app.use('/products', productRouter);
    app.use('/warehouses', warehouseRouter);
    app.use('/inventory', inventoryRouter);
}