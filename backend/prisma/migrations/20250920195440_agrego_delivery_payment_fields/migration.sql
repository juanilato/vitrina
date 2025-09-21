-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "formaPago" TEXT NOT NULL DEFAULT 'transferencia',
ADD COLUMN     "tipoEntrega" TEXT NOT NULL DEFAULT 'delivery';
