-- Add email login: backfill existing usernames, then enforce uniqueness.
ALTER TABLE "User" ADD COLUMN "email" TEXT;

UPDATE "User"
SET "email" = LOWER("username") || '@dispatch.local'
WHERE "email" IS NULL;

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
