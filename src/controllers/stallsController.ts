import { Request, Response } from 'express';
import { db } from '../db';
import { stalls, images, reviews } from '../db/schema';
import { eq, avg, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export async function getStalls(req: Request, res: Response) {
    try {
        const bannerImages = alias(images, 'banner_images');
        const iconImages = alias(images, 'icon_images');

        const stallCards = await db
            .select({
                stall_id: stalls.stall_id,
                stall_name: stalls.stall_name,
                stall_description: stalls.stall_description,
                category: stalls.category,
                location: stalls.stall_address,
                banner_photo: bannerImages.image_url,
                stall_icon: iconImages.image_url,
                rating: avg(reviews.rating),
            })
            .from(stalls)
            .leftJoin(reviews, eq(stalls.stall_id, reviews.stall_id))
            .leftJoin(
                bannerImages,
                and(
                    eq(stalls.stall_id, bannerImages.stall_id),
                    eq(bannerImages.image_type, 'banner')
                )
            )
            .leftJoin(
                iconImages,
                and(
                    eq(stalls.stall_id, iconImages.stall_id),
                    eq(iconImages.image_type, 'icon')
                )
            )
            .groupBy(
                stalls.stall_id,
                bannerImages.image_url,
                iconImages.image_url
            );

        res.status(200).json(stallCards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
