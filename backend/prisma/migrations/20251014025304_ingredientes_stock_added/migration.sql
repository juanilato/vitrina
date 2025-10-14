-- AlterTable
ALTER TABLE "public"."Productos" ADD COLUMN     "permiteExtras" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stockIndividual" INTEGER,
ADD COLUMN     "tipoStock" TEXT NOT NULL DEFAULT 'individual';

-- CreateTable
CREATE TABLE "public"."Ingrediente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "stockDisponible" INTEGER NOT NULL,
    "unidadMedida" TEXT NOT NULL,

    CONSTRAINT "Ingrediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductoIngrediente" (
    "id" SERIAL NOT NULL,
    "productoId" TEXT NOT NULL,
    "ingredienteId" TEXT NOT NULL,
    "cantidadRequerida" INTEGER NOT NULL,
    "esExtraPermitido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductoIngrediente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ingrediente_empresaId_idx" ON "public"."Ingrediente"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingrediente_empresaId_nombre_key" ON "public"."Ingrediente"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "ProductoIngrediente_productoId_idx" ON "public"."ProductoIngrediente"("productoId");

-- CreateIndex
CREATE INDEX "ProductoIngrediente_ingredienteId_idx" ON "public"."ProductoIngrediente"("ingredienteId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoIngrediente_productoId_ingredienteId_key" ON "public"."ProductoIngrediente"("productoId", "ingredienteId");

-- AddForeignKey
ALTER TABLE "public"."ProductoIngrediente" ADD CONSTRAINT "ProductoIngrediente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductoIngrediente" ADD CONSTRAINT "ProductoIngrediente_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "public"."Ingrediente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
