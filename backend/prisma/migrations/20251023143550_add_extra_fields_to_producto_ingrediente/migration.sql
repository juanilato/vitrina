-- AlterTable
ALTER TABLE "public"."ProductoIngrediente" ADD COLUMN     "maximoExtra" INTEGER,
ADD COLUMN     "minimoExtra" INTEGER DEFAULT 1,
ADD COLUMN     "precioExtra" DECIMAL(12,2);
