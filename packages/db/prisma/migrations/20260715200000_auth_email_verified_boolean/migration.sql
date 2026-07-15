-- Align User.emailVerified with better-auth (boolean, not timestamp).
-- Ensure name is non-null for better-auth core schema.

ALTER TABLE "users" ADD COLUMN "emailVerified_bool" BOOLEAN NOT NULL DEFAULT false;
UPDATE "users" SET "emailVerified_bool" = ("emailVerified" IS NOT NULL);
ALTER TABLE "users" DROP COLUMN "emailVerified";
ALTER TABLE "users" RENAME COLUMN "emailVerified_bool" TO "emailVerified";

UPDATE "users" SET "name" = '' WHERE "name" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
