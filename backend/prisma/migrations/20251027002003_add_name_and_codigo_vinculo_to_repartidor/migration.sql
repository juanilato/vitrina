/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `Repartidor` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Repartidor` table. All the data in the column will be lost.
  - Added the required column `name` to the `Repartidor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Repartidor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Repartidor" DROP COLUMN "creadoEn",
DROP COLUMN "nombre",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
