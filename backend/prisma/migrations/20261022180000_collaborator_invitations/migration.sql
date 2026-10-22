-- Nullable columns preserve existing active accounts and all mood data.
ALTER TABLE "users"
  ADD COLUMN "invitationToken" TEXT,
  ADD COLUMN "invitationTokenExpiry" TIMESTAMP(3),
  ADD COLUMN "invitationSentAt" TIMESTAMP(3);
