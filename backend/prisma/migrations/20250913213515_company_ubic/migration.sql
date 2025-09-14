-- CreateTable
CREATE TABLE "public"."Ubicacion" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "direccion" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Ubicacion" ADD CONSTRAINT "Ubicacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
