-- CreateTable
CREATE TABLE "public"."PreferenciasCliente" (
    "clienteId" TEXT NOT NULL,
    "temaOscuro" BOOLEAN NOT NULL DEFAULT false,
    "notificacionesPush" BOOLEAN NOT NULL DEFAULT true,
    "notificacionesEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificarEstadoPedidos" BOOLEAN NOT NULL DEFAULT true,
    "notificarPromociones" BOOLEAN NOT NULL DEFAULT true,
    "compartirUbicacion" BOOLEAN NOT NULL DEFAULT true,
    "historialComprasVisible" BOOLEAN NOT NULL DEFAULT true,
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferenciasCliente_pkey" PRIMARY KEY ("clienteId")
);

-- AddForeignKey
ALTER TABLE "public"."PreferenciasCliente" ADD CONSTRAINT "PreferenciasCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
