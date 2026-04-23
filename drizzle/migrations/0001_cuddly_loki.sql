CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"checksum" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"petId" integer NOT NULL,
	"mediaId" integer NOT NULL,
	"sequence" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "pet_media" ADD CONSTRAINT "pet_media_petId_pets_id_fk" FOREIGN KEY ("petId") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_media" ADD CONSTRAINT "pet_media_mediaId_media_id_fk" FOREIGN KEY ("mediaId") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;