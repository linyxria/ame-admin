CREATE TABLE "menu" (
	"id" text PRIMARY KEY NOT NULL,
	"parentId" text,
	"title" text NOT NULL,
	"path" text NOT NULL,
	"icon" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_menu" (
	"roleId" text NOT NULL,
	"menuId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_menu_roleId_menuId_pk" PRIMARY KEY("roleId","menuId")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"userId" text NOT NULL,
	"roleId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_userId_roleId_pk" PRIMARY KEY("userId","roleId")
);
--> statement-breakpoint
ALTER TABLE "role_menu" ADD CONSTRAINT "role_menu_roleId_role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_menu" ADD CONSTRAINT "role_menu_menuId_menu_id_fk" FOREIGN KEY ("menuId") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_roleId_role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "menu_parentId_idx" ON "menu" USING btree ("parentId");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_path_idx" ON "menu" USING btree ("path");--> statement-breakpoint
CREATE UNIQUE INDEX "role_code_idx" ON "role" USING btree ("code");--> statement-breakpoint
CREATE INDEX "role_menu_roleId_idx" ON "role_menu" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "role_menu_menuId_idx" ON "role_menu" USING btree ("menuId");--> statement-breakpoint
CREATE INDEX "user_role_userId_idx" ON "user_role" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_role_roleId_idx" ON "user_role" USING btree ("roleId");
