/*
  Warnings:

  - You are about to alter the column `precio` on the `Productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - The `pendingUserData` column on the `VerificationCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[empresaId,nombre]` on the table `Productos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,userType,code]` on the table `VerificationCode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Empresa" ALTER COLUMN "logo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Productos" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."VerificationCode" DROP COLUMN "pendingUserData",
ADD COLUMN     "pendingUserData" JSONB;

-- CreateTable
CREATE TABLE "public"."Pedido" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pedido_clienteId_idx" ON "public"."Pedido"("clienteId");

-- CreateIndex
CREATE INDEX "Pedido_empresaId_idx" ON "public"."Pedido"("empresaId");

-- CreateIndex
CREATE INDEX "Pedido_estado_createdAt_idx" ON "public"."Pedido"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "ItemPedido_pedidoId_idx" ON "public"."ItemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedido_productoId_idx" ON "public"."ItemPedido"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPedido_pedidoId_productoId_key" ON "public"."ItemPedido"("pedidoId", "productoId");

-- CreateIndex
CREATE INDEX "Productos_empresaId_idx" ON "public"."Productos"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Productos_empresaId_nombre_key" ON "public"."Productos"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "VerificationCode_expiresAt_idx" ON "public"."VerificationCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_email_userType_code_key" ON "public"."VerificationCode"("email", "userType", "code");

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemPedido" ADD CONSTRAINT "ItemPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
