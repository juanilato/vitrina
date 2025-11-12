-- AlterTable
ALTER TABLE "public"."Cliente" ADD COLUMN     "authMethod" TEXT NOT NULL DEFAULT 'normal';

-- AlterTable
ALTER TABLE "public"."Empresa" ADD COLUMN     "authMethod" TEXT NOT NULL DEFAULT 'normal';

-- AlterTable
ALTER TABLE "public"."Repartidor" ADD COLUMN     "authMethod" TEXT NOT NULL DEFAULT 'normal';
