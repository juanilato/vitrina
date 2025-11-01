-- CreateTable
CREATE TABLE "public"."UbicacionCliente" (
    "id" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "referencia" TEXT,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UbicacionCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UbicacionCliente_clienteId_idx" ON "public"."UbicacionCliente"("clienteId");

-- CreateIndex
CREATE INDEX "UbicacionCliente_clienteId_esPrincipal_idx" ON "public"."UbicacionCliente"("clienteId", "esPrincipal");

-- AddForeignKey
ALTER TABLE "public"."UbicacionCliente" ADD CONSTRAINT "UbicacionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
