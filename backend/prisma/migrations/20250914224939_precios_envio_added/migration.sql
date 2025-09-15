-- CreateTable
CREATE TABLE "public"."PreciosEnvio" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "distancia" DOUBLE PRECISION NOT NULL,
    "ubicacionId" INTEGER NOT NULL,

    CONSTRAINT "PreciosEnvio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreciosEnvio_empresaId_key" ON "public"."PreciosEnvio"("empresaId");

-- AddForeignKey
ALTER TABLE "public"."PreciosEnvio" ADD CONSTRAINT "PreciosEnvio_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "public"."Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
