ALTER TABLE "stall_items" ADD COLUMN "image_url" varchar(1024);--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "logo_url";--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "banner_url";