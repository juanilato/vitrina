-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "costoEnvio" DECIMAL(12,2),
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "subtotal" DECIMAL(12,2),
ADD COLUMN     "total" DECIMAL(12,2);
