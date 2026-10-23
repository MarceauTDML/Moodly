-- CreateEnum
CREATE TYPE "TwoFactorMethod" AS ENUM ('TOTP', 'EMAIL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "twoFactorAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twoFactorCodeExpiry" TIMESTAMP(3),
ADD COLUMN     "twoFactorCodeHash" TEXT,
ADD COLUMN     "twoFactorLastStep" INTEGER,
ADD COLUMN     "twoFactorLockedUntil" TIMESTAMP(3),
ADD COLUMN     "twoFactorMethod" "TwoFactorMethod",
ADD COLUMN     "twoFactorPendingMethod" "TwoFactorMethod",
ADD COLUMN     "twoFactorPendingSecret" TEXT,
ADD COLUMN     "twoFactorRecoveryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "twoFactorSecret" TEXT;

