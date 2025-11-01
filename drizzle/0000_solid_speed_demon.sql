CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'order_inquiry', 'price_negotiation', 'delivery_question', 'product_question', 'complaint', 'review');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('vendor', 'buyer');--> statement-breakpoint
CREATE TABLE "buyers" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"buyer_description" text,
	"buyer_latitude" numeric(9, 6),
	"buyer_longitude" numeric(9, 6),
	"buyer_address" text,
	"buyer_city" varchar(100),
	"buyer_state" varchar(100),
	"buyer_zip_code" varchar(20),
	"buyer_country" varchar(100) DEFAULT 'Philippines',
	"suki_count" integer DEFAULT 0,
	"suki_rank" varchar(50) DEFAULT 'bronze',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"conversation_id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"stall_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(1024) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"image_type" varchar(50) NOT NULL,
	"user_id" integer,
	"stall_id" integer,
	"item_id" integer,
	"message_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_items" (
	"line_item_id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer,
	"order_id" integer,
	"item_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_user_id" integer NOT NULL,
	"content" text NOT NULL,
	"message_type" "message_type" DEFAULT 'text' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer NOT NULL,
	"stall_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"payment_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"payer_buyer_id" integer,
	"stall_id" integer,
	"amount" numeric(14, 2) NOT NULL,
	"method" varchar(100) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"external_ref" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer,
	"stall_id" integer,
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revoked_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"jwt_token" text NOT NULL,
	"revoked_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "revoked_tokens_jwt_token_unique" UNIQUE("jwt_token")
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"sale_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"payment_id" integer,
	"stall_id" integer NOT NULL,
	"total_amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopping_carts" (
	"cart_id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stall_items" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"stall_id" integer,
	"item_name" varchar(250) NOT NULL,
	"item_description" text,
	"price" numeric(12, 2) NOT NULL,
	"item_stocks" integer DEFAULT 0,
	"in_stock" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stalls" (
	"stall_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"stall_name" varchar(100) NOT NULL,
	"stall_description" text,
	"category" varchar(100) NOT NULL,
	"stall_latitude" numeric(9, 6),
	"stall_longitude" numeric(9, 6),
	"stall_address" text,
	"stall_city" varchar(100),
	"stall_state" varchar(100),
	"stall_zip_code" varchar(20),
	"stall_country" varchar(100) DEFAULT 'Philippines',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"business_name" varchar(255),
	"vendor_contact" varchar(255),
	"vendor_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_buyers_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_vendor_id_vendors_user_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_item_id_stall_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."stall_items"("item_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_cart_id_shopping_carts_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."shopping_carts"("cart_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_item_id_stall_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."stall_items"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_users_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_buyers_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_buyer_id_buyers_user_id_fk" FOREIGN KEY ("payer_buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_buyers_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_payment_id_payments_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("payment_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_buyer_id_buyers_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stall_items" ADD CONSTRAINT "stall_items_stall_id_stalls_stall_id_fk" FOREIGN KEY ("stall_id") REFERENCES "public"."stalls"("stall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_user_id_vendors_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vendors"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_buyer_vendor_idx" ON "conversations" USING btree ("buyer_id","vendor_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "orders_buyer_stall_idx" ON "orders" USING btree ("buyer_id","stall_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_stall_date_idx" ON "sales" USING btree ("stall_id","created_at");--> statement-breakpoint
CREATE INDEX "stall_items_stall_id_idx" ON "stall_items" USING btree ("stall_id");--> statement-breakpoint
CREATE INDEX "stall_items_price_idx" ON "stall_items" USING btree ("price");