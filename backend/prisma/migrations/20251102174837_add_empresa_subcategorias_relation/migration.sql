/*
  Warnings:

  - You are about to drop the column `subcategoriaId` on the `Empresa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Empresa" DROP CONSTRAINT "Empresa_subcategoriaId_fkey";

-- DropIndex
DROP INDEX "public"."Empresa_subcategoriaId_idx";

-- AlterTable
ALTER TABLE "public"."Empresa" DROP COLUMN "subcategoriaId";

-- CreateTable
CREATE TABLE "public"."EmpresaSubcategoria" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "subcategoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaSubcategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmpresaSubcategoria_empresaId_idx" ON "public"."EmpresaSubcategoria"("empresaId");

-- CreateIndex
CREATE INDEX "EmpresaSubcategoria_subcategoriaId_idx" ON "public"."EmpresaSubcategoria"("subcategoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaSubcategoria_empresaId_subcategoriaId_key" ON "public"."EmpresaSubcategoria"("empresaId", "subcategoriaId");

-- AddForeignKey
ALTER TABLE "public"."EmpresaSubcategoria" ADD CONSTRAINT "EmpresaSubcategoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmpresaSubcategoria" ADD CONSTRAINT "EmpresaSubcategoria_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "public"."Subcategoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
