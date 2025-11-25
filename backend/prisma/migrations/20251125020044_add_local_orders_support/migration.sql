-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "mesaNumero" TEXT,
ADD COLUMN     "nombreClienteLocal" TEXT,
ADD COLUMN     "origenPedido" TEXT NOT NULL DEFAULT 'app',
ALTER COLUMN "clienteId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Pedido_origenPedido_empresaId_idx" ON "public"."Pedido"("origenPedido", "empresaId");
