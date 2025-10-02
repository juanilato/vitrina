-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM');

-- CreateTable
CREATE TABLE "public"."Preferencias" (
    "empresaId" TEXT NOT NULL,
    "colorBotones" TEXT,
    "colorFondo" TEXT,
    "envioDomicilio" BOOLEAN NOT NULL DEFAULT false,
    "dashboardFoto" TEXT,

    CONSTRAINT "Preferencias_pkey" PRIMARY KEY ("empresaId")
);

-- CreateTable
CREATE TABLE "public"."HorarioAtencion" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "day" "public"."DayOfWeek" NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "abreMin" INTEGER NOT NULL,
    "cierraMin" INTEGER NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HorarioAtencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mensaje" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "remitenteId" TEXT NOT NULL,
    "remitenteTipo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "enviadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "leidoAt" TIMESTAMP(3),

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HorarioAtencion_empresaId_day_slotIndex_key" ON "public"."HorarioAtencion"("empresaId", "day", "slotIndex");

-- CreateIndex
CREATE INDEX "Mensaje_pedidoId_enviadoAt_idx" ON "public"."Mensaje"("pedidoId", "enviadoAt");

-- CreateIndex
CREATE INDEX "Mensaje_remitenteId_remitenteTipo_idx" ON "public"."Mensaje"("remitenteId", "remitenteTipo");

-- AddForeignKey
ALTER TABLE "public"."Preferencias" ADD CONSTRAINT "Preferencias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HorarioAtencion" ADD CONSTRAINT "HorarioAtencion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Preferencias"("empresaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensaje" ADD CONSTRAINT "Mensaje_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
