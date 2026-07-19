-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_razorpayOrderId_idx" ON "orders"("razorpayOrderId");
