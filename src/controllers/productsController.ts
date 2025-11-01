import { Request, Response } from 'express';
import { db } from '../db';
import { stall_items, images } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export async function getProducts(req: Request, res: Response) {
    try {
        const productImages = alias(images, 'product_images');

        const products = await db
            .select({
                product_id: stall_items.item_id,
                product_name: stall_items.item_name,
                description: stall_items.item_description,
                price: stall_items.price,
                stock: stall_items.item_stocks,
                stall_id: stall_items.stall_id,
                product_image: productImages.image_url,
            })
            .from(stall_items)
            .leftJoin(
                productImages,
                and(
                    eq(stall_items.item_id, productImages.item_id),
                    eq(productImages.image_type, 'thumbnail') // Assuming 'thumbnail' for product images
                )
            );

        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
