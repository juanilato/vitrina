-- CreateEnum
CREATE TYPE "public"."EstadoSuscripcion" AS ENUM ('ACTIVA', 'CANCELADA', 'SUSPENDIDA', 'VENCIDA', 'PENDIENTE_PAGO');

-- CreateEnum
CREATE TYPE "public"."TipoMetodoPago" AS ENUM ('TARJETA_CREDITO', 'TARJETA_DEBITO', 'PAYPAL', 'TRANSFERENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."EstadoPago" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."PlanSuscripcion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "intervalo" TEXT NOT NULL DEFAULT 'mensual',
    "limites" JSONB NOT NULL,
    "caracteristicas" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esPopular" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanSuscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Suscripcion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "estado" "public"."EstadoSuscripcion" NOT NULL DEFAULT 'ACTIVA',
    "inicioAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizaAt" TIMESTAMP(3),
    "canceladaAt" TIMESTAMP(3),
    "renovacionAuto" BOOLEAN NOT NULL DEFAULT true,
    "metodoPagoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MetodoPago" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "public"."TipoMetodoPago" NOT NULL,
    "ultimos4" TEXT,
    "marca" TEXT,
    "expiraMes" INTEGER,
    "expiraAnio" INTEGER,
    "tokenProcesador" TEXT,
    "procesador" TEXT DEFAULT 'stripe',
    "metadata" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esPredeterminado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetodoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pago" (
    "id" TEXT NOT NULL,
    "suscripcionId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "metodoPagoId" TEXT,
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "estado" "public"."EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "referenciaExterna" TEXT,
    "procesador" TEXT,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFin" TIMESTAMP(3) NOT NULL,
    "numeroFactura" TEXT,
    "urlFactura" TEXT,
    "fechaPago" TIMESTAMP(3),
    "intentosRetry" INTEGER NOT NULL DEFAULT 0,
    "proximoRetry" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanSuscripcion_nombre_key" ON "public"."PlanSuscripcion"("nombre");

-- CreateIndex
CREATE INDEX "PlanSuscripcion_activo_orden_idx" ON "public"."PlanSuscripcion"("activo", "orden");

-- CreateIndex
CREATE INDEX "Suscripcion_empresaId_idx" ON "public"."Suscripcion"("empresaId");

-- CreateIndex
CREATE INDEX "Suscripcion_planId_idx" ON "public"."Suscripcion"("planId");

-- CreateIndex
CREATE INDEX "Suscripcion_estado_idx" ON "public"."Suscripcion"("estado");

-- CreateIndex
CREATE INDEX "Suscripcion_finalizaAt_idx" ON "public"."Suscripcion"("finalizaAt");

-- CreateIndex
CREATE UNIQUE INDEX "MetodoPago_tokenProcesador_key" ON "public"."MetodoPago"("tokenProcesador");

-- CreateIndex
CREATE INDEX "MetodoPago_empresaId_idx" ON "public"."MetodoPago"("empresaId");

-- CreateIndex
CREATE INDEX "MetodoPago_activo_idx" ON "public"."MetodoPago"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_referenciaExterna_key" ON "public"."Pago"("referenciaExterna");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_numeroFactura_key" ON "public"."Pago"("numeroFactura");

-- CreateIndex
CREATE INDEX "Pago_suscripcionId_idx" ON "public"."Pago"("suscripcionId");

-- CreateIndex
CREATE INDEX "Pago_empresaId_idx" ON "public"."Pago"("empresaId");

-- CreateIndex
CREATE INDEX "Pago_estado_idx" ON "public"."Pago"("estado");

-- CreateIndex
CREATE INDEX "Pago_fechaPago_idx" ON "public"."Pago"("fechaPago");

-- CreateIndex
CREATE INDEX "Pago_periodoInicio_periodoFin_idx" ON "public"."Pago"("periodoInicio", "periodoFin");

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."PlanSuscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Suscripcion" ADD CONSTRAINT "Suscripcion_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "public"."MetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MetodoPago" ADD CONSTRAINT "MetodoPago_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "public"."Suscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "public"."MetodoPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;
