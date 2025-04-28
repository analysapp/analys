/*
  Warnings:

  - You are about to drop the column `content` on the `Legislation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Legislation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Legislation` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Legislation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Legislation` table. All the data in the column will be lost.
  - Added the required column `alturaMaxima` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coeficienteAproveitamento` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroPavimentosMaximo` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recuoFrontalMinimo` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recuoFundoMinimo` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recuoLateralMinimo` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxaOcupacao` to the `Legislation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoProjeto` to the `Legislation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Legislation" DROP COLUMN "content",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "alturaMaxima" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "coeficienteAproveitamento" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "numeroPavimentosMaximo" INTEGER NOT NULL,
ADD COLUMN     "recuoFrontalMinimo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "recuoFundoMinimo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "recuoLateralMinimo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "taxaOcupacao" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tipoProjeto" TEXT NOT NULL;
