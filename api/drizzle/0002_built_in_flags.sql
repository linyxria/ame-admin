ALTER TABLE "menu" ADD COLUMN "builtIn" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "builtIn" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "builtIn" boolean DEFAULT false NOT NULL;
