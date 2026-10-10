-- DB hardening part 6: registration that does not reveal which emails have an account.
-- Registering an address whose account is not verified sends a link to choose the password (COMPLETE_SIGNUP) instead
-- of answering 409, so whoever registered the address first cannot keep it from its owner.
ALTER TYPE "AuthTokenPurpose" ADD VALUE 'COMPLETE_SIGNUP';

-- Every account has a way to sign in, and a Google account has proven its email (Google only hands out verified ones).
ALTER TABLE "users" ADD CONSTRAINT "chk_users_sign_in_method"
  CHECK ("password_hash" IS NOT NULL OR "google_id" IS NOT NULL);
ALTER TABLE "users" ADD CONSTRAINT "chk_users_google_verified"
  CHECK ("google_id" IS NULL OR "email_verified_at" IS NOT NULL);
