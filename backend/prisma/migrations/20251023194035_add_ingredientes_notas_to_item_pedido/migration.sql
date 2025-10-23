-- DropIndex
DROP INDEX "public"."ItemPedido_pedidoId_productoId_key";

-- AlterTable
ALTER TABLE "public"."ItemPedido" ADD COLUMN     "ingredientesExtras" JSONB,
ADD COLUMN     "notas" TEXT;
