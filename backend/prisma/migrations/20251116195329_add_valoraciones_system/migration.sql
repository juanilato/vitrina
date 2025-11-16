-- CreateEnum
CREATE TYPE "public"."AspectosEmpresa" AS ENUM ('EXCELENTE_CALIDAD', 'BUENA_PRESENTACION', 'PORCIONES_GENEROSAS', 'RAPIDO', 'BUENA_ATENCION', 'BUENA_RELACION_PRECIO_CALIDAD', 'MUY_RICO', 'FRESCO', 'BIEN_EMPAQUETADO');

-- CreateEnum
CREATE TYPE "public"."AspectosRepartidor" AS ENUM ('PUNTUAL', 'AMABLE', 'CUIDADOSO', 'BUENA_COMUNICACION', 'PROFESIONAL');

-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "entregadoAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Valoracion" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "repartidorId" TEXT,
    "calificacionEmpresa" INTEGER NOT NULL,
    "comentarioEmpresa" TEXT,
    "aspectosEmpresa" "public"."AspectosEmpresa"[] DEFAULT ARRAY[]::"public"."AspectosEmpresa"[],
    "valoracionProductos" JSONB,
    "calificacionRepartidor" INTEGER,
    "comentarioRepartidor" TEXT,
    "aspectosRepartidor" "public"."AspectosRepartidor"[] DEFAULT ARRAY[]::"public"."AspectosRepartidor"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Valoracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Valoracion_pedidoId_key" ON "public"."Valoracion"("pedidoId");

-- CreateIndex
CREATE INDEX "Valoracion_empresaId_calificacionEmpresa_idx" ON "public"."Valoracion"("empresaId", "calificacionEmpresa");

-- CreateIndex
CREATE INDEX "Valoracion_clienteId_idx" ON "public"."Valoracion"("clienteId");

-- CreateIndex
CREATE INDEX "Valoracion_repartidorId_idx" ON "public"."Valoracion"("repartidorId");

-- CreateIndex
CREATE INDEX "Valoracion_createdAt_idx" ON "public"."Valoracion"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Valoracion" ADD CONSTRAINT "Valoracion_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Valoracion" ADD CONSTRAINT "Valoracion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Valoracion" ADD CONSTRAINT "Valoracion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Valoracion" ADD CONSTRAINT "Valoracion_repartidorId_fkey" FOREIGN KEY ("repartidorId") REFERENCES "public"."Repartidor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
