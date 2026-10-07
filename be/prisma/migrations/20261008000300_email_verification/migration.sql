-- DB hardening part 3: email verification and password reset (one-time tokens sent by email).
-- An account can sign in only once it has proven it owns its email address.

-- CreateEnum
CREATE TYPE "AuthTokenPurpose" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "purpose" "AuthTokenPurpose" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_hash_key" ON "auth_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "auth_tokens_user_id_purpose_created_at_idx" ON "auth_tokens"("user_id", "purpose", "created_at");

-- CreateIndex
CREATE INDEX "auth_tokens_expires_at_idx" ON "auth_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Google accounts proved their email through Google (only verified Google emails are accepted).
-- Password accounts created before this migration must verify through POST /api/auth/verify-email/resend.
UPDATE "users" SET "email_verified_at" = "created_at" WHERE "google_id" IS NOT NULL;

-- At most one usable token per user and purpose: issuing a new one consumes the previous one in the same transaction.
CREATE UNIQUE INDEX "auth_tokens_one_active_per_purpose" ON "auth_tokens"("user_id", "purpose") WHERE "consumed_at" IS NULL;
ALTER TABLE "auth_tokens" ADD CONSTRAINT "chk_auth_tokens_expiry" CHECK ("expires_at" > "created_at");
