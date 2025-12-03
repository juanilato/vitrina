-- CreateEnum
CREATE TYPE "public"."TipoPromocion" AS ENUM ('CANTIDAD', 'DIA', 'BXPY');

-- CreateEnum
CREATE TYPE "public"."AlcancePromocion" AS ENUM ('TODOS', 'SELECCIONADOS');

-- CreateTable
CREATE TABLE "public"."Promocion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "public"."TipoPromocion" NOT NULL,
    "configuracion" JSONB NOT NULL,
    "alcance" "public"."AlcancePromocion" NOT NULL DEFAULT 'TODOS',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromocionProducto" (
    "id" SERIAL NOT NULL,
    "promocionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "PromocionProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promocion_empresaId_idx" ON "public"."Promocion"("empresaId");

-- CreateIndex
CREATE INDEX "Promocion_activo_idx" ON "public"."Promocion"("activo");

-- CreateIndex
CREATE INDEX "PromocionProducto_promocionId_idx" ON "public"."PromocionProducto"("promocionId");

-- CreateIndex
CREATE INDEX "PromocionProducto_productoId_idx" ON "public"."PromocionProducto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "PromocionProducto_promocionId_productoId_key" ON "public"."PromocionProducto"("promocionId", "productoId");

-- AddForeignKey
ALTER TABLE "public"."Promocion" ADD CONSTRAINT "Promocion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromocionProducto" ADD CONSTRAINT "PromocionProducto_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "public"."Promocion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromocionProducto" ADD CONSTRAINT "PromocionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
