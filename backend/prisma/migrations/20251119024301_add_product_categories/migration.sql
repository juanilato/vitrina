-- CreateTable
CREATE TABLE "public"."CategoriaProducto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductoCategoria" (
    "id" SERIAL NOT NULL,
    "productoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductoCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoriaProducto_empresaId_activo_orden_idx" ON "public"."CategoriaProducto"("empresaId", "activo", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaProducto_empresaId_nombre_key" ON "public"."CategoriaProducto"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "ProductoCategoria_productoId_idx" ON "public"."ProductoCategoria"("productoId");

-- CreateIndex
CREATE INDEX "ProductoCategoria_categoriaId_idx" ON "public"."ProductoCategoria"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoCategoria_productoId_categoriaId_key" ON "public"."ProductoCategoria"("productoId", "categoriaId");

-- AddForeignKey
ALTER TABLE "public"."ProductoCategoria" ADD CONSTRAINT "ProductoCategoria_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductoCategoria" ADD CONSTRAINT "ProductoCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."CategoriaProducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
