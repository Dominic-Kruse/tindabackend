import { Request, Response } from "express"
import { db } from "../db"
import { stalls, images, reviews, vendors } from "../db/schema"
import { eq, avg, and } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"


// GET /api/stalls
export async function getStalls(req: Request, res: Response) {
  try {
    const bannerImages = alias(images, "banner_images")
    const iconImages = alias(images, "icon_images")

    const stallCards = await db
      .select({
        stall_id: stalls.stall_id,
        stall_name: stalls.stall_name,
        vendor_name: vendors.business_name,
        vendor_contact: vendors.vendor_contact,
        stall_description: stalls.stall_description,
        category: stalls.category,
        location: stalls.stall_address,
        banner_photo: bannerImages.image_url,
        stall_icon: iconImages.image_url,
        rating: avg(reviews.rating),
      })
      .from(stalls)
      .leftJoin(reviews, eq(stalls.stall_id, reviews.stall_id))
      .leftJoin(vendors, eq(stalls.user_id, vendors.user_id))
      .leftJoin(
        bannerImages,
        and(
          eq(stalls.stall_id, bannerImages.stall_id),
          eq(bannerImages.image_type, "banner")
        )
      )
      .leftJoin(
        iconImages,
        and(
          eq(stalls.stall_id, iconImages.stall_id),
          eq(iconImages.image_type, "icon")
        )
      )
      .groupBy(
        stalls.stall_id,
        vendors.business_name,
        vendors.vendor_contact,
        bannerImages.image_url,
        iconImages.image_url
      )

    res.status(200).json(stallCards)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// POST /api/stallsimport { Request, Response } from "express";


export const createStall = async (req: Request, res: Response) => {
  try {
    const {
      stall_name,
      category,
      stall_description,
      stall_address,
      stall_city,
      stall_state,
      stall_zipcode,
      user_id,
    } = req.body;

    if (!stall_name || !category || !stall_description || !stall_address || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    // Files now have extensions! e.g., "1234567890.png"
    const bannerPath = files?.banner_image?.[0]?.filename || null;
    const iconPath = files?.icon_image?.[0]?.filename || null;

    console.log('Uploaded files:', {
      banner: bannerPath,
      icon: iconPath
    });

    // 1️⃣ Create stall
    const [newStall] = await db
      .insert(stalls)
      .values({
        stall_name,
        category,
        stall_description,
        stall_address,
        stall_city,
        stall_state,
        stall_zip_code: stall_zipcode,
        user_id: Number(user_id),
      })
      .returning({ stall_id: stalls.stall_id });

    const stallId = newStall!.stall_id;

    // 2️⃣ Insert images with correct paths
    if (bannerPath) {
      await db.insert(images).values({
        stall_id: stallId,
        image_url: `uploads/${bannerPath}`, // Now includes extension!
        image_type: "banner",
        entity_type: "stall",
      });
    }

    if (iconPath) {
      await db.insert(images).values({
        stall_id: stallId,
        image_url: `uploads/${iconPath}`, // Now includes extension!
        image_type: "icon",
        entity_type: "stall",
      });
    }

    res.status(201).json({
      message: "Stall created successfully",
      stall_id: stallId,
    });
  } catch (err) {
    console.error("Error creating stall:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
