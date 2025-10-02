/*
  Warnings:

  - A unique constraint covering the columns `[ubicacionId,distancia]` on the table `PreciosEnvio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId]` on the table `Ubicacion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."PreciosEnvio_empresaId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PreciosEnvio_ubicacionId_distancia_key" ON "public"."PreciosEnvio"("ubicacionId", "distancia");

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_empresaId_key" ON "public"."Ubicacion"("empresaId");
