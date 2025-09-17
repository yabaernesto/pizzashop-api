ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_restaurants_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."restaurants"("id") ON DELETE set null ON UPDATE no action;