-- CreateEnum
CREATE TYPE "public"."VinculoEstado" AS ENUM ('PENDIENTE', 'ACEPTADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "repartidorId" TEXT;

-- CreateTable
CREATE TABLE "public"."Repartidor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "password" TEXT NOT NULL,
    "codigoVinculo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repartidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmpresaRepartidor" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "repartidorId" TEXT NOT NULL,
    "estado" "public"."VinculoEstado" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "EmpresaRepartidor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repartidor_correo_key" ON "public"."Repartidor"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Repartidor_codigoVinculo_key" ON "public"."Repartidor"("codigoVinculo");

-- AddForeignKey
ALTER TABLE "public"."EmpresaRepartidor" ADD CONSTRAINT "EmpresaRepartidor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmpresaRepartidor" ADD CONSTRAINT "EmpresaRepartidor_repartidorId_fkey" FOREIGN KEY ("repartidorId") REFERENCES "public"."Repartidor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_repartidorId_fkey" FOREIGN KEY ("repartidorId") REFERENCES "public"."Repartidor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
