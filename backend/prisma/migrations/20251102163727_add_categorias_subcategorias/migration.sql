-- AlterTable
ALTER TABLE "public"."Empresa" ADD COLUMN     "categoriaId" TEXT,
ADD COLUMN     "subcategoriaId" TEXT;

-- CreateTable
CREATE TABLE "public"."Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subcategoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "public"."Categoria"("nombre");

-- CreateIndex
CREATE INDEX "Categoria_activo_orden_idx" ON "public"."Categoria"("activo", "orden");

-- CreateIndex
CREATE INDEX "Subcategoria_categoriaId_activo_orden_idx" ON "public"."Subcategoria"("categoriaId", "activo", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategoria_categoriaId_nombre_key" ON "public"."Subcategoria"("categoriaId", "nombre");

-- CreateIndex
CREATE INDEX "Empresa_categoriaId_idx" ON "public"."Empresa"("categoriaId");

-- CreateIndex
CREATE INDEX "Empresa_subcategoriaId_idx" ON "public"."Empresa"("subcategoriaId");

-- AddForeignKey
ALTER TABLE "public"."Subcategoria" ADD CONSTRAINT "Subcategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Empresa" ADD CONSTRAINT "Empresa_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Empresa" ADD CONSTRAINT "Empresa_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "public"."Subcategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
