-- AlterTable
ALTER TABLE "public"."ItemPedido" ADD COLUMN     "descuento" DECIMAL(12,2),
ADD COLUMN     "promocionAplicada" TEXT;

-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "descuento" DECIMAL(12,2);
