-- AlterTable
ALTER TABLE "public"."Empresa" ADD COLUMN     "tiempoExtraPorPedido" INTEGER DEFAULT 2,
ADD COLUMN     "tiempoPreparacionBase" INTEGER DEFAULT 15;

-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "fechaEntregaEstimada" TIMESTAMP(3),
ADD COLUMN     "tiempoAsignacionEstimado" INTEGER,
ADD COLUMN     "tiempoEntregaEstimado" INTEGER,
ADD COLUMN     "tiempoPreparacionEstimado" INTEGER,
ADD COLUMN     "tiempoRecojoEstimado" INTEGER,
ADD COLUMN     "tiempoTotalEstimado" INTEGER;

-- AlterTable
ALTER TABLE "public"."Repartidor" ADD COLUMN     "tipoVehiculo" TEXT DEFAULT 'moto',
ADD COLUMN     "velocidadPromedio" DOUBLE PRECISION DEFAULT 25.0;
