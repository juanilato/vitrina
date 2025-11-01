-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "repartidorLat" DOUBLE PRECISION,
ADD COLUMN     "repartidorLng" DOUBLE PRECISION,
ADD COLUMN     "repartidorUltActualizacion" TIMESTAMP(3);
