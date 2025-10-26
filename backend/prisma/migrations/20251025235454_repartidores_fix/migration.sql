/*
  Warnings:

  - You are about to drop the column `correo` on the `Repartidor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Repartidor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Repartidor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Repartidor_correo_key";

-- AlterTable
ALTER TABLE "public"."Repartidor" DROP COLUMN "correo",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Repartidor_email_key" ON "public"."Repartidor"("email");
